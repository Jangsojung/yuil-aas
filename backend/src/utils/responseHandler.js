import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/errors.js';

// 성공 응답 유틸리티
export const successResponse = (res, data, status = HTTP_STATUS.OK) => {
  if (res && typeof res.status === 'function') {
    res.status(status).json(data);
  }
};

// 에러 응답 유틸리티
export const errorResponse = (res, message, status = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  if (res && typeof res.status === 'function') {
    res.status(status).json({ error: message });
  }
};

// 내부 서버 에러 응답
export const internalServerError = (res) => {
  errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
};

// 잘못된 요청 에러 응답
export const badRequestError = (res, message) => {
  errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
};

// 파일 관련 에러 응답들
export const fileRequiredError = (res) => {
  badRequestError(res, ERROR_MESSAGES.FILE_REQUIRED);
};

export const fileNotUploadedError = (res) => {
  badRequestError(res, ERROR_MESSAGES.FILE_NOT_UPLOADED);
};

export const fileInfoRequiredError = (res) => {
  badRequestError(res, ERROR_MESSAGES.FILE_INFO_REQUIRED);
};

export const fileTooLargeError = (res) => {
  badRequestError(res, ERROR_MESSAGES.FILE_TOO_LARGE);
};

export const afIdxRequiredError = (res) => {
  badRequestError(res, ERROR_MESSAGES.AF_IDX_REQUIRED);
};

// 설비 관련 에러 응답들
export const facilityGroupRegisterError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACILITY_GROUP_REGISTER_FAILED);
};

export const facilityRegisterError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACILITY_REGISTER_FAILED);
};

export const sensorRegisterError = (res) => {
  errorResponse(res, ERROR_MESSAGES.SENSOR_REGISTER_FAILED);
};

export const sensorDeleteError = (res) => {
  errorResponse(res, ERROR_MESSAGES.SENSOR_DELETE_FAILED);
};

export const facilityDeleteError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACILITY_DELETE_FAILED);
};

export const facilityGroupDeleteError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACILITY_GROUP_DELETE_FAILED);
};

export const factoryDeleteError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACTORY_DELETE_FAILED);
};

export const facilitySyncError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACILITY_SYNC_FAILED);
};

// 공장 관련 에러 응답들
export const factoryAddError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACTORY_ADD_FAILED);
};

export const facilityGroupAddError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACILITY_GROUP_ADD_FAILED);
};

export const facilityAddError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACILITY_ADD_FAILED);
};

export const sensorAddError = (res) => {
  errorResponse(res, ERROR_MESSAGES.SENSOR_ADD_FAILED);
};

export const factorySyncError = (res) => {
  errorResponse(res, ERROR_MESSAGES.FACTORY_SYNC_FAILED);
};

// 엣지 게이트웨이 관련 에러 응답
export const pingCheckError = (res) => {
  errorResponse(res, ERROR_MESSAGES.PING_CHECK_FAILED);
};
