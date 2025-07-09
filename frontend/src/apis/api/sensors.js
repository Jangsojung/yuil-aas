import { API_ENDPOINTS, apiHelpers } from '../../config/api';

// 기초코드별 센서 조회 (테이블용)
export const getBaseSensorsForTableAPI = async (ab_idx) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASES_SENSORS, { ab_idx });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    return [];
  }
};

// 설비별 센서 조회 (테이블용)
export const getSensorsForTableAPI = async (fa_idx) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.SENSORS, { fa_idx });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    return [];
  }
};

// 센서 값 데이터 조회
export const getSensorValuesAPI = async (sensorIds) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.SENSOR_VALUES, { sensorIds });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    return [];
  }
};
