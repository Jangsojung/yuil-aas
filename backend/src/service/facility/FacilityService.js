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
