import { apiHelpers } from '../../config/api';

export const postFacilityGroup = async (data) => {
  const res = await apiHelpers.post('/api/facility/aasx/group', data);
  return res.fg_idx;
};

export const postFacility = async (data) => {
  const res = await apiHelpers.post('/api/facility/aasx/facility', data);
  return res.fa_idx;
};

export const postSensor = async (data) => {
  const res = await apiHelpers.post('/api/facility/aasx/sensor', data);
  return res.sn_idx;
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

export const synchronizeFacility = async () => {
  try {
    const result = await apiHelpers.post('/api/facility/aasx/synchronize');
    return result;
  } catch (error) {
    console.error('Error synchronizing facility:', error);
    throw error;
  }
};
