import { pool } from '../config/database.js';

/**
 * 단일 결과 조회 (첫 번째 행만 반환)
 * @param {string} query - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise<Object|null>} 결과 객체 또는 null
 */
export const querySingle = async (query, params = []) => {
  const [results] = await pool.promise().query(query, params);
  return results.length > 0 ? results[0] : null;
};

/**
 * 여러 결과 조회
 * @param {string} query - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise<Array>} 결과 배열
 */
export const queryMultiple = async (query, params = []) => {
  const [results] = await pool.promise().query(query, params);
  return results;
};

/**
 * INSERT 쿼리 실행
 * @param {string} query - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise<Object>} insertId를 포함한 결과
 */
export const queryInsert = async (query, params = []) => {
  const [result] = await pool.promise().query(query, params);
  return result;
};

/**
 * UPDATE/DELETE 쿼리 실행
 * @param {string} query - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise<Object>} affectedRows를 포함한 결과
 */
export const queryUpdate = async (query, params = []) => {
  const [result] = await pool.promise().query(query, params);
  return result;
};

/**
 * 트랜잭션 실행 헬퍼
 * @param {Function} callback - 트랜잭션 내에서 실행할 함수
 * @returns {Promise<any>} 콜백 함수의 결과
 */
export const withTransaction = async (callback) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * 존재 여부 확인
 * @param {string} query - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise<boolean>} 존재 여부
 */
export const exists = async (query, params = []) => {
  const [results] = await pool.promise().query(query, params);
  return results.length > 0;
};
