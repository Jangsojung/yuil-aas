import { apiHelpers } from '../../config/api';
import { DEFAULTS } from '../../constants';

// JSON 파일 목록 조회 (af_kind=1)
export const getJSONFilesAPI = async (startDate, endDate) => {
  try {
    const result = await apiHelpers.post('/api/file/aasxFiles', {
      af_kind: 1,
      fc_idx: DEFAULTS.FACILITY_GROUP_ID,
      startDate,
      endDate,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching JSON files:', error);
    return [];
  }
};

// JSON 파일 삭제
export const deleteJSONAPI = async (fileIds) => {
  try {
    const result = await apiHelpers.delete('/api/file/files', { ids: fileIds });
    return result;
  } catch (error) {
    console.error('Error deleting JSON files:', error);
    throw error;
  }
};
