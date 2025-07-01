import { pool } from '../../index.js';

export const getBasesFromDB = async () => {
  return new Promise((resolve, reject) => {
    const query =
      'select b.ab_idx, b.ab_name, b.ab_note, COUNT(bs.sn_idx) as sn_length, b.createdAt from tb_aasx_base b, tb_aasx_base_sensor bs where b.ab_idx = bs.ab_idx group by b.ab_idx, b.ab_name, b.ab_note order by b.ab_idx desc';

    pool.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const bases = results.map((base) => {
          return {
            ab_idx: base.ab_idx,
            ab_name: base.ab_name,
            ab_note: base.ab_note,
            sn_length: base.sn_length,
            createdAt: base.createdAt,
          };
        });

        resolve(bases);
      }
    });
  });
};

export const insertBasesToDB = async (name, note, ids, user_idx) => {
  try {
    const query = `insert into tb_aasx_base (ab_name, ab_note, creator, updater) values (?, ?, ?, ?);`;
    const [result] = await pool.promise().query(query, [name, note || null, user_idx, user_idx]);

    const ab_idx = result.insertId;

    const query2 = `insert into tb_aasx_base_sensor (ab_idx, sn_idx) values ?`;
    const values = ids.map((id) => [ab_idx, id]);

    const [result2] = await pool.promise().query(query2, [values]);

    return {
      ab_idx,
      ab_name: name,
      ab_note: note,
    };
  } catch (err) {
    console.log('Failed to insert new Bases: ', err);
    throw err;
  }
};

export const updateBaseToDB = async (ab_idx, name, note, ids, user_idx) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `update tb_aasx_base set ab_name = ?, ab_note = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP where ab_idx = ?`,
      [name, note || null, user_idx, ab_idx]
    );
    await connection.query(`delete from tb_aasx_base_sensor where ab_idx = ?`, [ab_idx]);

    if (ids.length > 0) {
      const values = ids.map((id) => [ab_idx, id]);
      await connection.query(`insert into tb_aasx_base_sensor (ab_idx, sn_idx) values ?`, [values]);
    }

    await connection.commit();

    return {
      ab_idx,
      ab_name: name,
      ab_note: note,
    };
  } catch (err) {
    await connection.rollback();
    console.log('Failed to update Bases:', err);
    throw err;
  } finally {
    connection.release();
  }
};

export const deleteBasesFromDB = async (ids) => {
  try {
    const deleteSensorsQuery = `delete from tb_aasx_base_sensor where ab_idx in (?)`;
    await pool.promise().query(deleteSensorsQuery, [ids]);

    const deleteBasesQuery = `delete from tb_aasx_base where ab_idx in (?)`;
    await pool.promise().query(deleteBasesQuery, [ids]);

    console.log('Bases deleted successfully');
    return { success: true, message: 'Bases deleted successfully' };
  } catch (err) {
    console.log('Failed to delete Bases: ', err);
    throw err;
  }
};

export const getSelectedSensorsFromDB = async (ab_idx) => {
  return new Promise((resolve, reject) => {
    const query = 'select sn_idx from tb_aasx_base_sensor where ab_idx = ?';

    pool.query(query, [ab_idx], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const sensors = results.map((sensor) => {
          return {
            sn_idx: sensor.sn_idx,
          };
        });

        resolve(sensors);
      }
    });
  });
};

export const getFacilityGroupsFromDB = async (fc_idx = 3, order = 'asc') => {
  return new Promise((resolve, reject) => {
    const validOrder = order;

    const query = `select fg_idx, fg_name from tb_aasx_data_aas where fc_idx = ? order by fg_idx ${validOrder}`;

    pool.query(query, [fc_idx], (err, results) => {
      if (err) {
        console.error('Error querying facility groups:', err);
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const facilityGroups = results.map((facilityGroup) => {
          return {
            fg_idx: facilityGroup.fg_idx,
            fg_name: facilityGroup.fg_name,
          };
        });

        resolve(facilityGroups);
      }
    });
  });
};

