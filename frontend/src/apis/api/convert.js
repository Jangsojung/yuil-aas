import { API_ENDPOINTS, apiHelpers } from '../../config/api';

export const getBasesAPI = async (fc_idx) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASES, { fc_idx });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

export const getBaseFCIdxAPI = async (ab_idx) => {
  try {
    const data = await apiHelpers.post(`${API_ENDPOINTS.BASE_CODE.BASES}/${ab_idx}/fc_idx`);
    return data.fc_idx;
  } catch (error) {
    throw error;
  }
};

export const insertJSONAPI = async (params, signal) => {
  try {
    const data = await apiHelpers.post(
      API_ENDPOINTS.CONVERT,
      {
        fc_idx: params.fc_idx,
        user_idx: params.user_idx,
        startDate: params.startDate,
        endDate: params.endDate,
        selectedConvert: params.ab_idx,
        af_kind: params.af_kind,
      },
      signal
    );
    return data;
  } catch (error) {
    throw error;
  }
};
