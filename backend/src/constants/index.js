// 파일 타입 상수
export const FILE_KINDS = {
  JSON_KIND: 1,
  AAS_KIND: 2,
  AASX_KIND: 3,
};

// 페이지네이션 관련 상수
export const PAGINATION = {
  DEFAULT_ROWS_PER_PAGE: 10,
  MAX_ROWS_PER_PAGE: 100,
  ROWS_PER_PAGE_OPTIONS: [5, 10, 25, 50, 100],
};

// 파일 관련 상수
export const FILE = {
  MAX_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_TYPES: ['.aasx', '.json'],
};