export const getSensorsFromDB = async (fa_idx) => {
  return new Promise((resolve, reject) => {
    const query = 'select sn_idx, sn_name from tb_aasx_data_prop where fa_idx = ?';

    pool.query(query, [fa_idx], (err, results) => {
      if (err) {
        console.error('Error querying sensors:', err);
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const sensors = results.map((sensor) => {
          return {
            sn_idx: sensor.sn_idx,
            sn_name: sensor.sn_name,
          };
        });

        resolve(sensors);
      }
    });
  });
};

export const getBaseCodeFromDB = async (fg_idx) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT fa_idx, fa_name from tb_aasx_data_sm where fg_idx =  ?;`;

    pool.query(query, [fg_idx], (err, results) => {
      if (err) {
        console.error('Error querying facilities:', err);
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const basics = results.map((basic) => {
          return {
            fa_idx: basic.fa_idx,
            fa_name: basic.fa_name,
          };
        });

        resolve(basics);
      }
    });
  });
};

export const getAllSensorsInGroupFromDB = async (fg_idx) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.sn_idx, p.sn_name 
      FROM tb_aasx_data_prop p
      JOIN tb_aasx_data_sm s ON p.fa_idx = s.fa_idx
      WHERE s.fg_idx = ?
    `;

    pool.query(query, [fg_idx], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const sensors = results.map((sensor) => {
          return {
            sn_idx: sensor.sn_idx,
            sn_name: sensor.sn_name,
          };
        });

        resolve(sensors);
      }
    });
  });
};

export const getFactoriesByCmIdxFromDB = async (cm_idx) => {
  return new Promise((resolve, reject) => {
    // tb_aasx_data에서 공장 목록 조회 (외래키 제약 조건을 만족하기 위해)
    const query = `
      SELECT DISTINCT a.fc_idx, a.fc_name 
      FROM tb_aasx_data a
      INNER JOIN tb_factory_info f ON a.fc_idx = f.fc_idx
      WHERE f.cm_idx = ? 
      ORDER BY a.fc_idx
    `;

    pool.query(query, [cm_idx], (err, results) => {
      if (err) {
        console.error('Error querying factories:', err);
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const factories = results.map((factory) => {
          return {
            fc_idx: factory.fc_idx,
            fc_name: factory.fc_name,
          };
        });

        resolve(factories);
      }
    });
  });
};

// 공장 추가
export const insertFactoryToDB = async (cm_idx, fc_name) => {
  return new Promise(async (resolve, reject) => {
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // 최대 fc_idx 조회 (두 테이블 중 더 큰 값 사용)
      const maxFactoryQuery = 'SELECT MAX(fc_idx) as max_fc_idx FROM tb_factory_info';
      const maxAasxQuery = 'SELECT MAX(fc_idx) as max_fc_idx FROM tb_aasx_data';

      const [maxFactoryResult] = await connection.query(maxFactoryQuery);
      const [maxAasxResult] = await connection.query(maxAasxQuery);

      const maxFactoryIdx = maxFactoryResult[0].max_fc_idx || 0;
      const maxAasxIdx = maxAasxResult[0].max_fc_idx || 0;
      const nextFcIdx = Math.max(maxFactoryIdx, maxAasxIdx) + 1;

      // tb_aasx_data에 먼저 공장 정보 추가 (외래키 제약 조건을 위해)
      const insertAasxQuery = 'INSERT INTO tb_aasx_data (fc_idx, fc_name) VALUES (?, ?)';
      await connection.query(insertAasxQuery, [nextFcIdx, fc_name]);

      // tb_factory_info에 공장 추가
      const insertQuery = 'INSERT INTO tb_factory_info (cm_idx, fc_idx, fc_name) VALUES (?, ?, ?)';
      await connection.query(insertQuery, [cm_idx, nextFcIdx, fc_name]);

      await connection.commit();

      resolve({
        success: true,
        fc_idx: nextFcIdx,
        fc_name: fc_name,
        message: '공장이 성공적으로 추가되었습니다.',
      });
    } catch (err) {
      await connection.rollback();
      console.error('Failed to insert factory:', err);
      reject(err);
    } finally {
      connection.release();
    }
  });
};

