import {
  insertFacilityGroup,
  insertFacility,
  insertSensor,
  deleteSensors,
  deleteFacilities,
  deleteFacilityGroups,
  deleteFactories,
  synchronizeFacilityData,
} from '../../service/facility/FacilityService.js';
import {
  successResponse,
  facilityGroupRegisterError,
  facilityRegisterError,
  sensorRegisterError,
  sensorDeleteError,
  facilityDeleteError,
  facilityGroupDeleteError,
  factoryDeleteError,
  facilitySyncError,
} from '../../utils/responseHandler.js';

export const addFacilityGroup = async (name, res) => {
  try {
    const fg_idx = await insertFacilityGroup(name);
    successResponse(res, { fg_idx });
  } catch (err) {
    facilityGroupRegisterError(res);
  }
};

export const addFacility = async (fg_idx, name, res) => {
  try {
    const fa_idx = await insertFacility(fg_idx, name);
    successResponse(res, { fa_idx });
  } catch (err) {
    facilityRegisterError(res);
  }
};

export const addSensor = async (fa_idx, name, res) => {
  try {
    const sn_idx = await insertSensor(fa_idx, name);
    successResponse(res, { sn_idx });
  } catch (err) {
    sensorRegisterError(res);
  }
};

export const deleteSensor = async (sensorIds, res) => {
  try {
    const result = await deleteSensors(sensorIds);
    successResponse(res, result);
  } catch (err) {
    sensorDeleteError(res);
  }
};

export const deleteFacility = async (facilityIds, res) => {
  try {
    const result = await deleteFacilities(facilityIds);
    successResponse(res, result);
  } catch (err) {
    facilityDeleteError(res);
  }
};

export const deleteFacilityGroup = async (facilityGroupIds, res) => {
  try {
    const result = await deleteFacilityGroups(facilityGroupIds);
    successResponse(res, result);
  } catch (err) {
    facilityGroupDeleteError(res);
  }
};

export const deleteFactory = async (factoryIds, res) => {
  try {
    const result = await deleteFactories(factoryIds);
    successResponse(res, result);
  } catch (err) {
    factoryDeleteError(res);
  }
};

export const synchronizeFacility = async (res) => {
  try {
    const result = await synchronizeFacilityData();
    successResponse(res, result);
  } catch (err) {
    facilitySyncError(res);
  }
};
