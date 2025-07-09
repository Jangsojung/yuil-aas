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
    throw err;
  }
};

export const deleteSensors = async (sensorIds) => {
  try {
    const query = 'SELECT sn_idx, sn_name, fa_idx, origin_check FROM tb_aasx_data_prop WHERE sn_idx IN (?)';
    const [results] = await pool.promise().query(query, [sensorIds]);

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

    const deleteQuery = 'DELETE FROM tb_aasx_data_prop WHERE sn_idx IN (?)';
    const [deleteResult] = await pool.promise().query(deleteQuery, [deletableSensorIds]);

    return {
      success: true,
      message: `${deletableSensors.length}개의 센서가 성공적으로 삭제되었습니다.`,
      deletedCount: deletableSensors.length,
      deletedSensors: deletableSensors.map((sensor) => sensor.sn_name),
    };
  } catch (err) {
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
    throw new Error('설비 데이터 동기화 중 오류가 발생했습니다.');
  }
};

// 설비 삭제
export const deleteFacilities = async (facilityIds) => {
  try {
    const query = 'SELECT fa_idx, fa_name, fg_idx, origin_check FROM tb_aasx_data_sm WHERE fa_idx IN (?)';
    const [results] = await pool.promise().query(query, [facilityIds]);

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

    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      const deleteFacilitiesQuery = 'DELETE FROM tb_aasx_data_sm WHERE fa_idx IN (?)';
      const [deleteResult] = await connection.query(deleteFacilitiesQuery, [deletableFacilityIds]);

      await connection.commit();

      return {
        success: true,
        message: `${deletableFacilities.length}개의 설비가 성공적으로 삭제되었습니다.`,
        deletedCount: deletableFacilities.length,
        deletedFacilities: deletableFacilities.map((facility) => facility.fa_name),
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    throw err;
  }
};

// 설비그룹 삭제
export const deleteFacilityGroups = async (facilityGroupIds) => {
  try {
    const query = 'SELECT fg_idx, fg_name, fc_idx, origin_check FROM tb_aasx_data_aas WHERE fg_idx IN (?)';
    const [results] = await pool.promise().query(query, [facilityGroupIds]);

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

    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      const deleteGroupsQuery = 'DELETE FROM tb_aasx_data_aas WHERE fg_idx IN (?)';
      const [deleteResult] = await connection.query(deleteGroupsQuery, [deletableGroupIds]);

      await connection.commit();

      return {
        success: true,
        message: `${deletableGroups.length}개의 설비그룹이 성공적으로 삭제되었습니다.`,
        deletedCount: deletableGroups.length,
        deletedGroups: deletableGroups.map((group) => group.fg_name),
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    throw err;
  }
};

// 공장 삭제
export const deleteFactories = async (factoryIds) => {
  try {
    const query = 'SELECT fc_idx, fc_name, origin_check FROM tb_aasx_data WHERE fc_idx IN (?)';
    const [results] = await pool.promise().query(query, [factoryIds]);

    if (results.length === 0) {
      return {
        success: true,
        message: '삭제할 공장이 없습니다.',
        deletedCount: 0,
      };
    }

    const protectedFactories = results.filter((factory) => factory.origin_check === 1);
    if (protectedFactories.length > 0) {
      return {
        success: false,
        message: `다음 공장들은 삭제할 수 없습니다: ${protectedFactories.map((f) => f.fc_name).join(', ')}`,
        protectedCount: protectedFactories.length,
      };
    }

    const deletableFactories = results.filter((factory) => factory.origin_check === 0);
    if (deletableFactories.length === 0) {
      return {
        success: true,
        message: '삭제할 수 있는 공장이 없습니다.',
        deletedCount: 0,
      };
    }

    const deletableFactoryIds = deletableFactories.map((factory) => factory.fc_idx);

    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      const deleteFactoriesQuery = 'DELETE FROM tb_aasx_data WHERE fc_idx IN (?)';
      const [deleteResult] = await connection.query(deleteFactoriesQuery, [deletableFactoryIds]);

      await connection.commit();

      return {
        success: true,
        message: `${deletableFactories.length}개의 공장이 성공적으로 삭제되었습니다.`,
        deletedCount: deletableFactories.length,
        deletedFactories: deletableFactories.map((factory) => factory.fc_name),
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    throw err;
  }
};
