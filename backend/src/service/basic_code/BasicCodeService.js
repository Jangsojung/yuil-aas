import { pool } from '../../index.js';

export const getFactoriesFromDB = async () => {
  return new Promise((resolve, reject) => {
    const query = 'select fc_idx, fc_name from tb_aasx_data';

    pool.query(query, (err, results) => {
      if (err) {
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

export const getBasesFromDB = async () => {
  return new Promise((resolve, reject) => {
    const query = 'select ab_idx, ab_name from tb_aasx_base';

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
          };
        });

        resolve(bases);
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
    // const query = `SELECT sm.fa_name, GROUP_CONCAT(prop.sn_name ORDER BY prop.sn_idx SEPARATOR ', ') AS sn_names
    // FROM tb_aasx_data_sm sm, tb_aasx_data_prop prop where sm.fa_idx = prop.fa_idx
    // and sm.fg_idx = ?
    // GROUP BY sm.fa_idx
    // ORDER BY sm.fa_idx;`;

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

export const insertBaseCodeToDB = async (fa_idx, fg_idx, fa_name) => {
  try {
    const query = `insert into tb_aasx_data_sm (fa_idx, fg_idx, fa_name) values (?, ?, ?);`;
    const [result] = await pool.promise().query(query, [fa_idx, fg_idx, fa_name]);

    return {
      fa_idx: fa_idx,
      fa_name: fa_name,
    };
  } catch (err) {
    console.log('Failed to insert new Equipment: ', err);
    throw err;
  }
};

export const editBaseCodeFromDB = async (fg_idx, fa_idx, fa_name) => {
  try {
    const query = `update tb_aasx_data_sm set fa_name = ? where fa_idx = ?;`;
    await pool.promise().query(query, [fa_name, fa_idx]);
  } catch (err) {
    console.log('Failed to update Facility: ', err);
    throw err;
  }
};

export const deleteBaseCodeFromDB = async (fa_idx) => {
  try {
    const query = `delete from tb_aasx_data_sm where fa_idx = ?;`;
    await pool.promise().query(query, [fa_idx]);
  } catch (err) {
    console.log('Failed to delete Facility: ', err);
    throw err;
  }
};

export const insertSensorBaseCodeFromDB = async (sn_idx, fa_idx, sn_name) => {
  try {
    const query = `insert into tb_aasx_data_prop (sn_idx, fa_idx, sn_name) values (?, ?, ?);`;
    await pool.promise().query(query, [sn_idx, fa_idx, sn_name]);

    return {
      sn_idx: sn_idx,
      sn_name: sn_name,
    };
  } catch (err) {
    console.log('Failed to insert Sensor: ', err);
    throw err;
  }
};

export const editSensorBaseCodeFromDB = async (sn_idx, sn_name) => {
  try {
    const query = `update tb_aasx_data_prop set sn_name = ? where sn_idx = ?;`;
    await pool.promise().query(query, [sn_name, sn_idx]);
  } catch (err) {
    console.log('Failed to update Sensor: ', err);
    throw err;
  }
};

export const deleteSensorBaseCodeFromDB = async (sn_idx) => {
  try {
    const query = `delete from tb_aasx_data_prop where sn_idx = ?;`;
    await pool.promise().query(query, [sn_idx]);
  } catch (err) {
    console.log('Failed to delete Sensor: ', err);
    throw err;
  }
};
