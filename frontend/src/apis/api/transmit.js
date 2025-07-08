import { API_ENDPOINTS, apiHelpers } from '../../config/api';

export const handleVerifyAPI = async (selectedFile) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.VERIFY, {
      file: selectedFile,
    });
    return data;
  } catch (error) {
    console.error('Error verifying file:', error);
    throw error;
  }
};

// 설비그룹 조회 (transmit용)
export const getFacilityGroupsForTransmitAPI = async (factoryId) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.FACILITY_GROUPS, {
      fc_idx: factoryId,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching facility groups for transmit:', error);
    return [];
  }
};

// 설비 조회 (transmit용)
export const getFacilitiesForTransmitAPI = async (fg_idx) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASE_CODE, { fg_idx });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching facilities for transmit:', error);
    return [];
  }
};

// 센서 조회 (transmit용)
export const getSensorsForTransmitAPI = async (fa_idx) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.SENSORS, { fa_idx });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching sensors for transmit:', error);
    return [];
  }
};

// 트리 데이터 구축 (transmit용)
export const buildTransmitTreeDataAPI = async (factoryId) => {
  try {
    // 1. 선택된 공장의 설비그룹 조회
    const facilityGroups = await getFacilityGroupsForTransmitAPI(factoryId);

    // 2. 각 설비그룹별로 설비와 센서 정보 조회
    const facilitiesAll = await Promise.all(
      facilityGroups.map(async (fg) => {
        const facilities = await getFacilitiesForTransmitAPI(fg.fg_idx);
        const facilitiesWithSensors = await Promise.all(
          facilities.map(async (fa) => {
            const sensors = await getSensorsForTransmitAPI(fa.fa_idx);
            return { ...fa, sensors };
          })
        );
        return { ...fg, facilities: facilitiesWithSensors };
      })
    );

    return facilitiesAll;
  } catch (error) {
    console.error('Error building transmit tree data:', error);
    return [];
  }
};
