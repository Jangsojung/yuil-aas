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

export const getBaseCodeFromDB = async (fc_idx) => {
  return new Promise((res, rej) => {
    const query =
      'select aas.fg_name, sm.fa_name, prop.sn_name from tb_aasx_data a, tb_aasx_data_aas aas, tb_aasx_data_sm sm, tb_aasx_data_prop prop where a.fc_idx =  ?';

    pool.query(query, [fc_idx], (err, results) => {
      if (err) {
        rej(err);
      } else {
        if (results.length === 0) {
          res(null);
          return;
        }

        const camera = {
          name: results[0].CAMERA_NAME,
        };
        res(camera);
      }
    });
  });
};
