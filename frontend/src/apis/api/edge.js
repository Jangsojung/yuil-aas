import { API_ENDPOINTS, apiHelpers, API_BASE_URL } from '../../config/api';

export const deleteEdgeAPI = async (data) => {
  try {
    const result = await apiHelpers.delete(API_ENDPOINTS.EDGE_GATEWAY.LIST, data);
    return result;
  } catch (error) {
    throw error;
  }
};

export const getEdgeAPI = async () => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.EDGE_GATEWAY.LIST);
    return data?.data || (Array.isArray(data) ? data : []);
  } catch (error) {
    return [];
  }
};

export const getEdgeWithStatusAPI = async () => {
  try {
    const data = await apiHelpers.post(API_ENDPOINTS.EDGE_GATEWAY.STATUS);
    return data?.data || (Array.isArray(data) ? data : []);
  } catch (error) {
    return [];
  }
};

export const insertEdgeAPI = async (data) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.EDGE_GATEWAY.INSERT, data);
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateEdgeAPI = async (data) => {
  try {
    const result = await apiHelpers.put(API_ENDPOINTS.EDGE_GATEWAY.LIST, data);
    return result;
  } catch (error) {
    throw error;
  }
};

export const checkEdgePingAPI = async (ip, port) => {
  const url = `${API_BASE_URL}/api/edge_gateway/ping`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, port }),
  });
  if (!response.ok) throw new Error('Ping check failed');
  return response.json();
};
