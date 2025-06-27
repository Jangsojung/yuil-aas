// API 설정
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5001';

// API 엔드포인트들
export const API_ENDPOINTS = {
  // 인증
  SIGNIN: `${API_BASE_URL}/api/signin`,

  // 기본 코드 관리
  BASE_CODE: {
    BASES: `${API_BASE_URL}/api/base_code/bases`,
    BASES_INSERT: `${API_BASE_URL}/api/base_code/bases/insert`,
    FACILITY_GROUPS: `${API_BASE_URL}/api/base_code/facilityGroups`,
    SENSORS: `${API_BASE_URL}/api/base_code/sensors`,
    BASE_CODE: `${API_BASE_URL}/api/base_code`,
    ALL_SENSORS_IN_GROUP: `${API_BASE_URL}/api/base_code/allSensorsInGroup`,
  },

  // Edge Gateway 관리
  EDGE_GATEWAY: {
    LIST: `${API_BASE_URL}/api/edge_gateway`,
    INSERT: `${API_BASE_URL}/api/edge_gateway/insert`,
  },

  // 변환
  CONVERT: `${API_BASE_URL}/api/convert`,

  // 파일 관리
  FILE: {
    ROOT: `${API_BASE_URL}/api/file`,
    AASX: `${API_BASE_URL}/api/file/aasx`,
    AASX_FILES: `${API_BASE_URL}/api/file/aasxFiles`,
    VERIFY: `${API_BASE_URL}/api/file/verify`,
    WORDS: `${API_BASE_URL}/api/file/words`,
    SEARCH: `${API_BASE_URL}/api/file/search`,
  },
} as const;

// API 호출 헬퍼 함수들
export const apiHelpers = {
  // 기본 fetch 설정
  fetchWithConfig: async (url: string, options: RequestInit = {}) => {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // POST 요청
  post: async (url: string, data: any, options: RequestInit = {}) => {
    return apiHelpers.fetchWithConfig(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT 요청
  put: async (url: string, data: any, options: RequestInit = {}) => {
    return apiHelpers.fetchWithConfig(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE 요청
  delete: async (url: string, data?: any, options: RequestInit = {}) => {
    const requestOptions: RequestInit = {
      ...options,
      method: 'DELETE',
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return apiHelpers.fetchWithConfig(url, requestOptions);
  },
};

// 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  total?: number;
  page?: number;
  limit?: number;
}
