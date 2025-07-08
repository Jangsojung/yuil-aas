import { API_ENDPOINTS, apiHelpers } from '../../config/api';
import { KINDS } from '../../constants';

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
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export const getAASXFilesAPI = async (start, end, fc_idx) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.AASX_FILES, {
      af_kind: KINDS.AAS_KIND,
      fc_idx: fc_idx,
      startDate: start,
      endDate: end,
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching AASX files:', error);
    return [];
  }
};

export const getWordsAPI = async (fc_idx) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.WORDS, {
      fc_idx: fc_idx,
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
};

export const getSearchAPI = async (type, text, fc_idx) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.SEARCH, {
      fc_idx: fc_idx,
      type: type,
      text: text,
    });
    return data;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

export const updateWordAPI = async (as_kr, original_as_en, new_as_en, fc_idx) => {
  try {
    const data = await apiHelpers.put(API_ENDPOINTS.FILE.WORDS, {
      fc_idx: fc_idx,
      as_kr: as_kr,
      original_as_en: original_as_en,
      new_as_en: new_as_en,
    });
    return data;
  } catch (error) {
    console.error('Error updating word:', error);
    throw error;
  }
};

export const updateWordsAPI = async (updates) => {
  try {
    const data = await apiHelpers.put(API_ENDPOINTS.FILE.WORDS, {
      updates: updates,
    });
    return data;
  } catch (error) {
    console.error('Error updating words:', error);
    throw error;
  }
};
