import {
  getFactoriesFromDB,
  getFacilityGroupsFromDB,
  getSensorsFromDB,
  getBaseCodeFromDB,
  editBaseCodeFromDB,
  editSensorBaseCodeFromDB,
} from '../../service/basic_code/BasicCodeService.js';

export const getFactories = async (res) => {
  try {
    const result = await getFactoriesFromDB();

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

export const editBaseCode = async (fg_idx, fa_idx, fa_name, res) => {
  try {
    const result = await editBaseCodeFromDB(fg_idx, fa_idx, fa_name);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const editSensorBaseCode = async (sn_idx, sn_name, res) => {
  try {
    const result = await editSensorBaseCodeFromDB(sn_idx, sn_name);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};
