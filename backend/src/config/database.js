import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// 데이터베이스 설정 검증
const validateDatabaseConfig = () => {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  };

  // 필수 값 검증
  const missingConfigs = [];
  if (!config.host) missingConfigs.push('DB_HOST');
  if (!config.user) missingConfigs.push('DB_USER');
  if (!config.database) missingConfigs.push('DB_NAME');

  if (missingConfigs.length > 0) {
    throw new Error(`필수 데이터베이스 설정 누락: .env파일 확인`);
  }

  return config;
};

// 데이터베이스 연결 풀 생성
const dbConfig = validateDatabaseConfig();
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 데이터베이스 연결 테스트
export const testConnection = async () => {
  try {
    // 간단한 쿼리로 연결 테스트
    await pool.promise().query('SELECT 1');
    console.log('데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    return false;
  }
};
