import { API_ENDPOINTS, apiHelpers } from '../../config/api';

export const getBasesAPI = async () => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.BASE_CODE.BASES);
    return data;
  } catch (error) {
    console.error('Error fetching bases:', error);
    throw error;
  }
};

export const insertBaseAPI = async (formattedStartDate, formattedEndDate, selectedConvert, userIdx) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.CONVERT, {
      fc_idx: 3,
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
