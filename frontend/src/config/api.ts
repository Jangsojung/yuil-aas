// API 설정 검증
const validateAPIBaseURL = () => {
  const apiBaseURL = process.env.REACT_APP_API_BASE_URL;
  if (!apiBaseURL) {
    throw new Error('REACT_APP_API_BASE_URL 환경변수가 설정되지 않았습니다. .env파일 확인');
  }
  return apiBaseURL;
};

const validateWSURL = () => {
  const wsURL = process.env.REACT_APP_WS_URL;
  if (!wsURL) {
    throw new Error('REACT_APP_WS_URL 환경변수가 설정되지 않았습니다. .env파일 확인');
  }
  return wsURL;
};

// API 설정
export const API_BASE_URL = validateAPIBaseURL();
export const WS_URL = validateWSURL();

// API 엔드포인트들
export const API_ENDPOINTS = {
  // 인증
  SIGNIN: `${API_BASE_URL}/api/signin`,

  // 기본 코드 관리
  BASE_CODE: {
    BASES: `${API_BASE_URL}/api/base_code/bases`,
    BASES_INSERT: `${API_BASE_URL}/api/base_code/bases/insert`,
    BASES_SENSORS: `${API_BASE_URL}/api/base_code/bases/sensors`,
    FACILITY_GROUPS: `${API_BASE_URL}/api/base_code/facilityGroups`,
    SENSORS: `${API_BASE_URL}/api/base_code/sensors`,
    BASE_CODE: `${API_BASE_URL}/api/base_code`,
    ALL_SENSORS_IN_GROUP: `${API_BASE_URL}/api/base_code/allSensorsInGroup`,
  },

  // Edge Gateway 관리
  EDGE_GATEWAY: {
    LIST: `${API_BASE_URL}/api/edge_gateway`,
    STATUS: `${API_BASE_URL}/api/edge_gateway/status`,
    INSERT: `${API_BASE_URL}/api/edge_gateway/insert`,
  },

  // 변환
  CONVERT: `${API_BASE_URL}/api/convert`,

  // 파일 관리
  FILE: {
    ROOT: `${API_BASE_URL}/api/file`,
    AASX: `${API_BASE_URL}/api/file/aasx`,
    AASX_UPDATE: `${API_BASE_URL}/api/file/aasx/update`,
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

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
      });

      if (!response.ok) {
        // 에러 응답의 본문을 읽어서 에러 메시지 포함
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지 사용
        }

        const error = new Error(errorMessage);
        (error as any).response = {
          status: response.status,
          data: errorMessage,
        };
        throw error;
      }

      const responseData = await response.json();

      if (responseData && responseData.success === false) {
        const errorMessage = responseData.error || responseData.message || 'Unknown error';
        const error = new Error(errorMessage);
        (error as any).response = {
          status: response.status,
          data: errorMessage,
        };
        (error as any).success = false;
        (error as any).error = responseData.error;
        throw error;
      }

      return responseData;
    } catch (error) {
      throw error;
    }
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
