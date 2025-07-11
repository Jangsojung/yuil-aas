import { API_ENDPOINTS, apiHelpers } from '../../config/api';
import { KINDS } from '../../constants';

// 파일 삭제
export const deleteAASXAPI = async (ids) => {
  try {
    const result = await apiHelpers.delete('/api/file/files', { ids });
    return result;
  } catch (error) {
    throw error;
  }
};

export const getFilesAPI = async (startDate, endDate, fc_idx, af_kind = KINDS.AASX_KIND, limit = null) => {
  try {
    const result = await apiHelpers.post('/api/file/aasxFiles', {
      af_kind,
      fc_idx,
      startDate,
      endDate,
      limit,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    return [];
  }
};

export const getAASXAPI = async (af_kind = KINDS.AASX_KIND) => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.FILE.AASX, {
      af_kind,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAASXFilesAPI = async (start, end, fc_idx, af_kind = KINDS.AASX_KIND) => {
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

export const getFileFCIdxAPI = async (fileName, af_kind = KINDS.JSON_KIND) => {
  try {
    const result = await apiHelpers.post('/api/file/getFileFCIdx', { fileName, af_kind });
    return result;
  } catch (error) {
    return null;
  }
};

// AASX 파일 업로드
export const uploadAASXFileAPI = async (fileData, userIdx, fc_idx, linkName = 'aasx.com') => {
  try {
    const formData = new FormData();
    formData.append('fc_idx', fc_idx.toString());
    formData.append('user_idx', userIdx.toString());
    formData.append('linkName', linkName);
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
export const updateAASXFileAPI = async (af_idx, fileName, userIdx, fc_idx, linkName = 'aasx.com') => {
  try {
    const result = await apiHelpers.post(
      `${API_ENDPOINTS.FILE.AASX_UPDATE}?af_idx=${af_idx}&user_idx=${userIdx}&fc_idx=${fc_idx}`,
      {
        fileName,
        linkName,
      }
    );
    return result;
  } catch (error) {
    throw error;
  }
};

// AASX 파일 목록 조회 (간단한 버전)
export const getAASXFilesListAPI = async (af_kind = KINDS.AASX_KIND) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.FILE.AASX_FILES, {
      af_kind,
    });
    return result;
  } catch (error) {
    throw error;
  }
};
