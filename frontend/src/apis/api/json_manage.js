import { apiHelpers } from '../../config/api';
import { KINDS } from '../../constants';

// JSON 파일 목록 조회
export const getJSONFilesAPI = async (startDate, endDate, fc_idx, limit = null) => {
  try {
    const result = await apiHelpers.post('/api/file/aasxFiles', {
      af_kind: KINDS.JSON_KIND,
      fc_idx,
      startDate,
      endDate,
      limit,
    });
    return result?.data || (Array.isArray(result) ? result : []);
  } catch (error) {
    return [];
  }
};

// JSON 파일 삭제
export const deleteJSONAPI = async (fileIds) => {
  try {
    const result = await apiHelpers.delete('/api/file/files', { ids: fileIds });
    return result;
  } catch (error) {
    throw error;
  }
};

// 파일 크기 확인
export const checkJSONFileSizeAPI = async (af_idx) => {
  try {
    const result = await apiHelpers.post('/api/file/checkFileSize', { file: { af_idx, af_kind: KINDS.JSON_KIND } });
    return result;
  } catch (error) {
    throw error;
  }
};

// 단일 JSON 파일 상세 조회
export const getJSONFileDetailAPI = async (af_idx) => {
  try {
    const result = await apiHelpers.post('/api/file/verify', { file: { af_idx, af_kind: KINDS.JSON_KIND } });
    return result?.data || result;
  } catch (error) {
    throw error;
  }
};
