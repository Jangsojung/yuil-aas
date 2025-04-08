import { pool } from '../../index.js';

export const insertConvertsToDB = async (fc_idx, start, end) => {
  try {
    const file_name = '제1공장-' + start + '-' + end;
    const query = `insert into tb_aasx_file (fc_idx, af_kind, af_name, af_path) values (?, 1, ?, '/src/files/front')`;
    await pool.promise().query(query, [fc_idx, file_name]);

    console.log('Edge Gateway inserted successfully');
  } catch (err) {
    console.log('Failed to insert Edge Gateway: ', err);
    throw err;
  }
};
