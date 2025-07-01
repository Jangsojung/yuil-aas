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
    console.log('Failed to insert Facility Group: ', err);
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
    console.log('Failed to insert Facility: ', err);
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
    console.log('Failed to insert Sensor: ', err);
    throw err;
  }
};
