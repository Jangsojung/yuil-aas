import { validateValue } from '../../utils/validation.js';
import { querySingle, queryMultiple, queryInsert, withTransaction } from '../../utils/dbHelper.js';
import { pool } from '../../config/database.js';

export const insertFacilityGroup = async (fc_idx, name) => {
  const validatedFcIdx = validateValue(fc_idx);
  const validatedName = validateValue(name);

  // 가장 마지막 fg_idx 조회
  const maxResult = await querySingle('SELECT MAX(fg_idx) as max_idx FROM tb_aasx_data_aas');
  const nextFgIdx = (maxResult?.max_idx || 0) + 1;

  await queryInsert('INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx, origin_check) VALUES (?, ?, ?, ?)', [
    nextFgIdx,
    validatedName,
    validatedFcIdx,
    0,
  ]);
  return nextFgIdx;
};

export const insertFacility = async (fg_idx, name) => {
  const validatedFgIdx = validateValue(fg_idx);
  const validatedName = validateValue(name);

  // 가장 마지막 fa_idx 조회
  const maxResult = await querySingle('SELECT MAX(fa_idx) as max_idx FROM tb_aasx_data_sm');
  const nextFaIdx = (maxResult?.max_idx || 0) + 1;

  await queryInsert('INSERT INTO tb_aasx_data_sm (fa_idx, fg_idx, fa_name, origin_check) VALUES (?, ?, ?, ?)', [
    nextFaIdx,
    validatedFgIdx,
    validatedName,
    0,
  ]);
  return nextFaIdx;
};

export const insertSensor = async (fa_idx, name) => {
  const validatedFaIdx = validateValue(fa_idx);
  const validatedName = validateValue(name);

  // 가장 마지막 sn_idx 조회
  const maxResult = await querySingle('SELECT MAX(sn_idx) as max_idx FROM tb_aasx_data_prop');
  const nextSnIdx = (maxResult?.max_idx || 0) + 1;

  await queryInsert('INSERT INTO tb_aasx_data_prop (sn_idx, fa_idx, sn_name, origin_check) VALUES (?, ?, ?, ?)', [
    nextSnIdx,
    validatedFaIdx,
    validatedName,
    0,
  ]);

  // tb_aasx_sensor_info에도 추가 (mt_idx = max+1)
  const mtIdxResult = await querySingle('SELECT MAX(mt_idx) as max_mt_idx FROM tb_aasx_sensor_info');
  const nextMtIdx = (mtIdxResult?.max_mt_idx || 0) + 1;
  // 공장/설비그룹/설비/센서명 추출
  const joinResult = await querySingle(
    `SELECT fc.fc_name, fg.fg_name, fa.fa_name
     FROM tb_aasx_data_sm fa
     JOIN tb_aasx_data_aas fg ON fa.fg_idx = fg.fg_idx
     JOIN tb_aasx_data fc ON fg.fc_idx = fc.fc_idx
     WHERE fa.fa_idx = ?`,
    [validatedFaIdx]
  );
  if (joinResult) {
    await queryInsert(
      'INSERT INTO tb_aasx_sensor_info (mt_idx, fc_name, fg_name, fa_name, sn_name) VALUES (?, ?, ?, ?, ?)',
      [nextMtIdx, joinResult.fc_name, joinResult.fg_name, joinResult.fa_name, validatedName]
    );
  }

  return nextSnIdx;
};

export const insertFactory = async (cm_idx, fc_name) => {
  const validatedCmIdx = validateValue(cm_idx);
  const validatedFcName = validateValue(fc_name);

  // 가장 마지막 fc_idx 조회
  const maxResult = await querySingle('SELECT MAX(fc_idx) as max_idx FROM tb_aasx_data');
  const nextFcIdx = (maxResult?.max_idx || 0) + 1;

  // 공장 정보 삽입
  await queryInsert(
    'INSERT INTO tb_aasx_data (fc_idx, cm_idx, fc_name, origin_check) VALUES (?, ?, ?, ?)',
    [nextFcIdx, validatedCmIdx, validatedFcName, 0]
  );


  return nextFcIdx;
};

