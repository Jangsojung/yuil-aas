import { API_ENDPOINTS, apiHelpers } from '../../config/api';

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
    return data;
  } catch (error) {
    console.error('Error fetching edge gateways:', error);
    throw error;
  }
};
