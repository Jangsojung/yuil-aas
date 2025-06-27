import { API_ENDPOINTS, apiHelpers } from '../../config/api';

export const deleteDataAPI = async (selectedFiles) => {
  try {
    const result = await apiHelpers.delete(API_ENDPOINTS.FILE.ROOT, selectedFiles);
    return result;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
};

export const getDataAPI = async () => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.ROOT);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const getAASXFilesAPI = async (start, end) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.AASX_FILES, {
      af_kind: 2,
      fc_idx: 3,
      startDate: start,
      endDate: end,
    });
    return data;
  } catch (error) {
    console.error('Error fetching AASX files:', error);
    throw error;
  }
};

export const getWordsAPI = async () => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.WORDS, {
      fc_idx: 3,
    });
    return data;
  } catch (error) {
    console.error('Error fetching words:', error);
    throw error;
  }
};

export const getSearchAPI = async (type, text) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.SEARCH, {
      fc_idx: 3,
      type: type,
      text: text,
    });
    return data;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};