export const deleteSensors = async (sensorIds) => {
  const validatedSensorIds = sensorIds && Array.isArray(sensorIds) && sensorIds.length > 0 ? sensorIds : [];

  const results = await queryMultiple(
    'SELECT sn_idx, sn_name, fa_idx, origin_check FROM tb_aasx_data_prop WHERE sn_idx IN (?)',
    [validatedSensorIds]
  );

  if (results.length === 0) {
    return {
      success: true,
      message: '삭제할 센서가 없습니다.',
      deletedCount: 0,
    };
  }

  const protectedSensors = results.filter((sensor) => sensor.origin_check === 1);
  if (protectedSensors.length > 0) {
    return {
      success: false,
      message: `다음 센서들은 삭제할 수 없습니다: ${protectedSensors.map((s) => s.sn_name).join(', ')}`,
      protectedCount: protectedSensors.length,
    };
  }

  const deletableSensors = results.filter((sensor) => sensor.origin_check === 0);
  if (deletableSensors.length === 0) {
    return {
      success: true,
      message: '삭제할 수 있는 센서가 없습니다.',
      deletedCount: 0,
    };
  }

  const deletableSensorIds = deletableSensors.map((sensor) => sensor.sn_idx);
  const affectedFacilityIds = [...new Set(deletableSensors.map((sensor) => sensor.fa_idx))];

  return await withTransaction(async (connection) => {
    // 1. 센서 삭제
    await connection.query('DELETE FROM tb_aasx_data_prop WHERE sn_idx IN (?)', [deletableSensorIds]);

    // 2. 센서가 없는 설비들 찾기
    const emptyFacilities = [];
    for (const faIdx of affectedFacilityIds) {
      const [remainingSensors] = await connection.query(
        'SELECT COUNT(*) as count FROM tb_aasx_data_prop WHERE fa_idx = ?',
        [faIdx]
      );

      if (remainingSensors[0].count === 0) {
        // 센서가 없는 설비 정보 조회
        const [facilityInfo] = await connection.query(
          'SELECT fa_idx, fa_name, fg_idx, origin_check FROM tb_aasx_data_sm WHERE fa_idx = ?',
          [faIdx]
        );

        if (facilityInfo.length > 0 && facilityInfo[0].origin_check === 0) {
          emptyFacilities.push(facilityInfo[0]);
        }
      }
    }

    // 3. 센서가 없는 설비들 자동 삭제
    let autoDeletedFacilities = [];
    let autoDeletedGroups = [];
    let autoDeletedFactories = [];

    if (emptyFacilities.length > 0) {
      const emptyFacilityIds = emptyFacilities.map((facility) => facility.fa_idx);
      const affectedGroupIds = [...new Set(emptyFacilities.map((facility) => facility.fg_idx))];

      // 설비 삭제
      await connection.query('DELETE FROM tb_aasx_data_sm WHERE fa_idx IN (?)', [emptyFacilityIds]);
      autoDeletedFacilities = emptyFacilities.map((facility) => facility.fa_name);

      // 4. 설비가 없는 설비그룹들 찾기 및 삭제
      for (const fgIdx of affectedGroupIds) {
        const [remainingFacilities] = await connection.query(
          'SELECT COUNT(*) as count FROM tb_aasx_data_sm WHERE fg_idx = ?',
          [fgIdx]
        );

        if (remainingFacilities[0].count === 0) {
          const [groupInfo] = await connection.query(
            'SELECT fg_idx, fg_name, fc_idx, origin_check FROM tb_aasx_data_aas WHERE fg_idx = ?',
            [fgIdx]
          );

          if (groupInfo.length > 0 && groupInfo[0].origin_check === 0) {
            // 설비그룹 삭제
            await connection.query('DELETE FROM tb_aasx_data_aas WHERE fg_idx = ?', [fgIdx]);
            autoDeletedGroups.push(groupInfo[0].fg_name);

            // 5. 설비그룹이 없는 공장 찾기 및 삭제
            const fcIdx = groupInfo[0].fc_idx;
            const [remainingGroups] = await connection.query(
              'SELECT COUNT(*) as count FROM tb_aasx_data_aas WHERE fc_idx = ?',
              [fcIdx]
            );

            if (remainingGroups[0].count === 0) {
              const [factoryInfo] = await connection.query(
                'SELECT fc_idx, fc_name, origin_check FROM tb_aasx_data WHERE fc_idx = ?',
                [fcIdx]
              );

              if (factoryInfo.length > 0 && factoryInfo[0].origin_check === 0) {
                // 공장 삭제
                await connection.query('DELETE FROM tb_aasx_data WHERE fc_idx = ?', [fcIdx]);
                autoDeletedFactories.push(factoryInfo[0].fc_name);
              }
            }
          }
        }
      }
    }

    let message = `${deletableSensors.length}개의 센서가 성공적으로 삭제되었습니다.`;
    if (autoDeletedFacilities.length > 0) {
      message += `\n센서가 없는 설비 ${
        autoDeletedFacilities.length
      }개가 자동으로 삭제되었습니다: ${autoDeletedFacilities.join(', ')}`;
    }
    if (autoDeletedGroups.length > 0) {
      message += `\n설비가 없는 설비그룹 ${
        autoDeletedGroups.length
      }개가 자동으로 삭제되었습니다: ${autoDeletedGroups.join(', ')}`;
    }
    if (autoDeletedFactories.length > 0) {
      message += `\n설비그룹이 없는 공장 ${
        autoDeletedFactories.length
      }개가 자동으로 삭제되었습니다: ${autoDeletedFactories.join(', ')}`;
    }

    return {
      success: true,
      message: message,
      deletedCount: deletableSensors.length,
      deletedSensors: deletableSensors.map((sensor) => sensor.sn_name),
      autoDeletedFacilities: autoDeletedFacilities,
      autoDeletedGroups: autoDeletedGroups,
      autoDeletedFactories: autoDeletedFactories,
    };
  });
};

