// 페이지네이션 관련 상수
export const PAGINATION = {
  DEFAULT_ROWS_PER_PAGE: 10,
  MAX_ROWS_PER_PAGE: 100,
  ROWS_PER_PAGE_OPTIONS: [5, 10, 25, 50, 100, { label: '전체', value: -1 }],
} as const;

// API 관련 상수
export const API = {
  // TIMEOUT: 300000, // 타임아웃 제거 (큰 파일 처리용)
  RETRY_COUNT: 3,
} as const;

// 파일 관련 상수
export const FILE = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: ['.aasx', '.json'],
} as const;

// 검색 관련 상수
export const SEARCH = {
  MIN_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
} as const;

// 모달 타입
export const MODAL_TYPE = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
} as const;

// 기본값들
export const DEFAULTS = {
  FACILITY_GROUP_ID: 3,
  AASX_KIND: 3,
};
