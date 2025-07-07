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
} from '../../service/basic_code/BasicCodeService.js';

export const getBases = async (fc_idx, res) => {
  try {
    const result = await getBasesFromDB(fc_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const insertBases = async (name, note, ids, user_idx, fc_idx, res) => {
  try {
    const result = await insertBasesToDB(name, note, ids, user_idx, fc_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const updateBase = async (ab_idx, name, note, ids, user_idx, res) => {
  try {
    const result = await updateBaseToDB(ab_idx, name, note, ids, user_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const deleteBases = async (ids, res) => {
  try {
    const result = await deleteBasesFromDB(ids);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getSelectedSensors = async (ab_idx, res) => {
  try {
    const result = await getSelectedSensorsFromDB(ab_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getFacilityGroups = async (fc_idx, order, res) => {
  try {
    const result = await getFacilityGroupsFromDB(fc_idx, order);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getSensors = async (fa_idx, res) => {
  try {
    const result = await getSensorsFromDB(fa_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getBaseCode = async (fg_idx, res) => {
  try {
    const result = await getBaseCodeFromDB(fg_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getAllSensorsInGroup = async (fg_idx, res) => {
  try {
    const result = await getAllSensorsInGroupFromDB(fg_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getFactoriesByCmIdx = async (cm_idx, res) => {
  try {
    const result = await getFactoriesByCmIdxFromDB(cm_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const insertFactory = async (cm_idx, fc_name, res) => {
  try {
    const result = await insertFactoryToDB(cm_idx, fc_name);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: '공장 추가 중 오류가 발생했습니다.' });
  }
};

export const insertFacilityGroup = async (fc_idx, fg_name, res) => {
  try {
    const result = await insertFacilityGroupToDB(fc_idx, fg_name);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: '설비그룹 추가 중 오류가 발생했습니다.' });
  }
};

export const insertFacility = async (fg_idx, fa_name, res) => {
  try {
    const result = await insertFacilityToDB(fg_idx, fa_name);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: '설비 추가 중 오류가 발생했습니다.' });
  }
};

export const insertSensor = async (fa_idx, sn_name, res) => {
  try {
    const result = await insertSensorToDB(fa_idx, sn_name);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: '센서 추가 중 오류가 발생했습니다.' });
  }
};

export const syncFactories = async (res) => {
  try {
    const result = await syncFactoriesToAasxData();
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: '공장 동기화 중 오류가 발생했습니다.' });
  }
};
