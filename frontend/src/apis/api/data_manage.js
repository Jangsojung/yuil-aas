import { API_ENDPOINTS, apiHelpers } from '../../config/api';
import { KINDS } from '../../constants';

export const deleteDataAPI = async (selectedFiles) => {
  try {
    const result = await apiHelpers.delete(API_ENDPOINTS.FILE.ROOT, selectedFiles);
    return result;
  } catch (error) {
    throw error;
  }
};

export const getDataAPI = async () => {
  try {
    const response = await apiHelpers.post(API_ENDPOINTS.FILE.ROOT);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return [];
  }
};

export const getAASXFilesAPI = async (start, end, fc_idx) => {
  try {
    const response = await apiHelpers.post(API_ENDPOINTS.FILE.AASX_FILES, {
      af_kind: KINDS.AAS_KIND,
      fc_idx: fc_idx,
      startDate: start,
      endDate: end,
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return [];
  }
};

export const getWordsAPI = async () => {
  try {
    const response = await apiHelpers.post(API_ENDPOINTS.FILE.WORDS, {});
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return [];
  }
};

export const getSearchAPI = async (type, text) => {
  try {
    const response = await apiHelpers.post(API_ENDPOINTS.FILE.SEARCH, {
      type: type,
      text: text,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWordAPI = async (as_kr, original_as_en, new_as_en, fc_idx) => {
  try {
    const response = await apiHelpers.put(API_ENDPOINTS.FILE.WORDS, {
      fc_idx: fc_idx,
      as_kr: as_kr,
      original_as_en: original_as_en,
      new_as_en: new_as_en,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWordsAPI = async (updates) => {
  try {
    const response = await apiHelpers.put(API_ENDPOINTS.FILE.WORDS, {
      updates: updates,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
