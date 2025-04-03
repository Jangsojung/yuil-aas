import { pool } from '../../index.js';

export const getFilesFromDB = async (fc_idx) => {
  return new Promise((resolve, reject) => {
    const query =
      'select af.af_idx, af.af_name, df.is_conversion, df.is_transmission from tb_aasx_file af, tb_aasx_data_flow df where af.af_idx = df.af_idx and af.fc_idx = ? order by af.af_idx desc';

    pool.query(query, [fc_idx], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const files = results.map((file) => {
          return {
            af_idx: file.af_idx,
            af_name: file.af_name,
            is_conversion: file.is_conversion,
            is_transmission: file.is_transmission,
          };
        });

        resolve(files);
      }
    });
  });
};

export const getAASXFilesFromDB = async (af_kind, fc_idx) => {
  return new Promise((resolve, reject) => {
    const query =
      'select af_idx, af_name, createdAt from tb_aasx_file where af_kind = ? and fc_idx = ? order by af_idx desc';

    pool.query(query, [af_kind, fc_idx], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const files = results.map((file) => {
          return {
            af_idx: file.af_idx,
            af_name: file.af_name,
            createdAt: file.createdAt,
          };
        });

        resolve(files);
      }
    });
  });
};
