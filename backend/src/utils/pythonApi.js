import { validatePythonServerURL } from '../config/validation.js';

const PYTHON_SERVER_URL = validatePythonServerURL();

/**
 * Python 서버에 POST 요청 보내기
 * @param {string} endpoint - API 엔드포인트 (예: '/api/aas', '/api/aasx')
 * @param {Object} data - 전송할 데이터
 * @returns {Promise<Response>} 응답 객체
 */
export const callPythonApi = async (endpoint, data) => {
  const response = await fetch(`${PYTHON_SERVER_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Python 서버 API 호출 실패 (${response.status}): ${errorText}`);
  }

  return response;
};

/**
 * Python 서버에 DELETE 요청 보내기
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 전송할 데이터
 * @returns {Promise<Response>} 응답 객체
 */
export const deletePythonApi = async (endpoint, data) => {
  const response = await fetch(`${PYTHON_SERVER_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Python 서버 API 삭제 실패 (${response.status}): ${errorText}`);
  }

  return response;
};

/**
 * AAS 파일 생성 API 호출
 * @param {string} filePath - 파일 경로
 * @param {string} linkName - 링크명 (선택사항)
 * @returns {Promise<Response>} 응답 객체
 */
export const createAasFile = async (filePath, linkName) => {
  return await callPythonApi('/api/aas', { path: filePath, linkName });
};

/**
 * AASX 파일 생성 API 호출
 * @param {string} filePath - 파일 경로
 * @returns {Promise<Response>} 응답 객체
 */
export const createAasxFile = async (filePath) => {
  return await callPythonApi('/api/aasx', { path: filePath });
};

/**
 * 파일 삭제 API 호출
 * @param {Array<string>} paths - 삭제할 파일 경로들
 * @returns {Promise<Response>} 응답 객체
 */
export const deleteFiles = async (paths) => {
  return await deletePythonApi('/api/aas', { paths });
};
