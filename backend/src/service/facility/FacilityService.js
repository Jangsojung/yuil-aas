import { pool } from '../../index.js';

export const insertFacilityGroup = async (name) => {
  try {
    // 가장 마지막 fg_idx 조회
    const [maxResult] = await pool.promise().query('SELECT MAX(fg_idx) as max_idx FROM tb_aasx_data_aas');
    const nextFgIdx = (maxResult[0].max_idx || 0) + 1;

    const query = 'INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx, origin_check) VALUES (?, ?, ?, ?)';
    const [result] = await pool.promise().query(query, [nextFgIdx, name, 3, 0]);
    return nextFgIdx;
  } catch (err) {
    console.error('Failed to insert Facility Group: ', err);
    throw err;
  }
};

export const insertFacility = async (fg_idx, name) => {
  try {
    // 가장 마지막 fa_idx 조회
    const [maxResult] = await pool.promise().query('SELECT MAX(fa_idx) as max_idx FROM tb_aasx_data_sm');
    const nextFaIdx = (maxResult[0].max_idx || 0) + 1;

    const query = 'INSERT INTO tb_aasx_data_sm (fa_idx, fg_idx, fa_name, origin_check) VALUES (?, ?, ?, ?)';
    const [result] = await pool.promise().query(query, [nextFaIdx, fg_idx, name, 0]);
    return nextFaIdx;
  } catch (err) {
    console.error('Failed to insert Facility: ', err);
    throw err;
  }
};

export const insertSensor = async (fa_idx, name) => {
  try {
    // 가장 마지막 sn_idx 조회
    const [maxResult] = await pool.promise().query('SELECT MAX(sn_idx) as max_idx FROM tb_aasx_data_prop');
    const nextSnIdx = (maxResult[0].max_idx || 0) + 1;

    const query = 'INSERT INTO tb_aasx_data_prop (sn_idx, fa_idx, sn_name, origin_check) VALUES (?, ?, ?, ?)';
    const [result] = await pool.promise().query(query, [nextSnIdx, fa_idx, name, 0]);
    return nextSnIdx;
  } catch (err) {
    console.error('Failed to insert Sensor: ', err);
    throw err;
  }
};

export const deleteSensors = async (sensorIds) => {
  try {
    // 삭제할 센서들의 정보를 먼저 조회
    const query = 'SELECT sn_idx, sn_name, fa_idx FROM tb_aasx_data_prop WHERE sn_idx IN (?)';
    const [results] = await pool.promise().query(query, [sensorIds]);

    if (results.length === 0) {
      return {
        success: true,
        message: '삭제할 센서가 없습니다.',
        deletedCount: 0,
      };
    }

    // DB에서 센서 정보 삭제
    const deleteQuery = 'DELETE FROM tb_aasx_data_prop WHERE sn_idx IN (?)';
    await pool.promise().query(deleteQuery, [sensorIds]);

    return {
      success: true,
      message: '센서가 성공적으로 삭제되었습니다.',
      deletedCount: results.length,
      deletedSensors: results.map((sensor) => sensor.sn_name),
    };
  } catch (err) {
    console.error('Failed to delete Sensors: ', err);
    throw err;
  }
};

