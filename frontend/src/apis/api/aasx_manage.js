import { API_ENDPOINTS, apiHelpers } from '../../config/api';

export const deleteAASXAPI = async (selectedFiles) => {
  try {
    const result = await apiHelpers.delete(API_ENDPOINTS.FILE.AASX, { ids: selectedFiles });
    return result;
  } catch (error) {
    console.error('Error deleting AASX files:', error);
    throw error;
  }
};

export const getFilesAPI = async (start, end) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/file/aasxFiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        af_kind: 3,
        fc_idx: 3,
        startDate: start,
        endDate: end,
      }),
    });

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

// AASX 파일 업로드
export const uploadAASXFileAPI = async (fileData, userIdx) => {
  try {
    const formData = new FormData();
    formData.append('fc_idx', '3');
    formData.append('user_idx', userIdx.toString());
    formData.append('file', fileData);

    const response = await fetch(API_ENDPOINTS.FILE.AASX, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('파일 업로드 실패');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading AASX file:', error);
    throw error;
  }
};

// AASX 파일 수정
export const updateAASXFileAPI = async (af_idx, fileName, userIdx) => {
  try {
    const result = await apiHelpers.post(`${API_ENDPOINTS.FILE.AASX}?af_idx=${af_idx}&user_idx=${userIdx}`, {
      fileName,
    });
    return result;
  } catch (error) {
    console.error('Error updating AASX file:', error);
    throw error;
  }
};

// AASX 파일 목록 조회 (간단한 버전)
export const getAASXFilesListAPI = async () => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.FILE.AASX_FILES);
    return result;
  } catch (error) {
    console.error('Error fetching AASX files list:', error);
    throw error;
  }
};
