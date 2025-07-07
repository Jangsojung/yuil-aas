import { API_ENDPOINTS, apiHelpers } from '../../config/api';

// 파일 삭제
export const deleteAASXAPI = async (ids) => {
  try {
    const result = await apiHelpers.delete('/api/file/files', { ids });
    return result;
  } catch (error) {
    throw error;
  }
};

export const getFilesAPI = async (startDate, endDate, fc_idx, af_kind = 3) => {
  try {
    const result = await apiHelpers.post('/api/file/aasxFiles', {
      af_kind,
      fc_idx,
      startDate,
      endDate,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    return [];
  }
};

export const getAASXAPI = async () => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.AASX);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAASXFilesAPI = async (start, end, fc_idx, af_kind = 3) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.AASX_FILES, {
      af_kind,
      fc_idx,
      startDate: start,
      endDate: end,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// 파일명으로 fc_idx 조회
export const getFileFCIdxAPI = async (fileName) => {
  try {
    const result = await apiHelpers.post('/api/file/getFileFCIdx', { fileName });
    return result;
  } catch (error) {
    console.error('Error fetching file fc_idx:', error);
    return null;
  }
};

// AASX 파일 업로드
export const uploadAASXFileAPI = async (fileData, userIdx, fc_idx) => {
  try {
    const formData = new FormData();
    formData.append('fc_idx', fc_idx.toString());
    formData.append('user_idx', userIdx.toString());
    formData.append('file', fileData);

    const response = await fetch(API_ENDPOINTS.FILE.AASX, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = '파일 업로드 실패';
      try {
        const errorData = await response.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// AASX 파일 수정
export const updateAASXFileAPI = async (af_idx, fileName, userIdx, fc_idx) => {
  try {
    const result = await apiHelpers.post(
      `${API_ENDPOINTS.FILE.AASX_UPDATE}?af_idx=${af_idx}&user_idx=${userIdx}&fc_idx=${fc_idx}`,
      {
        fileName,
      }
    );
    return result;
  } catch (error) {
    throw error;
  }
};

// AASX 파일 목록 조회 (간단한 버전)
export const getAASXFilesListAPI = async () => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.FILE.AASX_FILES);
    return result;
  } catch (error) {
    throw error;
  }
};
