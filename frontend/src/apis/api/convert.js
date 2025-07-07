import { API_ENDPOINTS, apiHelpers } from '../../config/api';
import { DEFAULTS } from '../../constants';

export const getBasesAPI = async (fc_idx) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASES, { fc_idx });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching bases:', error);
    return [];
  }
};

export const insertBaseAPI = async (formattedStartDate, formattedEndDate, selectedConvert, userIdx) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.CONVERT, {
      fc_idx: DEFAULTS.FACILITY_GROUP_ID,
      user_idx: userIdx,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      selectedConvert: selectedConvert,
    });
    return data;
  } catch (error) {
    console.error('Error inserting base:', error);
    throw error;
  }
};
