import { API_ENDPOINTS, apiHelpers } from '../../config/api';

// 로그인 API
export const signInAPI = async (email, password) => {
  try {
    const result = await apiHelpers.post(API_ENDPOINTS.SIGNIN, { email, password });
    return result;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};