export const synchronizeFacilityData = async (cm_idx, progressCallback) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // 전체 단계 수: 4단계
    const totalSteps = 4;
    let currentStep = 0;

    // 1. tb_factory_info -> tb_aasx_data 동기화 (25%)
    currentStep++;
    if (progressCallback) {
      progressCallback((currentStep / totalSteps) * 100, `공장 정보 동기화 중... (${currentStep}/${totalSteps})`);
    }
    const [factoryInfos] = await connection.query('SELECT fc_idx, fc_name FROM tb_factory_info');

    for (const factory of factoryInfos) {
      const [existingFactory] = await connection.query('SELECT fc_idx, origin_check FROM tb_aasx_data WHERE fc_idx = ?', [
        factory.fc_idx,
      ]);

      if (existingFactory.length === 0) {
        // fc_idx가 없으면 새로 추가 (origin_check = 1)
        await connection.query('INSERT INTO tb_aasx_data (fc_idx, cm_idx, fc_name, origin_check) VALUES (?, ?, ?, 1)', [
          factory.fc_idx,
          cm_idx,
          factory.fc_name,
        ]);
      } else {
        // fc_idx는 있지만 fc_name이 다른 경우
        const [existingWithName] = await connection.query(
          'SELECT fc_idx FROM tb_aasx_data WHERE fc_idx = ? AND fc_name = ?',
          [factory.fc_idx, factory.fc_name]
        );

        if (existingWithName.length === 0) {
          // fc_name이 다르면 기존 fc_idx를 새로운 값으로 변경하고 모든 참조 업데이트
          const [maxFcIdx] = await connection.query('SELECT MAX(fc_idx) as max_idx FROM tb_aasx_data');
          const newFcIdx = (maxFcIdx[0].max_idx || 0) + 1;
          const existingOriginCheck = existingFactory[0].origin_check; // 기존 origin_check 유지

          try {
            // 1. 기존 fc_idx를 새로운 값으로 변경 (origin_check 유지)
            await connection.query('UPDATE tb_aasx_data SET fc_idx = ?, origin_check = ? WHERE fc_idx = ?', [
              newFcIdx, 
              existingOriginCheck, 
              factory.fc_idx
            ]);

            // 2. tb_aasx_data_aas의 fc_idx 참조 업데이트
            await connection.query('UPDATE tb_aasx_data_aas SET fc_idx = ? WHERE fc_idx = ?', [
              newFcIdx,
              factory.fc_idx,
            ]);

            // 3. tb_facility_group_info의 fc_idx 참조 업데이트
            await connection.query('UPDATE tb_facility_group_info SET fc_idx = ? WHERE fc_idx = ?', [
              newFcIdx,
              factory.fc_idx,
            ]);

            // 4. 새로운 (fc_idx, cm_idx, fc_name) 조합으로 저장 (origin_check = 1)
            await connection.query('INSERT INTO tb_aasx_data (fc_idx, cm_idx, fc_name, origin_check) VALUES (?, ?, ?, 1)', [
              factory.fc_idx,
              cm_idx,
              factory.fc_name,
            ]);
          } catch (updateError) {
            console.error('공장 정보 업데이트 중 오류:', updateError);
            // 업데이트 실패 시 기존 데이터 유지
          }
        }
      }
    }

    // 2. tb_facility_group_info -> tb_aasx_data_aas 동기화 (50%)
    currentStep++;
    if (progressCallback) {
      progressCallback((currentStep / totalSteps) * 100, `설비그룹 정보 동기화 중... (${currentStep}/${totalSteps})`);
    }
    const [facilityGroupInfos] = await connection.query('SELECT fg_idx, fg_name, fc_idx FROM tb_facility_group_info');

    for (const group of facilityGroupInfos) {
      const [existingGroup] = await connection.query('SELECT fg_idx, origin_check FROM tb_aasx_data_aas WHERE fg_idx = ?', [
        group.fg_idx,
      ]);

      if (existingGroup.length === 0) {
        // fg_idx가 없으면 새로 추가 (origin_check = 1)
        await connection.query('INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx, origin_check) VALUES (?, ?, ?, 1)', [
          group.fg_idx,
          group.fg_name,
          group.fc_idx,
        ]);
      } else {
        // fg_idx는 있지만 fg_name이 다른 경우
        const [existingWithName] = await connection.query(
          'SELECT fg_idx FROM tb_aasx_data_aas WHERE fg_idx = ? AND fg_name = ?',
          [group.fg_idx, group.fg_name]
        );

        if (existingWithName.length === 0) {
          // fg_name이 다르면 기존 fg_idx를 새로운 값으로 변경하고 모든 참조 업데이트
          const [maxFgIdx] = await connection.query('SELECT MAX(fg_idx) as max_idx FROM tb_aasx_data_aas');
          const newFgIdx = (maxFgIdx[0].max_idx || 0) + 1;
          const existingOriginCheck = existingGroup[0].origin_check; // 기존 origin_check 유지

          try {
            // 1. 기존 fg_idx를 새로운 값으로 변경 (origin_check 유지)
            await connection.query('UPDATE tb_aasx_data_aas SET fg_idx = ?, origin_check = ? WHERE fg_idx = ?', [
              newFgIdx, 
              existingOriginCheck, 
              group.fg_idx
            ]);

            // 2. tb_facility_info의 fg_idx 참조 업데이트
            await connection.query('UPDATE tb_facility_info SET fg_idx = ? WHERE fg_idx = ?', [newFgIdx, group.fg_idx]);

            // 3. tb_aasx_data_sm의 fg_idx 참조 업데이트
            await connection.query('UPDATE tb_aasx_data_sm SET fg_idx = ? WHERE fg_idx = ?', [newFgIdx, group.fg_idx]);

            // 4. 새로운 (fg_idx, fg_name) 조합으로 저장 (origin_check = 1)
            await connection.query('INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx, origin_check) VALUES (?, ?, ?, 1)', [
              group.fg_idx,
              group.fg_name,
              group.fc_idx,
            ]);
          } catch (updateError) {
            console.error('설비그룹 정보 업데이트 중 오류:', updateError);
            // 업데이트 실패 시 기존 데이터 유지
          }
        }
      }
    }

    // 3. tb_facility_info -> tb_aasx_data_sm 동기화 (75%)
    currentStep++;
    if (progressCallback) {
      progressCallback((currentStep / totalSteps) * 100, `설비 정보 동기화 중... (${currentStep}/${totalSteps})`);
    }
    const [facilityInfos] = await connection.query('SELECT fa_idx, fa_name, fg_idx FROM tb_facility_info');

    for (const facility of facilityInfos) {
      // 먼저 해당 설비그룹이 tb_aasx_data_aas에 존재하는지 확인
      const [existingGroup] = await connection.query('SELECT fg_idx FROM tb_aasx_data_aas WHERE fg_idx = ?', [
        facility.fg_idx,
      ]);

      if (existingGroup.length === 0) {
        continue; // 해당 설비그룹이 없으면 설비 추가를 건너뜀
      }

      const [existingFacility] = await connection.query('SELECT fa_idx, origin_check FROM tb_aasx_data_sm WHERE fa_idx = ?', [
        facility.fa_idx,
      ]);

      if (existingFacility.length === 0) {
        // fa_idx가 없으면 새로 추가 (origin_check = 1)
        await connection.query('INSERT INTO tb_aasx_data_sm (fa_idx, fa_name, fg_idx, origin_check) VALUES (?, ?, ?, 1)', [
          facility.fa_idx,
          facility.fa_name,
          facility.fg_idx,
        ]);
      } else {
        // fa_idx는 있지만 fa_name이 다른 경우
        const [existingWithName] = await connection.query(
          'SELECT fa_idx FROM tb_aasx_data_sm WHERE fa_idx = ? AND fa_name = ?',
          [facility.fa_idx, facility.fa_name]
        );

        if (existingWithName.length === 0) {
          // fa_name이 다르면 기존 fa_idx를 새로운 값으로 변경하고 모든 참조 업데이트
          const [maxFaIdx] = await connection.query('SELECT MAX(fa_idx) as max_idx FROM tb_aasx_data_sm');
          const newFaIdx = (maxFaIdx[0].max_idx || 0) + 1;
          const existingOriginCheck = existingFacility[0].origin_check; // 기존 origin_check 유지

          try {
            // 1. 기존 fa_idx를 새로운 값으로 변경 (origin_check 유지)
            await connection.query('UPDATE tb_aasx_data_sm SET fa_idx = ?, origin_check = ? WHERE fa_idx = ?', [
              newFaIdx, 
              existingOriginCheck, 
              facility.fa_idx
            ]);

            // 2. tb_sensor_info의 fa_idx 참조 업데이트
            await connection.query('UPDATE tb_sensor_info SET fa_idx = ? WHERE fa_idx = ?', [
              newFaIdx,
              facility.fa_idx,
            ]);

            // 3. tb_aasx_data_prop의 fa_idx 참조 업데이트
            await connection.query('UPDATE tb_aasx_data_prop SET fa_idx = ? WHERE fa_idx = ?', [
              newFaIdx,
              facility.fa_idx,
            ]);

            // 4. 새로운 (fa_idx, fa_name) 조합으로 저장 (origin_check = 1)
            await connection.query('INSERT INTO tb_aasx_data_sm (fa_idx, fa_name, fg_idx, origin_check) VALUES (?, ?, ?, 1)', [
              facility.fa_idx,
              facility.fa_name,
              facility.fg_idx,
            ]);
          } catch (updateError) {
            console.error('설비 정보 업데이트 중 오류:', updateError);
            // 업데이트 실패 시 기존 데이터 유지
          }
        }
      }
    }

    // 4. tb_sensor_info -> tb_aasx_data_prop 동기화 (100%)
    currentStep++;
    if (progressCallback) {
      progressCallback((currentStep / totalSteps) * 100, `센서 정보 동기화 중... (${currentStep}/${totalSteps})`);
    }
    const [sensorInfos] = await connection.query('SELECT sn_idx, sn_name, fa_idx FROM tb_sensor_info');

    for (const sensor of sensorInfos) {
      // 먼저 해당 설비가 tb_aasx_data_sm에 존재하는지 확인
      const [existingFacility] = await connection.query('SELECT fa_idx FROM tb_aasx_data_sm WHERE fa_idx = ?', [
        sensor.fa_idx,
      ]);

      if (existingFacility.length === 0) {
        continue; // 해당 설비가 없으면 센서 추가를 건너뜀
      }

      const [existingSensor] = await connection.query('SELECT sn_idx, origin_check FROM tb_aasx_data_prop WHERE sn_idx = ?', [
        sensor.sn_idx,
      ]);

      if (existingSensor.length === 0) {
        // sn_idx가 없으면 새로 추가 (origin_check = 1)
        await connection.query('INSERT INTO tb_aasx_data_prop (sn_idx, sn_name, fa_idx, origin_check) VALUES (?, ?, ?, 1)', [
          sensor.sn_idx,
          sensor.sn_name,
          sensor.fa_idx,
        ]);
      } else {
        // sn_idx는 있지만 sn_name이 다른 경우
        const [existingWithName] = await connection.query(
          'SELECT sn_idx FROM tb_aasx_data_prop WHERE sn_idx = ? AND sn_name = ?',
          [sensor.sn_idx, sensor.sn_name]
        );

        if (existingWithName.length === 0) {
          // sn_name이 다르면 기존 sn_idx를 새로운 값으로 변경하고 모든 참조 업데이트
          const [maxSnIdx] = await connection.query('SELECT MAX(sn_idx) as max_idx FROM tb_aasx_data_prop');
          const newSnIdx = (maxSnIdx[0].max_idx || 0) + 1;
          const existingOriginCheck = existingSensor[0].origin_check; // 기존 origin_check 유지

          try {
            // 1. 기존 sn_idx를 새로운 값으로 변경 (origin_check 유지)
            await connection.query('UPDATE tb_aasx_data_prop SET sn_idx = ?, origin_check = ? WHERE sn_idx = ?', [
              newSnIdx, 
              existingOriginCheck, 
              sensor.sn_idx
            ]);

            // 2. tb_aasx_base_sensor의 sn_idx 참조 업데이트
            await connection.query('UPDATE tb_aasx_base_sensor SET sn_idx = ? WHERE sn_idx = ?', [
              newSnIdx,
              sensor.sn_idx,
            ]);

            // 3. 새로운 (sn_idx, sn_name) 조합으로 저장 (origin_check = 1)
            await connection.query('INSERT INTO tb_aasx_data_prop (sn_idx, sn_name, fa_idx, origin_check) VALUES (?, ?, ?, 1)', [
              sensor.sn_idx,
              sensor.sn_name,
              sensor.fa_idx,
            ]);
          } catch (updateError) {
            console.error('센서 정보 업데이트 중 오류:', updateError);
            // 업데이트 실패 시 기존 데이터 유지
          }
        }
      }
    }

    // 5. tb_sensor_info 기준 tb_aasx_sensor_info 동기화 (insert + 충돌시 밀어내기)
    currentStep++;
    if (progressCallback) {
      progressCallback((currentStep / (totalSteps + 1)) * 100, `센서 매칭 동기화 중... (${currentStep}/${totalSteps + 1})`);
    }
    // tb_sensor_info에서 센서 목록 조회
    const [sensorInfoRows] = await connection.query('SELECT mt_idx, fc_name, fg_name, fa_name, sn_name FROM tb_sensor_info');
    // max_mt_idx 구하기 (초기값)
    let maxMtIdx = 0;
    const [maxMtIdxRow] = await connection.query('SELECT MAX(mt_idx) as max_mt_idx FROM tb_aasx_sensor_info');
    if (maxMtIdxRow && maxMtIdxRow[0] && maxMtIdxRow[0].max_mt_idx) {
      maxMtIdx = maxMtIdxRow[0].max_mt_idx;
    }
    for (const row of sensorInfoRows) {
      const { mt_idx, fc_name, fg_name, fa_name, sn_name } = row;
      // tb_aasx_sensor_info에 이미 있는지 확인
      const [exists] = await connection.query('SELECT * FROM tb_aasx_sensor_info WHERE mt_idx = ?', [mt_idx]);
      if (exists.length === 0) {
        // 없으면 insert
        await connection.query(
          'INSERT INTO tb_aasx_sensor_info (mt_idx, fc_name, fg_name, fa_name, sn_name) VALUES (?, ?, ?, ?, ?)',
          [mt_idx, fc_name, fg_name, fa_name, sn_name]
        );
        // tb_sensor_data에서 데이터 긁어서 tb_aasx_sensor_data에 insert
        await connection.query(
          `INSERT INTO tb_aasx_sensor_data (mt_idx, sn_data, sn_compute_data, sd_createdAt)
           SELECT ?, ts.sn_data,
             CASE
               WHEN ad.ad_compute IS NOT NULL AND ad.ad_compute != '' THEN
                 CASE 
                   WHEN LEFT(ad.ad_compute, 1) = '*' THEN ts.sn_data * CAST(SUBSTRING(ad.ad_compute, 2) AS DECIMAL(10, 4))
                   WHEN LEFT(ad.ad_compute, 1) = '/' THEN ts.sn_data / CAST(SUBSTRING(ad.ad_compute, 2) AS DECIMAL(10, 4))
                   ELSE ts.sn_data
                 END
               ELSE ts.sn_data
             END AS sn_compute_data,
             ts.createdAt AS sd_createdAt
           FROM tb_sensor_data ts
           JOIN tb_matching_list ml ON ts.mt_idx = ml.mt_idx
           LEFT JOIN tb_aasx_data_prop sn ON ml.sn_idx = sn.sn_idx
           LEFT JOIN tb_address_info ad ON sn.sn_name = ad.ad_name
           LEFT JOIN tb_sensor_info si ON ml.sn_idx = si.sn_idx
           WHERE ts.mt_idx = ?`,
          [mt_idx, mt_idx]
        );
      } else {
        // 이미 있는데 내용이 다르면 기존 row를 max+1로 밀어내고, tb_sensor_info의 내용으로 덮어씀
        const exist = exists[0];
        if (
          exist.fc_name !== fc_name ||
          exist.fg_name !== fg_name ||
          exist.fa_name !== fa_name ||
          exist.sn_name !== sn_name
        ) {
          maxMtIdx += 1;
          // 기존 row의 mt_idx를 max+1로 update
          await connection.query('UPDATE tb_aasx_sensor_info SET mt_idx = ? WHERE mt_idx = ?', [maxMtIdx, mt_idx]);
          // tb_aasx_sensor_data의 mt_idx도 같이 update
          await connection.query('UPDATE tb_aasx_sensor_data SET mt_idx = ? WHERE mt_idx = ?', [maxMtIdx, mt_idx]);
          // tb_sensor_info의 내용으로 해당 mt_idx에 insert(덮어쓰기)
          await connection.query(
            'INSERT INTO tb_aasx_sensor_info (mt_idx, fc_name, fg_name, fa_name, sn_name) VALUES (?, ?, ?, ?, ?)',
            [mt_idx, fc_name, fg_name, fa_name, sn_name]
          );
          // tb_sensor_data에서 데이터 긁어서 tb_aasx_sensor_data에 insert
          await connection.query(
            `INSERT INTO tb_aasx_sensor_data (mt_idx, sn_data, sn_compute_data, sd_createdAt)
             SELECT ?, ts.sn_data,
               CASE
                 WHEN ad.ad_compute IS NOT NULL AND ad.ad_compute != '' THEN
                   CASE 
                     WHEN LEFT(ad.ad_compute, 1) = '*' THEN ts.sn_data * CAST(SUBSTRING(ad.ad_compute, 2) AS DECIMAL(10, 4))
                     WHEN LEFT(ad.ad_compute, 1) = '/' THEN ts.sn_data / CAST(SUBSTRING(ad.ad_compute, 2) AS DECIMAL(10, 4))
                     ELSE ts.sn_data
                   END
                 ELSE ts.sn_data
               END AS sn_compute_data,
               ts.createdAt AS sd_createdAt
             FROM tb_sensor_data ts
             JOIN tb_matching_list ml ON ts.mt_idx = ml.mt_idx
             LEFT JOIN tb_aasx_data_prop sn ON ml.sn_idx = sn.sn_idx
             LEFT JOIN tb_address_info ad ON sn.sn_name = ad.ad_name
             LEFT JOIN tb_sensor_info si ON ml.sn_idx = si.sn_idx
             WHERE ts.mt_idx = ?`,
            [mt_idx, mt_idx]
          );
        }
      }
    }

    await connection.commit();
    return { success: true, message: '설비 데이터 동기화가 완료되었습니다.' };
  } catch (error) {
    await connection.rollback();
    console.error('동기화 중 오류:', error);
    throw new Error(`설비 데이터 동기화 중 오류가 발생했습니다: ${error.message}`);
  } finally {
    connection.release();
  }
};

