import { API_ENDPOINTS, apiHelpers } from '../../config/api';

export const getBasesAPI = async (fc_idx) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASES, { fc_idx });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching bases:', error);
    return [];
  }
};

export const insertBaseAPI = async (params) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.CONVERT, {
      fc_idx: params.fc_idx,
      user_idx: params.user_idx,
      startDate: params.startDate,
      endDate: params.endDate,
      selectedConvert: params.ab_idx,
    });
    return data;
  } catch (error) {
    console.error('Error inserting base:', error);
    throw error;
  }
};
