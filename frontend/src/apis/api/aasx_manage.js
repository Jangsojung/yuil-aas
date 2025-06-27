import { API_ENDPOINTS, apiHelpers } from '../../config/api';

export const deleteAASXAPI = async (selectedFiles) => {
  try {
    const result = await apiHelpers.delete(API_ENDPOINTS.FILE.AASX, selectedFiles);
    return result;
  } catch (error) {
    console.error('Error deleting AASX files:', error);
    throw error;
  }
};

export const getFilesAPI = async (start, end) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/api/file/aasxFiles?af_kind=3&fc_idx=3&startDate=${start}&endDate=${end}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error.message);
  }
};

export const getAASXAPI = async () => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.AASX);
    return data;
  } catch (error) {
    console.error('Error fetching AASX:', error);
    throw error;
  }
};

export const getAASXFilesAPI = async (start, end) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.AASX_FILES, {
      af_kind: 3,
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
