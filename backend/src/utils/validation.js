// 파라미터 검증 유틸리티 함수들

/**
 * 값이 유효한지 검증 (null, undefined, 빈 문자열 체크)
 * @param {any} value - 검증할 값
 * @param {any} defaultValue - 기본값 (기본값: null)
 * @returns {any} 검증된 값 또는 기본값
 */
export const validateValue = (value, defaultValue = null) => {
  return value && value !== null && value !== undefined ? value : defaultValue;
};

/**
 * 숫자 값 검증
 * @param {any} value - 검증할 값
 * @param {number} defaultValue - 기본값 (기본값: null)
 * @returns {number|null} 검증된 숫자 또는 null
 */
export const validateNumber = (value, defaultValue = null) => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return !isNaN(num) ? num : defaultValue;
};

/**
 * fc_idx 특별 검증 (-1 제외)
 * @param {any} value - 검증할 값
 * @param {any} defaultValue - 기본값 (기본값: null)
 * @returns {any} 검증된 값 또는 기본값
 */
export const validateFcIdx = (value, defaultValue = null) => {
  if (value === null || value === undefined || value === -1) return defaultValue;
  return value;
};

/**
 * 날짜 값 검증
 * @param {any} value - 검증할 값
 * @param {any} defaultValue - 기본값 (기본값: null)
 * @returns {any} 검증된 값 또는 기본값
 */
export const validateDate = (value, defaultValue = null) => {
  if (!value || value === null || value === undefined) return defaultValue;
  return value;
};

/**
 * 배열 값 검증
 * @param {any} value - 검증할 값
 * @param {Array} defaultValue - 기본값 (기본값: [])
 * @returns {Array} 검증된 배열 또는 기본값
 */
export const validateArray = (value, defaultValue = []) => {
  return Array.isArray(value) ? value : defaultValue;
};