// 설비 삭제
export const deleteFacilities = async (facilityIds) => {
  const results = await queryMultiple(
    'SELECT fa_idx, fa_name, fg_idx, origin_check FROM tb_aasx_data_sm WHERE fa_idx IN (?)',
    [facilityIds]
  );

  if (results.length === 0) {
    return {
      success: true,
      message: '삭제할 설비가 없습니다.',
      deletedCount: 0,
    };
  }

  const protectedFacilities = results.filter((facility) => facility.origin_check === 1);
  if (protectedFacilities.length > 0) {
    return {
      success: false,
      message: `다음 설비들은 삭제할 수 없습니다: ${protectedFacilities.map((f) => f.fa_name).join(', ')}`,
      protectedCount: protectedFacilities.length,
    };
  }

  const deletableFacilities = results.filter((facility) => facility.origin_check === 0);
  if (deletableFacilities.length === 0) {
    return {
      success: true,
      message: '삭제할 수 있는 설비가 없습니다.',
      deletedCount: 0,
    };
  }

  const deletableFacilityIds = deletableFacilities.map((facility) => facility.fa_idx);
  const affectedGroupIds = [...new Set(deletableFacilities.map((facility) => facility.fg_idx))];

  return await withTransaction(async (connection) => {
    // 1. 설비 삭제
    await connection.query('DELETE FROM tb_aasx_data_sm WHERE fa_idx IN (?)', [deletableFacilityIds]);

    // 2. 설비가 없는 설비그룹들 찾기
    const emptyGroups = [];
    for (const fgIdx of affectedGroupIds) {
      const [remainingFacilities] = await connection.query(
        'SELECT COUNT(*) as count FROM tb_aasx_data_sm WHERE fg_idx = ?',
        [fgIdx]
      );

      if (remainingFacilities[0].count === 0) {
        // 설비가 없는 설비그룹 정보 조회
        const [groupInfo] = await connection.query(
          'SELECT fg_idx, fg_name, fc_idx, origin_check FROM tb_aasx_data_aas WHERE fg_idx = ?',
          [fgIdx]
        );

        if (groupInfo.length > 0 && groupInfo[0].origin_check === 0) {
          emptyGroups.push(groupInfo[0]);
        }
      }
    }

    // 3. 설비가 없는 설비그룹들 자동 삭제
    let autoDeletedGroups = [];
    let autoDeletedFactories = [];
    if (emptyGroups.length > 0) {
      const emptyGroupIds = emptyGroups.map((group) => group.fg_idx);
      const affectedFactoryIds = [...new Set(emptyGroups.map((group) => group.fc_idx))];

      // 설비그룹 삭제
      await connection.query('DELETE FROM tb_aasx_data_aas WHERE fg_idx IN (?)', [emptyGroupIds]);
      autoDeletedGroups = emptyGroups.map((group) => group.fg_name);

      // 4. 설비그룹이 없는 공장들 찾기 및 삭제
      for (const fcIdx of affectedFactoryIds) {
        const [remainingGroups] = await connection.query(
          'SELECT COUNT(*) as count FROM tb_aasx_data_aas WHERE fc_idx = ?',
          [fcIdx]
        );

        if (remainingGroups[0].count === 0) {
          const [factoryInfo] = await connection.query(
            'SELECT fc_idx, fc_name, origin_check FROM tb_aasx_data WHERE fc_idx = ?',
            [fcIdx]
          );

          if (factoryInfo.length > 0 && factoryInfo[0].origin_check === 0) {
            // 공장 삭제
            await connection.query('DELETE FROM tb_aasx_data WHERE fc_idx = ?', [fcIdx]);
            autoDeletedFactories.push(factoryInfo[0].fc_name);
          }
        }
      }
    }

    let message = `${deletableFacilities.length}개의 설비가 성공적으로 삭제되었습니다.`;
    if (autoDeletedGroups.length > 0) {
      message += `\n설비가 없는 설비그룹 ${
        autoDeletedGroups.length
      }개가 자동으로 삭제되었습니다: ${autoDeletedGroups.join(', ')}`;
    }
    if (autoDeletedFactories.length > 0) {
      message += `\n설비그룹이 없는 공장 ${
        autoDeletedFactories.length
      }개가 자동으로 삭제되었습니다: ${autoDeletedFactories.join(', ')}`;
    }

    return {
      success: true,
      message: message,
      deletedCount: deletableFacilities.length,
      deletedFacilities: deletableFacilities.map((facility) => facility.fa_name),
      autoDeletedGroups: autoDeletedGroups,
      autoDeletedFactories: autoDeletedFactories,
    };
  });
};

