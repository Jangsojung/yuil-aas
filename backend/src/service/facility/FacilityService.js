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
    const affectedFacilityIds = [...new Set(deletableSensors.map((sensor) => sensor.fa_idx))];

    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // 1. 센서 삭제
      const deleteQuery = 'DELETE FROM tb_aasx_data_prop WHERE sn_idx IN (?)';
      const [deleteResult] = await connection.query(deleteQuery, [deletableSensorIds]);

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
        const deleteEmptyFacilitiesQuery = 'DELETE FROM tb_aasx_data_sm WHERE fa_idx IN (?)';
        await connection.query(deleteEmptyFacilitiesQuery, [emptyFacilityIds]);
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

      await connection.commit();

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

export const synchronizeFacilityData = async (progressCallback) => {
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
      const [existingFactory] = await connection.query('SELECT fc_idx FROM tb_aasx_data WHERE fc_idx = ?', [
        factory.fc_idx,
      ]);

      if (existingFactory.length === 0) {
        // fc_idx가 없으면 새로 추가
        await connection.query('INSERT INTO tb_aasx_data (fc_idx, fc_name) VALUES (?, ?)', [
          factory.fc_idx,
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

          try {
            // 1. 기존 fc_idx를 새로운 값으로 변경
            await connection.query('UPDATE tb_aasx_data SET fc_idx = ? WHERE fc_idx = ?', [newFcIdx, factory.fc_idx]);

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

            // 4. 새로운 (fc_idx, fc_name) 조합으로 저장
            await connection.query('INSERT INTO tb_aasx_data (fc_idx, fc_name) VALUES (?, ?)', [
              factory.fc_idx,
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
      const [existingGroup] = await connection.query('SELECT fg_idx FROM tb_aasx_data_aas WHERE fg_idx = ?', [
        group.fg_idx,
      ]);

      if (existingGroup.length === 0) {
        // fg_idx가 없으면 새로 추가
        await connection.query('INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx) VALUES (?, ?, ?)', [
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

          try {
            // 1. 기존 fg_idx를 새로운 값으로 변경
            await connection.query('UPDATE tb_aasx_data_aas SET fg_idx = ? WHERE fg_idx = ?', [newFgIdx, group.fg_idx]);

            // 2. tb_facility_info의 fg_idx 참조 업데이트
            await connection.query('UPDATE tb_facility_info SET fg_idx = ? WHERE fg_idx = ?', [newFgIdx, group.fg_idx]);

            // 3. tb_aasx_data_sm의 fg_idx 참조 업데이트
            await connection.query('UPDATE tb_aasx_data_sm SET fg_idx = ? WHERE fg_idx = ?', [newFgIdx, group.fg_idx]);

            // 4. 새로운 (fg_idx, fg_name) 조합으로 저장
            await connection.query('INSERT INTO tb_aasx_data_aas (fg_idx, fg_name, fc_idx) VALUES (?, ?, ?)', [
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
        console.log(
          `설비그룹 ${facility.fg_idx}가 tb_aasx_data_aas에 존재하지 않아 설비 ${facility.fa_name}을 건너뜁니다.`
        );
        continue; // 해당 설비그룹이 없으면 설비 추가를 건너뜀
      }

      const [existingFacility] = await connection.query('SELECT fa_idx FROM tb_aasx_data_sm WHERE fa_idx = ?', [
        facility.fa_idx,
      ]);

      if (existingFacility.length === 0) {
        // fa_idx가 없으면 새로 추가
        await connection.query('INSERT INTO tb_aasx_data_sm (fa_idx, fa_name, fg_idx) VALUES (?, ?, ?)', [
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

          try {
            // 1. 기존 fa_idx를 새로운 값으로 변경
            await connection.query('UPDATE tb_aasx_data_sm SET fa_idx = ? WHERE fa_idx = ?', [
              newFaIdx,
              facility.fa_idx,
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

            // 4. 새로운 (fa_idx, fa_name) 조합으로 저장
            await connection.query('INSERT INTO tb_aasx_data_sm (fa_idx, fa_name, fg_idx) VALUES (?, ?, ?)', [
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
        console.log(`설비 ${sensor.fa_idx}가 tb_aasx_data_sm에 존재하지 않아 센서 ${sensor.sn_name}을 건너뜁니다.`);
        continue; // 해당 설비가 없으면 센서 추가를 건너뜀
      }

      const [existingSensor] = await connection.query('SELECT sn_idx FROM tb_aasx_data_prop WHERE sn_idx = ?', [
        sensor.sn_idx,
      ]);

      if (existingSensor.length === 0) {
        // sn_idx가 없으면 새로 추가
        await connection.query('INSERT INTO tb_aasx_data_prop (sn_idx, sn_name, fa_idx) VALUES (?, ?, ?)', [
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

          try {
            // 1. 기존 sn_idx를 새로운 값으로 변경
            await connection.query('UPDATE tb_aasx_data_prop SET sn_idx = ? WHERE sn_idx = ?', [
              newSnIdx,
              sensor.sn_idx,
            ]);

            // 2. tb_aasx_base_sensor의 sn_idx 참조 업데이트
            await connection.query('UPDATE tb_aasx_base_sensor SET sn_idx = ? WHERE sn_idx = ?', [
              newSnIdx,
              sensor.sn_idx,
            ]);

            // 3. 새로운 (sn_idx, sn_name) 조합으로 저장
            await connection.query('INSERT INTO tb_aasx_data_prop (sn_idx, sn_name, fa_idx) VALUES (?, ?, ?)', [
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
    const affectedGroupIds = [...new Set(deletableFacilities.map((facility) => facility.fg_idx))];

    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // 1. 설비 삭제
      const deleteFacilitiesQuery = 'DELETE FROM tb_aasx_data_sm WHERE fa_idx IN (?)';
      const [deleteResult] = await connection.query(deleteFacilitiesQuery, [deletableFacilityIds]);

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
        const deleteEmptyGroupsQuery = 'DELETE FROM tb_aasx_data_aas WHERE fg_idx IN (?)';
        await connection.query(deleteEmptyGroupsQuery, [emptyGroupIds]);
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

      await connection.commit();

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
    const affectedFactoryIds = [...new Set(deletableGroups.map((group) => group.fc_idx))];

    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // 1. 설비그룹 삭제
      const deleteGroupsQuery = 'DELETE FROM tb_aasx_data_aas WHERE fg_idx IN (?)';
      const [deleteResult] = await connection.query(deleteGroupsQuery, [deletableGroupIds]);

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
        const deleteEmptyFactoriesQuery = 'DELETE FROM tb_aasx_data WHERE fc_idx IN (?)';
        await connection.query(deleteEmptyFactoriesQuery, [emptyFactoryIds]);
        autoDeletedFactories = emptyFactories.map((factory) => factory.fc_name);
      }

      await connection.commit();

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
