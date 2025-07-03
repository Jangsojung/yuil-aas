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
    console.log('deleteSensors API 호출:', sensorIds);
    const result = await apiHelpers.post('/api/facility/aasx/sensors', { sensorIds });
    console.log('deleteSensors API 결과:', result);
    return result;
  } catch (error) {
    console.error('Error deleting sensors:', error);
    throw error;
  }
};

export const deleteFacilities = async (facilityIds) => {
  try {
    console.log('deleteFacilities API 호출:', facilityIds);
    const result = await apiHelpers.post('/api/facility/aasx/facilities', { facilityIds });
    console.log('deleteFacilities API 결과:', result);
    return result;
  } catch (error) {
    console.error('Error deleting facilities:', error);
    throw error;
  }
};

export const deleteFacilityGroups = async (facilityGroupIds) => {
  try {
    console.log('deleteFacilityGroups API 호출:', facilityGroupIds);
    const result = await apiHelpers.post('/api/facility/aasx/facility-groups', { facilityGroupIds });
    console.log('deleteFacilityGroups API 결과:', result);
    return result;
  } catch (error) {
    console.error('Error deleting facility groups:', error);
    throw error;
  }
};

export const deleteFactories = async (factoryIds) => {
  try {
    console.log('deleteFactories API 호출:', factoryIds);
    const result = await apiHelpers.post('/api/facility/aasx/factories', { factoryIds });
    console.log('deleteFactories API 결과:', result);
    return result;
  } catch (error) {
    console.error('Error deleting factories:', error);
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
