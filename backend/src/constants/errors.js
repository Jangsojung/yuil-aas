// 공통 에러 메시지 상수
export const ERROR_MESSAGES = {
  // 일반적인 에러 메시지
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not Found',

  // 파일 관련 에러 메시지
  FILE_REQUIRED: '파일이 필요합니다.',
  FILE_NOT_UPLOADED: '파일이 업로드되지 않았습니다.',
  FILE_INFO_REQUIRED: '파일 정보가 필요합니다',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  AF_IDX_REQUIRED: 'af_idx가 필요합니다.',

  // 설비 관련 에러 메시지
  FACILITY_GROUP_REGISTER_FAILED: '설비그룹 등록 실패',
  FACILITY_REGISTER_FAILED: '설비 등록 실패',
  SENSOR_REGISTER_FAILED: '센서 등록 실패',
  SENSOR_DELETE_FAILED: '센서 삭제 실패',
  FACILITY_DELETE_FAILED: '설비 삭제 실패',
  FACILITY_GROUP_DELETE_FAILED: '설비그룹 삭제 실패',
  FACTORY_DELETE_FAILED: '공장 삭제 실패',
  FACILITY_SYNC_FAILED: '설비 동기화 실패',

  // 공장 관련 에러 메시지
  FACTORY_ADD_FAILED: '공장 추가 중 오류가 발생했습니다.',
  FACILITY_GROUP_ADD_FAILED: '설비그룹 추가 중 오류가 발생했습니다.',
  FACILITY_ADD_FAILED: '설비 추가 중 오류가 발생했습니다.',
  SENSOR_ADD_FAILED: '센서 추가 중 오류가 발생했습니다.',
  FACTORY_SYNC_FAILED: '공장 동기화 중 오류가 발생했습니다.',

  // 엣지 게이트웨이 관련 에러 메시지
  PING_CHECK_FAILED: 'Ping check failed',

  // 인증 관련 에러 메시지
  AUTHENTICATION_FAILED: '인증에 실패했습니다.',
  INVALID_CREDENTIALS: '잘못된 인증 정보입니다.',
};

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
