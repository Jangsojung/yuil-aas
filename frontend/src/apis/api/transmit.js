import { API_ENDPOINTS, apiHelpers } from '../../config/api';

export const handleVerifyAPI = async (selectedFile) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.VERIFY, {
      file: selectedFile,
    });
    return data;
  } catch (error) {
    console.error('Error verifying file:', error);
    throw error;
  }
};
