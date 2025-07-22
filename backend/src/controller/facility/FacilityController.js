import {
  insertFacilityGroup,
  insertFacility,
  insertSensor,
  deleteSensors,
  deleteFacilities,
  deleteFacilityGroups,
  deleteFactories,
  synchronizeFacilityData,
  getFactoriesByCmIdx,
  insertFactory,
  getFacilityGroupsByFcIdx,
  getFacilitiesByFgIdx,
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

export const addFacilityGroup = async (fc_idx, name, res) => {
  try {
    const fg_idx = await insertFacilityGroup(fc_idx, name);
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

export const deleteFactory = async (factoryIds, cm_idx, res) => {
  try {
    const result = await deleteFactories(factoryIds, cm_idx);
    successResponse(res, result);
  } catch (err) {
    factoryDeleteError(res);
  }
};

export const addFactory = async (cm_idx, fc_name, res) => {
  try {
    const fc_idx = await insertFactory(cm_idx, fc_name);
    res.status(200).json({ success: true, fc_idx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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

export const getFactoriesByCmIdxController = async (cm_idx, res) => {
  try {
    if (!cm_idx) {
      return res.status(400).json({ success: false, message: 'cm_idx가 필요합니다.' });
    }
    const factories = await getFactoriesByCmIdx(cm_idx);
    res.status(200).json({ success: true, data: factories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFacilityGroupsController = async (fc_idx, res) => {
  try {
    if (!fc_idx) {
      return res.status(400).json({ success: false, message: 'fc_idx가 필요합니다.' });
    }
    const groups = await getFacilityGroupsByFcIdx(fc_idx);
    successResponse(res, { data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFacilitiesController = async (fg_idx, res) => {
  try {
    if (!fg_idx) {
      return res.status(400).json({ success: false, message: 'fg_idx가 필요합니다.' });
    }
    const facilities = await getFacilitiesByFgIdx(fg_idx);
    successResponse(res, { data: facilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
