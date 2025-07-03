import { pool } from '../../index.js';

export const insertFacilityGroup = async (name) => {
  try {
    // 가장 마지막 fg_idx 조회
    const [maxResult] = await pool.promise().query('SELECT MAX(fg_idx) as max_idx FROM tb_aasx_data_aas');
    const nextFgIdx = (maxResult[0].max_idx || 0) + 1;

    const query = 'INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx) VALUES (?, ?, ?)';
    const [result] = await pool.promise().query(query, [nextFgIdx, name, 3]);
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

    const query = 'INSERT INTO tb_aasx_data_sm (fa_idx, fg_idx, fa_name) VALUES (?, ?, ?)';
    const [result] = await pool.promise().query(query, [nextFaIdx, fg_idx, name]);
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

    const query = 'INSERT INTO tb_aasx_data_prop (sn_idx, fa_idx, sn_name) VALUES (?, ?, ?)';
    const [result] = await pool.promise().query(query, [nextSnIdx, fa_idx, name]);
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
          // fc_name이 다르면 새로운 fc_idx로 추가
          const [maxFcIdx] = await pool.promise().query('SELECT MAX(fc_idx) as max_idx FROM tb_aasx_data');
          const newFcIdx = (maxFcIdx[0].max_idx || 0) + 1;

          await pool
            .promise()
            .query('INSERT INTO tb_aasx_data (fc_idx, fc_name) VALUES (?, ?)', [newFcIdx, factory.fc_name]);
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
          // fg_name이 다르면 새로운 fg_idx로 추가
          const [maxFgIdx] = await pool.promise().query('SELECT MAX(fg_idx) as max_idx FROM tb_aasx_data_aas');
          const newFgIdx = (maxFgIdx[0].max_idx || 0) + 1;

          await pool
            .promise()
            .query('INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx) VALUES (?, ?, ?)', [
              newFgIdx,
              group.fg_name,
              group.fc_idx,
            ]);
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
          // fa_name이 다르면 새로운 fa_idx로 추가
          const [maxFaIdx] = await pool.promise().query('SELECT MAX(fa_idx) as max_idx FROM tb_aasx_data_sm');
          const newFaIdx = (maxFaIdx[0].max_idx || 0) + 1;

          await pool
            .promise()
            .query('INSERT INTO tb_aasx_data_sm (fa_idx, fa_name, fg_idx) VALUES (?, ?, ?)', [
              newFaIdx,
              facility.fa_name,
              facility.fg_idx,
            ]);
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
          // sn_name이 다르면 새로운 sn_idx로 추가
          const [maxSnIdx] = await pool.promise().query('SELECT MAX(sn_idx) as max_idx FROM tb_aasx_data_prop');
          const newSnIdx = (maxSnIdx[0].max_idx || 0) + 1;

          await pool
            .promise()
            .query('INSERT INTO tb_aasx_data_prop (sn_idx, sn_name, fa_idx) VALUES (?, ?, ?)', [
              newSnIdx,
              sensor.sn_name,
              sensor.fa_idx,
            ]);
        }
      }
    }

    return { success: true, message: '설비 데이터 동기화가 완료되었습니다.' };
  } catch (error) {
    console.error('설비 동기화 오류:', error);
    throw new Error('설비 데이터 동기화 중 오류가 발생했습니다.');
  }
};
