import { log } from 'console';
import { pool } from '../../index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const insertConvertsToDB = async (fc_idx, start, end, ids) => {
  const formattedStart = start.replace(/(\d{2})(\d{2})(\d{2})/, '20$1-$2-$3');
  const formattedEnd = end.replace(/(\d{2})(\d{2})(\d{2})/, '20$1-$2-$3');
  const startDateTime = `${formattedStart} 00:00:00`;
  const endDateTime = `${formattedEnd} 23:59:59`;
  try {
    const facilityGroupsQuery = `select fg_idx, fg_name from tb_aasx_data_aas where fg_idx in (?)`;
    const [facilityGroups] = await pool.promise().query(facilityGroupsQuery, [ids]);

    if (facilityGroups.length === 0) {
      throw new Error('선택된 facility groups를 찾을 수 없습니다.');
    }

    const jsonStructure = {};

    for (const fg of facilityGroups) {
      const [fgaliases] = await pool.promise().query(`select as_en from tb_aasx_alias where as_kr = ?`, [fg.fg_name]);
      const facilityNameEn = fgaliases[0]?.as_en || fg.fg_name;

      jsonStructure[facilityNameEn] = {};

      const [facilities] = await pool
        .promise()
        .query(`select distinct fa_name from tb_aasx_sensor_info where fg_name = ?`, [fg.fg_name]);

      for (const facility of facilities) {
        const [faAliases] = await pool
          .promise()
          .query(`select as_en from tb_aasx_alias where as_kr = ?`, [facility.fa_name]);
        const facilityAliasEn = faAliases[0]?.as_en || facility.fa_name;

        jsonStructure[facilityNameEn][facilityAliasEn] = {};

        const [sensors] = await pool
          .promise()
          .query(`select * from tb_aasx_sensor_info where fg_name = ? and fa_name = ?`, [fg.fg_name, facility.fa_name]);

        for (const sensor of sensors) {
          const [snAliases] = await pool
            .promise()
            .query(`select as_en from tb_aasx_alias where as_kr = ?`, [sensor.sn_name]);
          const sensorNameEn = snAliases[0]?.as_en || sensor.sn_name;

          const [sensorDataRecords] = await pool.promise().query(
            `select ROUND(sn_compute_data, 2) as sn_compute_data, sd_createdAt 
            from tb_aasx_sensor_data 
            where mt_idx = ? and sd_createdAt between ? and ?
            order by sd_createdAt`,
            [sensor.mt_idx, startDateTime, endDateTime]
          );

          const snData = sensorDataRecords.map((record, idx) => {
            const timestamp = new Date(record.sd_createdAt);

            const formattedTimestamp =
              timestamp.getFullYear() +
              String(timestamp.getMonth() + 1).padStart(2, '0') +
              String(timestamp.getDate()).padStart(2, '0') +
              '_' +
              String(timestamp.getHours()).padStart(2, '0') +
              String(timestamp.getMinutes()).padStart(2, '0') +
              String(timestamp.getSeconds()).padStart(2, '0');
            return {
              Value: record.sn_compute_data,
              Timestamp: formattedTimestamp,
            };
          });

          if (!sensorDataRecords || snData.length === 0) {
            const now = new Date();
            const formattedNow =
              now.getFullYear() +
              String(now.getMonth() + 1).padStart(2, '0') +
              String(now.getDate()).padStart(2, '0') +
              '_' +
              String(now.getHours()).padStart(2, '0') +
              String(now.getMinutes()).padStart(2, '0') +
              String(now.getSeconds()).padStart(2, '0');

            snData.push({
              Value: 0.0,
              Timestamp: formattedNow,
            });
          }

          const unit = sensor.sn_unit || null;

          jsonStructure[facilityNameEn][facilityAliasEn][sensorNameEn] = {
            SN_Data: snData,
            Unit: unit,
          };
        }
      }
    }

    const jsonContent = JSON.stringify(jsonStructure, null, 2);
    const file_name = `제1공장-${start}-${end}.json`;
    const filePath = path.join(__dirname, '..', '..', 'files', 'front', file_name);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, jsonContent);

    const query = `insert into tb_aasx_file (fc_idx, af_kind, af_name, af_path) values (?, 1, ?, '/src/files/front')`;
    await pool.promise().query(query, [fc_idx, file_name]);
    console.log('JSON 파일 생성 및 DB 저장 완료');

    return { success: true, fileName: file_name, filePath: '/src/files/front' };
  } catch (err) {
    console.log('Failed to insert Edge Gateway: ', err);
    throw err;
  }
};
