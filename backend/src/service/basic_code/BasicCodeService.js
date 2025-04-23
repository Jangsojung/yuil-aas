import { pool } from '../../index.js';

export const getBasesFromDB = async () => {
  return new Promise((resolve, reject) => {
    const query =
      'select b.ab_idx, b.ab_name, COUNT(bs.sn_idx) as sn_length from tb_aasx_base b, tb_aasx_base_sensor bs where b.ab_idx = bs.ab_idx group by b.ab_idx, b.ab_name order by b.ab_idx desc';

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
            sn_length: base.sn_length,
          };
        });

        resolve(bases);
      }
    });
  });
};

export const insertBasesToDB = async (name, ids, user_idx) => {
  try {
    const query = `insert into tb_aasx_base (ab_name, creator, updater) values (?, ?, ?);`;
    const [result] = await pool.promise().query(query, [name, user_idx, user_idx]);

    const ab_idx = result.insertId;

    const query2 = `insert into tb_aasx_base_sensor (ab_idx, sn_idx) values ?`;
    const values = ids.map((id) => [ab_idx, id]);

    const [result2] = await pool.promise().query(query2, [values]);

    return {
      ab_idx,
      ab_name: name,
    };
  } catch (err) {
    console.log('Failed to insert new Bases: ', err);
    throw err;
  }
};

export const updateBaseToDB = async (ab_idx, name, ids, user_idx) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `update tb_aasx_base set ab_name = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP where ab_idx = ?`,
      [name, user_idx, ab_idx]
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
    const query = `delete from tb_aasx_base where ab_idx in (?)`;
    await pool.promise().query(query, [ids]);

    console.log('Bases deleted successfully');
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
