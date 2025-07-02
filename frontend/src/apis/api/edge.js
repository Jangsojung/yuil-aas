import { API_ENDPOINTS, apiHelpers, API_BASE_URL } from '../../config/api';

export const deleteEdgeAPI = async (data) => {
  try {
    const result = await apiHelpers.delete(API_ENDPOINTS.EDGE_GATEWAY.LIST, data);
    return result;
  } catch (error) {
    console.error('Error deleting edge gateways:', error);
    throw error;
  }
};

export const getEdgeAPI = async () => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.EDGE_GATEWAY.LIST);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching edge gateways:', error);
    return [];
  }
};

export const getEdgeWithStatusAPI = async () => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.EDGE_GATEWAY.STATUS);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching edge gateways with status:', error);
    return [];
  }
};

export const insertEdgeAPI = async (data) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.EDGE_GATEWAY.INSERT, data);
    return result;
  } catch (error) {
    console.error('Error inserting edge gateway:', error);
    throw error;
  }
};

export const updateEdgeAPI = async (data) => {
  try {
    const result = await apiHelpers.put(API_ENDPOINTS.EDGE_GATEWAY.LIST, data);
    return result;
  } catch (error) {
    console.error('Error updating edge gateway:', error);
    throw error;
  }
};

export const downloadDeployFilesAPI = async () => {
  try {
    // 새 창에서 다운로드 URL 열기
    const downloadUrl = `${API_BASE_URL}/api/edge_gateway/download-deploy`;
    window.open(downloadUrl, '_blank');

    return true;
  } catch (error) {
    console.error('Error downloading deploy files:', error);
    throw error;
  }
};
