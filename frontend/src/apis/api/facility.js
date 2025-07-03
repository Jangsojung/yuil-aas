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
  const res = await apiHelpers.delete('/api/facility/aasx/sensors', { sensorIds });
  return res;
};

export const synchronizeFacility = async () => {
  const res = await apiHelpers.post('/api/facility/aasx/synchronize');
  return res;
};
