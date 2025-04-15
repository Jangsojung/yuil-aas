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
    const [snRows] = await pool.promise().query(`SELECT sn_idx FROM tb_aasx_base_sensor WHERE ab_idx IN (?)`, [ids]);
    const snIdxList = snRows.map((row) => row.sn_idx);
    if (snIdxList.length === 0) throw new Error('선택된 base에 연결된 센서가 없습니다.');

    const [sensorInfos] = await pool.promise().query(
      `SELECT 
        si.mt_idx, si.sn_unit, 
        f.fc_name, 
        a.fg_name, 
        s.fa_name, 
        p.sn_name, 
        p.sn_idx
      FROM tb_aasx_data_prop p
      JOIN tb_aasx_data_sm s ON p.fa_idx = s.fa_idx
      JOIN tb_aasx_data_aas a ON s.fg_idx = a.fg_idx
      JOIN tb_aasx_data f ON a.fc_idx = f.fc_idx
      JOIN tb_aasx_sensor_info si ON si.fc_name = f.fc_name AND si.fg_name = a.fg_name 
                                  AND si.fa_name = s.fa_name AND si.sn_name = p.sn_name
      WHERE p.sn_idx IN (?)`,
      [snIdxList]
    );

    const jsonStructure = {};

    for (const sensor of sensorInfos) {
      const [[fgAlias]] = await pool
        .promise()
        .query(`SELECT as_en FROM tb_aasx_alias WHERE as_kr = ?`, [sensor.fg_name]);
      const [[faAlias]] = await pool
        .promise()
        .query(`SELECT as_en FROM tb_aasx_alias WHERE as_kr = ?`, [sensor.fa_name]);
      const [[snAlias]] = await pool
        .promise()
        .query(`SELECT as_en FROM tb_aasx_alias WHERE as_kr = ?`, [sensor.sn_name]);

      const fgNameEn = fgAlias?.as_en || sensor.fg_name;
      const faNameEn = faAlias?.as_en || sensor.fa_name;
      const snNameEn = snAlias?.as_en || sensor.sn_name;

      const [sensorData] = await pool.promise().query(
        `SELECT ROUND(sn_compute_data, 2) AS sn_compute_data, sd_createdAt 
         FROM tb_aasx_sensor_data 
         WHERE mt_idx = ? AND sd_createdAt BETWEEN ? AND ?
         ORDER BY sd_createdAt`,
        [sensor.mt_idx, startDateTime, endDateTime]
      );

      if (!sensorData || sensorData.length === 0) {
        continue;
      }

      const snData = sensorData.map((record) => {
        const t = new Date(record.sd_createdAt);
        const timestamp = `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, '0')}${String(t.getDate()).padStart(
          2,
          '0'
        )}_${String(t.getHours()).padStart(2, '0')}${String(t.getMinutes()).padStart(2, '0')}${String(
          t.getSeconds()
        ).padStart(2, '0')}`;
        return { Value: parseFloat(record.sn_compute_data), Timestamp: timestamp };
      });

      const fgNameFormatted = fgNameEn.replace(/\s+/g, '_');

      if (!jsonStructure[fgNameFormatted]) jsonStructure[fgNameFormatted] = {};
      if (!jsonStructure[fgNameFormatted][faNameEn]) jsonStructure[fgNameFormatted][faNameEn] = {};

      jsonStructure[fgNameFormatted][faNameEn][snNameEn] = {
        SN_Data: snData,
        Unit: sensor.sn_unit || null,
      };
    }

    const jsonContent = JSON.stringify(jsonStructure, null, 2);
    const file_name = `${ids}-${start}-${end}.json`;
    const filePath = path.join(__dirname, '..', '..', '..', '..', 'files', 'front', file_name);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, jsonContent);

    const query = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path) VALUES (?, 1, ?, '/files/front')`;
    await pool.promise().query(query, [fc_idx, file_name]);

    console.log('JSON 파일 생성 및 DB 저장 완료');

    return { success: true, fileName: file_name, filePath: '/files/front' };
  } catch (err) {
    console.error('Failed to insert JSON:', err);
    throw err;
  }
};