// 설비그룹 삭제
export const deleteFacilityGroups = async (facilityGroupIds) => {
  const results = await queryMultiple(
    'SELECT fg_idx, fg_name, fc_idx, origin_check FROM tb_aasx_data_aas WHERE fg_idx IN (?)',
    [facilityGroupIds]
  );

  if (results.length === 0) {
    return {
      success: true,
      message: '삭제할 설비그룹이 없습니다.',
      deletedCount: 0,
    };
  }

  const protectedGroups = results.filter((group) => group.origin_check === 1);
  if (protectedGroups.length > 0) {
    return {
      success: false,
      message: `다음 설비그룹들은 삭제할 수 없습니다: ${protectedGroups.map((g) => g.fg_name).join(', ')}`,
      protectedCount: protectedGroups.length,
    };
  }

  const deletableGroups = results.filter((group) => group.origin_check === 0);
  if (deletableGroups.length === 0) {
    return {
      success: true,
      message: '삭제할 수 있는 설비그룹이 없습니다.',
      deletedCount: 0,
    };
  }

  const deletableGroupIds = deletableGroups.map((group) => group.fg_idx);
  const affectedFactoryIds = [...new Set(deletableGroups.map((group) => group.fc_idx))];

  return await withTransaction(async (connection) => {
    // 1. 설비그룹 삭제
    await connection.query('DELETE FROM tb_aasx_data_aas WHERE fg_idx IN (?)', [deletableGroupIds]);

    // 2. 설비그룹이 없는 공장들 찾기
    const emptyFactories = [];
    for (const fcIdx of affectedFactoryIds) {
      const [remainingGroups] = await connection.query(
        'SELECT COUNT(*) as count FROM tb_aasx_data_aas WHERE fc_idx = ?',
        [fcIdx]
      );

      if (remainingGroups[0].count === 0) {
        // 설비그룹이 없는 공장 정보 조회
        const [factoryInfo] = await connection.query(
          'SELECT fc_idx, fc_name, origin_check FROM tb_aasx_data WHERE fc_idx = ?',
          [fcIdx]
        );

        if (factoryInfo.length > 0 && factoryInfo[0].origin_check === 0) {
          emptyFactories.push(factoryInfo[0]);
        }
      }
    }

    // 3. 설비그룹이 없는 공장들 자동 삭제
    let autoDeletedFactories = [];
    if (emptyFactories.length > 0) {
      const emptyFactoryIds = emptyFactories.map((factory) => factory.fc_idx);
      await connection.query('DELETE FROM tb_aasx_data WHERE fc_idx IN (?)', [emptyFactoryIds]);
      autoDeletedFactories = emptyFactories.map((factory) => factory.fc_name);
    }

    let message = `${deletableGroups.length}개의 설비그룹이 성공적으로 삭제되었습니다.`;
    if (autoDeletedFactories.length > 0) {
      message += `\n설비그룹이 없는 공장 ${
        autoDeletedFactories.length
      }개가 자동으로 삭제되었습니다: ${autoDeletedFactories.join(', ')}`;
    }

    return {
      success: true,
      message: message,
      deletedCount: deletableGroups.length,
      deletedGroups: deletableGroups.map((group) => group.fg_name),
      autoDeletedFactories: autoDeletedFactories,
    };
  });
};

