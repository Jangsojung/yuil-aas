import { API_ENDPOINTS, apiHelpers } from '../../config/api';

// 파일 삭제
export const deleteAASXAPI = async (ids) => {
  try {
    const result = await apiHelpers.delete('/api/file/files', { ids });
    return result;
  } catch (error) {
    console.error('Error deleting files:', error);
    throw error;
  }
};

export const getFilesAPI = async (startDate, endDate, af_kind = 3) => {
  try {
    const result = await apiHelpers.post('/api/file/aasxFiles', {
      af_kind,
      fc_idx: 3,
      startDate,
      endDate,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
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
