import { API_ENDPOINTS, apiHelpers } from '../../config/api';
import { DEFAULTS } from '../../constants';

// 파일 삭제
export const deleteAASXAPI = async (ids) => {
  try {
    const result = await apiHelpers.delete('/api/file/files', { ids });
    return result;
  } catch (error) {
    throw error;
  }
};

export const getFilesAPI = async (startDate, endDate, af_kind = DEFAULTS.AASX_KIND) => {
  try {
    const result = await apiHelpers.post('/api/file/aasxFiles', {
      af_kind,
      fc_idx: DEFAULTS.FACILITY_GROUP_ID,
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

export const getAASXFilesAPI = async (start, end) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.AASX_FILES, {
      af_kind: DEFAULTS.AASX_KIND,
      fc_idx: DEFAULTS.FACILITY_GROUP_ID,
      startDate: start,
      endDate: end,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// AASX 파일 업로드
export const uploadAASXFileAPI = async (fileData, userIdx) => {
  try {
    const formData = new FormData();
    formData.append('fc_idx', DEFAULTS.FACILITY_GROUP_ID.toString());
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
export const updateAASXFileAPI = async (af_idx, fileName, userIdx) => {
  try {
    const result = await apiHelpers.post(`${API_ENDPOINTS.FILE.AASX_UPDATE}?af_idx=${af_idx}&user_idx=${userIdx}`, {
      fileName,
    });
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