// 공장 삭제
export const deleteFactories = async (factoryIds, cm_idx) => {
  const validatedFactoryIds = Array.isArray(factoryIds) ? factoryIds : [];
  const validatedCmIdx = validateValue(cm_idx);

  // 삭제 가능한 공장만 조회
  const results = await queryMultiple(
    'SELECT fc_idx, fc_name, origin_check FROM tb_aasx_data WHERE fc_idx IN (?) AND cm_idx = ?',
    [validatedFactoryIds, validatedCmIdx]
  );

  const deletableFactories = results.filter((factory) => factory.origin_check === 0);
  if (deletableFactories.length === 0) {
    return {
      success: true,
      message: '삭제할 수 있는 공장이 없습니다.',
      deletedCount: 0,
    };
  }

  const deletableFactoryIds = deletableFactories.map((factory) => factory.fc_idx);

  await queryInsert(
    'DELETE FROM tb_aasx_data WHERE fc_idx IN (?) AND cm_idx = ? AND origin_check = 0',
    [deletableFactoryIds, validatedCmIdx]
  );

  return {
    success: true,
    message: '공장 삭제 완료',
    deletedCount: deletableFactoryIds.length,
    deletedFactories: deletableFactories.map((factory) => factory.fc_name),
  };
};

export const getFactoriesByCmIdx = async (cm_idx) => {
  // cm_idx로 공장 목록 조회
  const factories = await queryMultiple(
    'SELECT fc_idx, fc_name, origin_check FROM tb_aasx_data WHERE cm_idx = ?',
    [Number(cm_idx)]
  );
  return factories;
};

export const getFacilityGroupsByFcIdx = async (fc_idx) => {
  const validatedFcIdx = validateValue(fc_idx);
  const groups = await queryMultiple(
    'SELECT fg_idx, fg_name FROM tb_aasx_data_aas WHERE fc_idx = ?',
    [validatedFcIdx]
  );
  return groups;
};

export const getFacilitiesByFgIdx = async (fg_idx) => {
  const validatedFgIdx = validateValue(fg_idx);
  const facilities = await queryMultiple(
    'SELECT fa_idx, fa_name FROM tb_aasx_data_sm WHERE fg_idx = ?',
    [validatedFgIdx]
  );
  return facilities;
};
