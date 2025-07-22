import {
  getBasesFromDB,
  insertBasesToDB,
  deleteBasesFromDB,
  updateBaseToDB,
  getSelectedSensorsFromDB,
  getFacilityGroupsFromDB,
  getSensorsFromDB,
  getBaseCodeFromDB,
  getAllSensorsInGroupFromDB,
  getFactoriesByCmIdxFromDB,
  insertFactoryToDB,
  insertFacilityGroupToDB,
  insertFacilityToDB,
  insertSensorToDB,
  syncFactoriesToAasxData,
  getBaseByIdFromDB,
  getBaseFCIdxFromDB,
} from '../../service/basic_code/BasicCodeService.js';
import {
  successResponse,
  errorResponse,
  factoryAddError,
  facilityGroupAddError,
  facilityAddError,
  sensorAddError,
  factorySyncError,
} from '../../utils/responseHandler.js';

export const getBaseById = async (ab_idx, res) => {
  try {
    const result = await getBaseByIdFromDB(ab_idx);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const getBaseFCIdx = async (ab_idx, res) => {
  try {
    const result = await getBaseFCIdxFromDB(ab_idx);
    successResponse(res, { fc_idx: result });
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const getBases = async (fc_idx, res) => {
  try {
    const result = await getBasesFromDB(fc_idx);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const insertBases = async (name, note, ids, user_idx, fc_idx, res) => {
  try {
    const result = await insertBasesToDB(name, note, ids, user_idx, fc_idx);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const updateBase = async (ab_idx, name, note, ids, user_idx, res) => {
  try {
    const result = await updateBaseToDB(ab_idx, name, note, ids, user_idx);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const deleteBases = async (ids, res) => {
  try {
    const result = await deleteBasesFromDB(ids);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const getSelectedSensors = async (ab_idx, res) => {
  try {
    const result = await getSelectedSensorsFromDB(ab_idx);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const getFacilityGroups = async (fc_idx, order, res) => {
  try {
    const result = await getFacilityGroupsFromDB(fc_idx, order);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const getSensors = async (fa_idx, res) => {
  try {
    const result = await getSensorsFromDB(fa_idx);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const getBaseCode = async (fg_idx, res) => {
  try {
    const result = await getBaseCodeFromDB(fg_idx);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const getAllSensorsInGroup = async (fg_idx, res) => {
  try {
    const result = await getAllSensorsInGroupFromDB(fg_idx);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const getFactoriesByCmIdx = async (cm_idx, res) => {
  try {
    const result = await getFactoriesByCmIdxFromDB(cm_idx);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const insertFactory = async (cm_idx, fc_name, res) => {
  try {
    const result = await insertFactoryToDB(cm_idx, fc_name);
    successResponse(res, result);
  } catch (err) {
    factoryAddError(res);
  }
};

export const insertFacilityGroup = async (fc_idx, fg_name, res) => {
  try {
    const result = await insertFacilityGroupToDB(fc_idx, fg_name);
    successResponse(res, result);
  } catch (err) {
    facilityGroupAddError(res);
  }
};

export const insertFacility = async (fg_idx, fa_name, res) => {
  try {
    const result = await insertFacilityToDB(fg_idx, fa_name);
    successResponse(res, result);
  } catch (err) {
    facilityAddError(res);
  }
};

export const insertSensor = async (fa_idx, sn_name, res) => {
  try {
    const result = await insertSensorToDB(fa_idx, sn_name);
    successResponse(res, result);
  } catch (err) {
    sensorAddError(res);
  }
};

export const syncFactories = async (res) => {
  try {
    const result = await syncFactoriesToAasxData();
    successResponse(res, result);
  } catch (err) {
    factorySyncError(res);
  }
};