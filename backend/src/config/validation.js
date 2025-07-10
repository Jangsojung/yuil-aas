import dotenv from 'dotenv';

dotenv.config();

// JWT 시크릿 키 검증
export const validateJWTSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다. .env파일 확인');
  }
  return jwtSecret;
};

// Python 서버 URL 검증
export const validatePythonServerURL = () => {
  const pythonServerURL = process.env.PYTHON_SERVER_URL;
  if (!pythonServerURL) {
    throw new Error('PYTHON_SERVER_URL 환경변수가 설정되지 않았습니다. .env파일 확인');
  }
  return pythonServerURL;
};