// 설비그룹 추가
export const insertFacilityGroupToDB = async (fc_idx, fg_name) => {
  return new Promise(async (resolve, reject) => {
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // 최대 fg_idx 조회
      const maxQuery = 'SELECT MAX(fg_idx) as max_fg_idx FROM tb_aasx_data_aas';
      const [maxResult] = await connection.query(maxQuery);
      const nextFgIdx = (maxResult[0].max_fg_idx || 0) + 1;

      // 설비그룹 추가
      const insertQuery = 'INSERT INTO tb_aasx_data_aas (fc_idx, fg_idx, fg_name) VALUES (?, ?, ?)';
      await connection.query(insertQuery, [fc_idx, nextFgIdx, fg_name]);

      await connection.commit();

      resolve({
        success: true,
        fg_idx: nextFgIdx,
        fg_name: fg_name,
        message: '설비그룹이 성공적으로 추가되었습니다.',
      });
    } catch (err) {
      await connection.rollback();
      console.error('Failed to insert facility group:', err);
      reject(err);
    } finally {
      connection.release();
    }
  });
};

// 설비 추가
export const insertFacilityToDB = async (fg_idx, fa_name) => {
  return new Promise(async (resolve, reject) => {
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // 최대 fa_idx 조회
      const maxQuery = 'SELECT MAX(fa_idx) as max_fa_idx FROM tb_aasx_data_sm';
      const [maxResult] = await connection.query(maxQuery);
      const nextFaIdx = (maxResult[0].max_fa_idx || 0) + 1;

      // 설비 추가
      const insertQuery = 'INSERT INTO tb_aasx_data_sm (fg_idx, fa_idx, fa_name) VALUES (?, ?, ?)';
      await connection.query(insertQuery, [fg_idx, nextFaIdx, fa_name]);

      await connection.commit();

      resolve({
        success: true,
        fa_idx: nextFaIdx,
        fa_name: fa_name,
        message: '설비가 성공적으로 추가되었습니다.',
      });
    } catch (err) {
      await connection.rollback();
      console.error('Failed to insert facility:', err);
      reject(err);
    } finally {
      connection.release();
    }
  });
};

// 센서 추가
export const insertSensorToDB = async (fa_idx, sn_name) => {
  return new Promise(async (resolve, reject) => {
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // 최대 sn_idx 조회
      const maxQuery = 'SELECT MAX(sn_idx) as max_sn_idx FROM tb_aasx_data_prop';
      const [maxResult] = await connection.query(maxQuery);
      const nextSnIdx = (maxResult[0].max_sn_idx || 0) + 1;

      // 센서 추가
      const insertQuery = 'INSERT INTO tb_aasx_data_prop (fa_idx, sn_idx, sn_name) VALUES (?, ?, ?)';
      await connection.query(insertQuery, [fa_idx, nextSnIdx, sn_name]);

      await connection.commit();

      resolve({
        success: true,
        sn_idx: nextSnIdx,
        sn_name: sn_name,
        message: '센서가 성공적으로 추가되었습니다.',
      });
    } catch (err) {
      await connection.rollback();
      console.error('Failed to insert sensor:', err);
      reject(err);
    } finally {
      connection.release();
    }
  });
};

// 기존 공장들을 tb_aasx_data에 동기화
export const syncFactoriesToAasxData = async () => {
  return new Promise(async (resolve, reject) => {
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // tb_factory_info에 있는 공장들을 조회
      const factoryQuery = 'SELECT fc_idx, fc_name FROM tb_factory_info';
      const [factoryResult] = await connection.query(factoryQuery);

      let syncedCount = 0;
      for (const factory of factoryResult) {
        // tb_aasx_data에 이미 있는지 확인
        const checkQuery = 'SELECT fc_idx FROM tb_aasx_data WHERE fc_idx = ?';
        const [checkResult] = await connection.query(checkQuery, [factory.fc_idx]);

        if (checkResult.length === 0) {
          // 없으면 추가
          const insertQuery = 'INSERT INTO tb_aasx_data (fc_idx, fc_name) VALUES (?, ?)';
          await connection.query(insertQuery, [factory.fc_idx, factory.fc_name]);
          syncedCount++;
        }
      }

      await connection.commit();

      resolve({
        success: true,
        syncedCount: syncedCount,
        message: `${syncedCount}개의 공장이 tb_aasx_data에 동기화되었습니다.`,
      });
    } catch (err) {
      await connection.rollback();
      console.error('Failed to sync factories:', err);
      reject(err);
    } finally {
      connection.release();
    }
  });
};