export const synchronizeFacilityData = async () => {
  try {
    // 1. tb_factory_info -> tb_aasx_data 동기화
    const [factoryInfos] = await pool.promise().query('SELECT fc_idx, fc_name FROM tb_factory_info');

    for (const factory of factoryInfos) {
      const [existingFactory] = await pool
        .promise()
        .query('SELECT fc_idx FROM tb_aasx_data WHERE fc_idx = ?', [factory.fc_idx]);

      if (existingFactory.length === 0) {
        // fc_idx가 없으면 새로 추가
        await pool
          .promise()
          .query('INSERT INTO tb_aasx_data (fc_idx, fc_name) VALUES (?, ?)', [factory.fc_idx, factory.fc_name]);
      } else {
        // fc_idx는 있지만 fc_name이 다른 경우
        const [existingWithName] = await pool
          .promise()
          .query('SELECT fc_idx FROM tb_aasx_data WHERE fc_idx = ? AND fc_name = ?', [factory.fc_idx, factory.fc_name]);

        if (existingWithName.length === 0) {
          // fc_name이 다르면 기존 fc_idx를 새로운 값으로 변경하고 모든 참조 업데이트
          const [maxFcIdx] = await pool.promise().query('SELECT MAX(fc_idx) as max_idx FROM tb_aasx_data');
          const newFcIdx = (maxFcIdx[0].max_idx || 0) + 1;

          // 외래키 제약조건을 일시적으로 비활성화
          await pool.promise().query('SET FOREIGN_KEY_CHECKS = 0');

          try {
            // 1. 기존 fc_idx를 새로운 값으로 변경
            await pool
              .promise()
              .query('UPDATE tb_aasx_data SET fc_idx = ? WHERE fc_idx = ?', [newFcIdx, factory.fc_idx]);

            // 2. tb_aasx_data_aas의 fc_idx 참조 업데이트
            await pool
              .promise()
              .query('UPDATE tb_aasx_data_aas SET fc_idx = ? WHERE fc_idx = ?', [newFcIdx, factory.fc_idx]);

            // 3. tb_facility_group_info의 fc_idx 참조 업데이트
            await pool
              .promise()
              .query('UPDATE tb_facility_group_info SET fc_idx = ? WHERE fc_idx = ?', [newFcIdx, factory.fc_idx]);

            // 4. 새로운 (fc_idx, fc_name) 조합으로 저장
            await pool
              .promise()
              .query('INSERT INTO tb_aasx_data (fc_idx, fc_name) VALUES (?, ?)', [factory.fc_idx, factory.fc_name]);
          } finally {
            // 외래키 제약조건을 다시 활성화
            await pool.promise().query('SET FOREIGN_KEY_CHECKS = 1');
          }
        }
      }
    }

    // 2. tb_facility_group_info -> tb_aasx_data_aas 동기화
    const [facilityGroupInfos] = await pool
      .promise()
      .query('SELECT fg_idx, fg_name, fc_idx FROM tb_facility_group_info');

    for (const group of facilityGroupInfos) {
      const [existingGroup] = await pool
        .promise()
        .query('SELECT fg_idx FROM tb_aasx_data_aas WHERE fg_idx = ?', [group.fg_idx]);

      if (existingGroup.length === 0) {
        // fg_idx가 없으면 새로 추가
        await pool
          .promise()
          .query('INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx) VALUES (?, ?, ?)', [
            group.fg_idx,
            group.fg_name,
            group.fc_idx,
          ]);
      } else {
        // fg_idx는 있지만 fg_name이 다른 경우
        const [existingWithName] = await pool
          .promise()
          .query('SELECT fg_idx FROM tb_aasx_data_aas WHERE fg_idx = ? AND fg_name = ?', [group.fg_idx, group.fg_name]);

        if (existingWithName.length === 0) {
          // fg_name이 다르면 기존 fg_idx를 새로운 값으로 변경하고 모든 참조 업데이트
          const [maxFgIdx] = await pool.promise().query('SELECT MAX(fg_idx) as max_idx FROM tb_aasx_data_aas');
          const newFgIdx = (maxFgIdx[0].max_idx || 0) + 1;

          // 외래키 제약조건을 일시적으로 비활성화
          await pool.promise().query('SET FOREIGN_KEY_CHECKS = 0');

          try {
            // 1. 기존 fg_idx를 새로운 값으로 변경
            await pool
              .promise()
              .query('UPDATE tb_aasx_data_aas SET fg_idx = ? WHERE fg_idx = ?', [newFgIdx, group.fg_idx]);

            // 2. tb_facility_info의 fg_idx 참조 업데이트
            await pool
              .promise()
              .query('UPDATE tb_facility_info SET fg_idx = ? WHERE fg_idx = ?', [newFgIdx, group.fg_idx]);

            // 3. tb_aasx_data_sm의 fg_idx 참조 업데이트
            await pool
              .promise()
              .query('UPDATE tb_aasx_data_sm SET fg_idx = ? WHERE fg_idx = ?', [newFgIdx, group.fg_idx]);

            // 4. 새로운 (fg_idx, fg_name) 조합으로 저장
            await pool
              .promise()
              .query('INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx) VALUES (?, ?, ?)', [
                group.fg_idx,
                group.fg_name,
                group.fc_idx,
              ]);
          } finally {
            // 외래키 제약조건을 다시 활성화
            await pool.promise().query('SET FOREIGN_KEY_CHECKS = 1');
          }
        }
      }
    }

    // 3. tb_facility_info -> tb_aasx_data_sm 동기화
    const [facilityInfos] = await pool.promise().query('SELECT fa_idx, fa_name, fg_idx FROM tb_facility_info');

    for (const facility of facilityInfos) {
      const [existingFacility] = await pool
        .promise()
        .query('SELECT fa_idx FROM tb_aasx_data_sm WHERE fa_idx = ?', [facility.fa_idx]);

      if (existingFacility.length === 0) {
        // fa_idx가 없으면 새로 추가
        await pool
          .promise()
          .query('INSERT INTO tb_aasx_data_sm (fa_idx, fa_name, fg_idx) VALUES (?, ?, ?)', [
            facility.fa_idx,
            facility.fa_name,
            facility.fg_idx,
          ]);
      } else {
        // fa_idx는 있지만 fa_name이 다른 경우
        const [existingWithName] = await pool
          .promise()
          .query('SELECT fa_idx FROM tb_aasx_data_sm WHERE fa_idx = ? AND fa_name = ?', [
            facility.fa_idx,
            facility.fa_name,
          ]);

        if (existingWithName.length === 0) {
          // fa_name이 다르면 기존 fa_idx를 새로운 값으로 변경하고 모든 참조 업데이트
          const [maxFaIdx] = await pool.promise().query('SELECT MAX(fa_idx) as max_idx FROM tb_aasx_data_sm');
          const newFaIdx = (maxFaIdx[0].max_idx || 0) + 1;

          // 외래키 제약조건을 일시적으로 비활성화
          await pool.promise().query('SET FOREIGN_KEY_CHECKS = 0');

          try {
            // 1. 기존 fa_idx를 새로운 값으로 변경
            await pool
              .promise()
              .query('UPDATE tb_aasx_data_sm SET fa_idx = ? WHERE fa_idx = ?', [newFaIdx, facility.fa_idx]);

            // 2. tb_sensor_info의 fa_idx 참조 업데이트
            await pool
              .promise()
              .query('UPDATE tb_sensor_info SET fa_idx = ? WHERE fa_idx = ?', [newFaIdx, facility.fa_idx]);

            // 3. tb_aasx_data_prop의 fa_idx 참조 업데이트
            await pool
              .promise()
              .query('UPDATE tb_aasx_data_prop SET fa_idx = ? WHERE fa_idx = ?', [newFaIdx, facility.fa_idx]);

            // 4. 새로운 (fa_idx, fa_name) 조합으로 저장
            await pool
              .promise()
              .query('INSERT INTO tb_aasx_data_sm (fa_idx, fa_name, fg_idx) VALUES (?, ?, ?)', [
                facility.fa_idx,
                facility.fa_name,
                facility.fg_idx,
              ]);
          } finally {
            // 외래키 제약조건을 다시 활성화
            await pool.promise().query('SET FOREIGN_KEY_CHECKS = 1');
          }
        }
      }
    }

    // 4. tb_sensor_info -> tb_aasx_data_prop 동기화
    const [sensorInfos] = await pool.promise().query('SELECT sn_idx, sn_name, fa_idx FROM tb_sensor_info');

    for (const sensor of sensorInfos) {
      const [existingSensor] = await pool
        .promise()
        .query('SELECT sn_idx FROM tb_aasx_data_prop WHERE sn_idx = ?', [sensor.sn_idx]);

      if (existingSensor.length === 0) {
        // sn_idx가 없으면 새로 추가
        await pool
          .promise()
          .query('INSERT INTO tb_aasx_data_prop (sn_idx, sn_name, fa_idx) VALUES (?, ?, ?)', [
            sensor.sn_idx,
            sensor.sn_name,
            sensor.fa_idx,
          ]);
      } else {
        // sn_idx는 있지만 sn_name이 다른 경우
        const [existingWithName] = await pool
          .promise()
          .query('SELECT sn_idx FROM tb_aasx_data_prop WHERE sn_idx = ? AND sn_name = ?', [
            sensor.sn_idx,
            sensor.sn_name,
          ]);

        if (existingWithName.length === 0) {
          // sn_name이 다르면 기존 sn_idx를 새로운 값으로 변경하고 모든 참조 업데이트
          const [maxSnIdx] = await pool.promise().query('SELECT MAX(sn_idx) as max_idx FROM tb_aasx_data_prop');
          const newSnIdx = (maxSnIdx[0].max_idx || 0) + 1;

          // 외래키 제약조건을 일시적으로 비활성화
          await pool.promise().query('SET FOREIGN_KEY_CHECKS = 0');

          try {
            // 1. 기존 sn_idx를 새로운 값으로 변경
            await pool
              .promise()
              .query('UPDATE tb_aasx_data_prop SET sn_idx = ? WHERE sn_idx = ?', [newSnIdx, sensor.sn_idx]);

            // 2. tb_aasx_base_sensor의 sn_idx 참조 업데이트
            await pool
              .promise()
              .query('UPDATE tb_aasx_base_sensor SET sn_idx = ? WHERE sn_idx = ?', [newSnIdx, sensor.sn_idx]);

            // 4. 새로운 (sn_idx, sn_name) 조합으로 저장
            await pool
              .promise()
              .query('INSERT INTO tb_aasx_data_prop (sn_idx, sn_name, fa_idx) VALUES (?, ?, ?)', [
                sensor.sn_idx,
                sensor.sn_name,
                sensor.fa_idx,
              ]);
          } finally {
            // 외래키 제약조건을 다시 활성화
            await pool.promise().query('SET FOREIGN_KEY_CHECKS = 1');
          }
        }
      }
    }

    return { success: true, message: '설비 데이터 동기화가 완료되었습니다.' };
  } catch (error) {
    console.error('설비 동기화 오류:', error);
    throw new Error('설비 데이터 동기화 중 오류가 발생했습니다.');
  }
};
