'// Basic API functions';

import { API_ENDPOINTS, apiHelpers } from '../../config/api';

// 기초코드 목록 조회
export const getBasesAPI = async () => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASES);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching bases:', error);
    return [];
  }
};

// 기초코드 삭제
export const deleteBasesAPI = async (ids) => {
  try {
    const result = await apiHelpers.delete(API_ENDPOINTS.BASE_CODE.BASES, { ids });
    return result;
  } catch (error) {
    console.error('Error deleting bases:', error);
    throw error;
  }
};

// 기초코드 등록
export const insertBaseAPI = async (data) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASES_INSERT, data);
    return result;
  } catch (error) {
    console.error('Error inserting base:', error);
    throw error;
  }
};

// 기초코드 수정
export const updateBaseAPI = async (data) => {
  try {
    const result = await apiHelpers.put(API_ENDPOINTS.BASE_CODE.BASES, data);
    return result;
  } catch (error) {
    console.error('Error updating base:', error);
    throw error;
  }
};

// 기초코드별 센서 조회
export const getBaseSensorsAPI = async (ab_idx) => {
  try {
    const result = await apiHelpers.post(`${API_ENDPOINTS.BASE_CODE.BASES}/${ab_idx}/sensors`);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching base sensors:', error);
    return [];
  }
};

// 설비그룹 조회
export const getFacilityGroupsAPI = async (fc_idx = 3) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.FACILITY_GROUPS, { fc_idx });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching facility groups:', error);
    return [];
  }
};

// 설비 조회
export const getFacilitiesAPI = async (fg_idx) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASE_CODE, { fg_idx });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return [];
  }
};

// 센서 조회
export const getSensorsAPI = async (fa_idx) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.SENSORS, { fa_idx });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching sensors:', error);
    return [];
  }
};

// 트리 데이터 구축을 위한 통합 API
export const buildTreeDataAPI = async (selectedFacilityGroups = [], facilityName = '', sensorName = '') => {
  try {
    // 1. 모든 설비그룹 조회
    const allFacilityGroups = await getFacilityGroupsAPI(3);

    // 2. 필터링된 설비그룹
    let filteredFacilityGroups = allFacilityGroups;
    if (selectedFacilityGroups.length > 0) {
      filteredFacilityGroups = allFacilityGroups.filter((fg) => selectedFacilityGroups.includes(fg.fg_idx));
    }

    // 3. 각 설비그룹별로 설비와 센서 정보 조회
    const facilitiesAll = await Promise.all(
      filteredFacilityGroups.map(async (fg) => {
        const facilities = await getFacilitiesAPI(fg.fg_idx);
        const facilitiesArray = Array.isArray(facilities) ? facilities : [];

        // 설비명 필터링
        let filteredFacilities = facilitiesArray;
        if (facilityName.trim()) {
          filteredFacilities = facilitiesArray.filter(
            (fa) => fa.fa_name && fa.fa_name.toLowerCase().includes(facilityName.trim().toLowerCase())
          );
        }

        // 각 설비별로 센서 정보 조회
        const facilitiesWithSensors = await Promise.all(
          filteredFacilities.map(async (fa) => {
            const sensors = await getSensorsAPI(fa.fa_idx);
            const sensorsArray = Array.isArray(sensors) ? sensors : [];

            // 센서명 필터링
            let filteredSensors = sensorsArray;
            if (sensorName.trim()) {
              filteredSensors = sensorsArray.filter(
                (sensor) => sensor.sn_name && sensor.sn_name.toLowerCase().includes(sensorName.trim().toLowerCase())
              );
            }

            return { ...fa, sensors: filteredSensors };
          })
        );

        // 센서가 있는 설비만 필터링
        const facilitiesWithSensorsFiltered = facilitiesWithSensors.filter(
          (fa) => fa.sensors && Array.isArray(fa.sensors) && fa.sensors.length > 0
        );
        return { ...fg, facilities: facilitiesWithSensorsFiltered };
      })
    );

    // 4. 설비가 있는 그룹만 반환
    const finalFilteredData = facilitiesAll.filter(
      (fg) => fg.facilities && Array.isArray(fg.facilities) && fg.facilities.length > 0
    );
    return finalFilteredData;
  } catch (error) {
    console.error('Error building tree data:', error);
    throw error;
  }
};

// 센서 ID로부터 트리 데이터 구축
export const buildTreeFromSensorIdsAPI = async (sensorIds) => {
  try {
    // 1. 모든 설비그룹 조회
    const allFacilityGroups = await getFacilityGroupsAPI(3);

    // 2. 각 설비그룹별로 설비와 센서 정보 조회
    const facilitiesAll = await Promise.all(
      allFacilityGroups.map(async (fg) => {
        const facilities = await getFacilitiesAPI(fg.fg_idx);
        const facilitiesArray = Array.isArray(facilities) ? facilities : [];

        const facilitiesWithSensors = await Promise.all(
          facilitiesArray.map(async (fa) => {
            const sensors = await getSensorsAPI(fa.fa_idx);
            const sensorsArray = Array.isArray(sensors) ? sensors : [];
            return { ...fa, sensors: sensorsArray };
          })
        );
        return { ...fg, facilities: facilitiesWithSensors };
      })
    );

    // 3. 선택된 센서가 포함된 설비그룹만 필터링
    const filteredFacilityGroups = facilitiesAll.filter((fg) => {
      if (!fg.facilities || !Array.isArray(fg.facilities)) return false;

      return fg.facilities.some((fa) => {
        if (!fa.sensors || !Array.isArray(fa.sensors)) return false;
        return fa.sensors.some((sensor) => sensorIds.includes(sensor.sn_idx));
      });
    });

    // 4. 각 설비그룹에서 선택된 센서만 포함하도록 필터링
    const result = filteredFacilityGroups
      .map((fg) => {
        const filteredFacilities = fg.facilities
          .map((fa) => {
            const filteredSensors = fa.sensors.filter((sensor) => sensorIds.includes(sensor.sn_idx));
            return { ...fa, sensors: filteredSensors };
          })
          .filter((fa) => fa.sensors.length > 0); // 센서가 있는 설비만 유지

        return { ...fg, facilities: filteredFacilities };
      })
      .filter((fg) => fg.facilities.length > 0); // 설비가 있는 그룹만 유지

    return result;
  } catch (error) {
    console.error('Error building tree from sensor IDs:', error);
    throw error;
  }
};

// 기초코드별 센서 조회 (테이블용)
export const getBaseSensorsForTableAPI = async (ab_idx) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASES_SENSORS, { ab_idx });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching base sensors for table:', error);
    return [];
  }
};

// 설비별 센서 조회 (테이블용)
export const getSensorsForTableAPI = async (fa_idx) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.SENSORS, { fa_idx });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching sensors for table:', error);
    return [];
  }
};
