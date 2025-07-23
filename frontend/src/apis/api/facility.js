import { apiHelpers } from '../../config/api';

export const postFacilityGroup = async (data) => {
  const res = await apiHelpers.post('/api/facility/aasx/group', data);
  return res.fg_idx !== undefined ? res.fg_idx : res.data?.fg_idx;
};

export const postFacility = async (data) => {
  const res = await apiHelpers.post('/api/facility/aasx/facility', data);
  return res.fa_idx !== undefined ? res.fa_idx : res.data?.fa_idx;
};

export const postSensor = async (data) => {
  const res = await apiHelpers.post('/api/facility/aasx/sensor', data);
  return res.sn_idx;
};

export const postFactory = async (data) => {
  const res = await apiHelpers.post('/api/facility/aasx/factory', data);
  return res.fc_idx;
};

export const deleteSensors = async (sensorIds) => {
  try {
    const result = await apiHelpers.post('/api/facility/aasx/sensors', { sensorIds });
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteFacilities = async (facilityIds) => {
  try {
    const result = await apiHelpers.post('/api/facility/aasx/facilities', { facilityIds });
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteFacilityGroups = async (facilityGroupIds) => {
  try {
    const result = await apiHelpers.post('/api/facility/aasx/facility-groups', { facilityGroupIds });
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteFactories = async (factoryIds) => {
  try {
    const result = await apiHelpers.post('/api/facility/aasx/factories', { factoryIds });
    return result;
  } catch (error) {
    throw error;
  }
};

export const synchronizeFacility = async (cm_idx) => {
  try {
    const result = await apiHelpers.post('/api/facility/aasx/synchronize', { cm_idx });
    return result;
  } catch (error) {
    throw error;
  }
};

export const getFactoriesByCmIdxFacility = async (cm_idx) => {
  try {
    const result = await apiHelpers.post('/api/facility/aasx/factories/list', { cm_idx });
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    throw error;
  }
};

export const getFacilityGroups = async (fc_idx) => {
  try {
    const result = await apiHelpers.post('/api/facility/aasx/facility_groups/list', { fc_idx });
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.data?.data)) return result.data.data;
    return [];
  } catch (error) {
    throw error;
  }
};

export const getFacilities = async (fg_idx) => {
  try {
    const result = await apiHelpers.post('/api/facility/aasx/facilities/list', { fg_idx });
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.data?.data)) return result.data.data;
    return [];
  } catch (error) {
    throw error;
  }
};
