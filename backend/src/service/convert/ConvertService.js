import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateValue, validateFcIdx, validateDate, validateNumber } from '../../utils/validation.js';
import { querySingle, queryMultiple, queryInsert, withTransaction } from '../../utils/dbHelper.js';
import { getBaseFCIdxFromDB } from '../basic_code/BasicCodeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const insertConvertsToDB = async (fc_idx, user_idx, startDate, endDate, selectedConvert, af_kind) => {
  try {
    // 파라미터 검증
    const validatedFcIdx = validateFcIdx(fc_idx);
    const validatedStartDate = validateDate(startDate);
    const validatedEndDate = validateDate(endDate);
    const validatedSelectedConvert = validateValue(selectedConvert);
    const validatedUserIdx = validateValue(user_idx);
    const validatedAfKind = validateValue(af_kind);

    if (!validatedStartDate || !validatedEndDate || !validatedSelectedConvert) {
      throw new Error('필수 파라미터가 누락되었습니다.');
    }

    const formattedStart = validatedStartDate.replace(/(\d{2})(\d{2})(\d{2})/, '20$1-$2-$3');
    const formattedEnd = validatedEndDate.replace(/(\d{2})(\d{2})(\d{2})/, '20$1-$2-$3');
    const startDateTime = `${formattedStart} 00:00:00`;
    const endDateTime = `${formattedEnd} 23:59:59`;

    const baseFCIdx = await getBaseFCIdxFromDB(validatedSelectedConvert);
    if (!baseFCIdx) {
      throw new Error('선택된 기초코드의 공장 정보를 찾을 수 없습니다.');
    }

    // selectedConvert를 validatedSelectedConvert로 수정
    const snRows = await queryMultiple(`SELECT sn_idx FROM tb_aasx_base_sensor WHERE ab_idx IN (?)`, [
      validatedSelectedConvert,
    ]);
    const snIdxList = snRows.map((row) => row.sn_idx);
    if (snIdxList.length === 0) throw new Error('선택된 base에 연결된 센서가 없습니다.');

    const sensorInfos = await queryMultiple(
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

    const aliasesCheck = await queryMultiple(
      `SELECT DISTINCT
      f.fc_name,
      a.fg_name,
      s.fa_name,
      p.sn_name
    FROM tb_aasx_data_prop p
    JOIN tb_aasx_data_sm s ON p.fa_idx = s.fa_idx
    JOIN tb_aasx_data_aas a ON s.fg_idx = a.fg_idx
    JOIN tb_aasx_data f ON a.fc_idx = f.fc_idx
    WHERE p.sn_idx IN (?)`,
      [snIdxList]
    );

    const missingAliases = [];
    for (const item of aliasesCheck) {
      const aliasCheck = await querySingle(
        `SELECT 
        MAX(CASE WHEN as_kr = ? THEN as_en END) AS fg_alias,
        MAX(CASE WHEN as_kr = ? THEN as_en END) AS fa_alias,
        MAX(CASE WHEN as_kr = ? THEN as_en END) AS sn_alias
      FROM tb_aasx_alias`,
        [item.fg_name, item.fa_name, item.sn_name]
      );

      if (!aliasCheck) {
        missingAliases.push({
          fg_name: item.fg_name,
          fa_name: item.fa_name,
          sn_name: item.sn_name,
          missing: [`설비그룹: ${item.fg_name}`, `설비: ${item.fa_name}`, `센서: ${item.sn_name}`],
        });
        continue;
      }

      const { fg_alias, fa_alias, sn_alias } = aliasCheck;
      if (!fg_alias || !fa_alias || !sn_alias) {
        const missingItems = [];
        if (!fg_alias) missingItems.push(`설비그룹: ${item.fg_name}`);
        if (!fa_alias) missingItems.push(`설비: ${item.fa_name}`);
        if (!sn_alias) missingItems.push(`센서: ${item.sn_name}`);

        missingAliases.push({
          fg_name: item.fg_name,
          fa_name: item.fa_name,
          sn_name: item.sn_name,
          missing: missingItems,
        });
      }
    }

    if (missingAliases.length > 0) {
      const missingDetails = missingAliases
        .map((item) => `${item.fg_name} > ${item.fa_name} > ${item.sn_name} (${item.missing.join(', ')})`)
        .join('\n');
      throw new Error(
        `식별 ID가 지정되어있지 않은 항목이 있습니다.\n데이터 관리 > 식별 ID 관리 탭에서 지정해주세요.\n\n설정되지 않은 식별 ID:\n${missingDetails}`
      );
    }

    const jsonStructure = {};
    let hasData = false;

    for (const sensor of sensorInfos) {
      const aliases = await querySingle(
        `SELECT
        MAX(CASE WHEN as_kr = ? THEN as_en END) AS fg_alias,
        MAX(CASE WHEN as_kr = ? THEN as_en END) AS fa_alias,
        MAX(CASE WHEN as_kr = ? THEN as_en END) AS sn_alias
      FROM tb_aasx_alias`,
        [sensor.fg_name, sensor.fa_name, sensor.sn_name]
      );

      if (!aliases) {
        continue;
      }

      const { fg_alias, fa_alias, sn_alias } = aliases;

      const fgNameEn = fg_alias || sensor.fg_name;
      const faNameEn = fa_alias || sensor.fa_name;
      const snNameEn = sn_alias || sensor.sn_name;

      const sensorData = await queryMultiple(
        `SELECT 
          ts.sn_data,
          ts.createdAt as sd_createdAt,
          tsi.ad_compute,
          tsi.sn_unit
         FROM tb_sensor_data ts
         LEFT JOIN tb_aasx_sensor_info tsi ON ts.mt_idx = tsi.mt_idx
         WHERE ts.mt_idx = ? AND ts.createdAt BETWEEN ? AND ?
         ORDER BY ts.createdAt`,
        [sensor.mt_idx, startDateTime, endDateTime]
      );

      if (!sensorData || sensorData.length === 0) {
        continue;
      }

      hasData = true;

      const snData = sensorData.map((record) => {
        const t = new Date(record.sd_createdAt);
        const timestamp = t.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
        
        let computedValue = parseFloat(record.sn_data);
        
        // ad_compute 수식 적용
        if (record.ad_compute && record.ad_compute.trim() !== '') {
          try {
            const computeFormula = record.ad_compute.trim();
            const snDataValue = parseFloat(record.sn_data);
            
            if (computeFormula.startsWith('*')) {
              const multiplier = parseFloat(computeFormula.substring(1));
              computedValue = snDataValue * multiplier;
            } else if (computeFormula.startsWith('/')) {
              const divisor = parseFloat(computeFormula.substring(1));
              if (divisor === 0) {
                throw new Error('0으로 나눌 수 없습니다.');
              }
              computedValue = snDataValue / divisor;
            } else {
              // 알 수 없는 수식 형식인 경우 원본 값 사용
              computedValue = snDataValue;
            }
          } catch (error) {
            console.error('수식 계산 오류:', error.message, '원본 값 사용');
            computedValue = parseFloat(record.sn_data);
          }
        }
        
        return { Value: Math.round(computedValue * 100) / 100, Timestamp: timestamp };
      });

      const fgNameFormatted = fgNameEn.replace(/\s+/g, '_');

      if (!jsonStructure[fgNameFormatted]) jsonStructure[fgNameFormatted] = {};
      if (!jsonStructure[fgNameFormatted][faNameEn]) jsonStructure[fgNameFormatted][faNameEn] = {};

      jsonStructure[fgNameFormatted][faNameEn][snNameEn] = {
        SN_Data: snData,
        Unit: sensor.sn_unit || null,
      };
    }

    if (!hasData) {
      throw new Error('선택한 날짜 범위에 데이터가 없습니다.');
    }

    const jsonContent = JSON.stringify(jsonStructure, null, 2);

    const formatDateForFileName = (dateStr) => {
      const date = new Date(dateStr);
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}${month}${day}`;
    };

    const startDateFormatted = formatDateForFileName(startDate);
    const endDateFormatted = formatDateForFileName(endDate);
    const file_name = `${selectedConvert}-${startDateFormatted}-${endDateFormatted}.json`;
    const filePath = path.join(__dirname, '..', '..', '..', '..', 'files', 'front', file_name);

    const existing = await querySingle('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND af_kind = ?', [
      file_name,
      af_kind,
    ]);
    if (existing && existing.af_idx) {
      throw new Error('이미 생성되어있는 파일입니다.');
    }

    // files 디렉토리와 front 디렉토리 생성
    const filesDir = path.dirname(path.dirname(filePath)); // files 디렉토리
    const frontDir = path.dirname(filePath); // front 디렉토리

    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }
    if (!fs.existsSync(frontDir)) {
      fs.mkdirSync(frontDir, { recursive: true });
    }

    fs.writeFileSync(filePath, jsonContent);

    await queryInsert(
      `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 1, ?, '/files/front', ?, ?)`,
      [baseFCIdx, file_name, user_idx, user_idx]
    );

    return { success: true, fileName: file_name, filePath: '/files/front' };
  } catch (error) {
    console.error('ConvertService error:', error);
    throw error;
  }
};
