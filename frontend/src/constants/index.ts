// 페이지네이션 관련 상수
export const PAGINATION = {
  DEFAULT_ROWS_PER_PAGE: 10,
  MAX_ROWS_PER_PAGE: 100,
  ROWS_PER_PAGE_OPTIONS: [5, 10, 25, 50, 100, { label: '전체', value: -1 }],
} as const;

// 파일 관련 상수
export const FILE = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: ['.aasx', '.json'],
} as const;

// 모달 타입
export const MODAL_TYPE = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
} as const;

// 기본값들
export const KINDS = {
  JSON_KIND: 1,
  AAS_KIND: 2,
  AASX_KIND: 3,
};
