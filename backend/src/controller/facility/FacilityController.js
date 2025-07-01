import {
  insertFacilityGroup,
  insertFacility,
  insertSensor,
  deleteSensors,
} from '../../service/facility/FacilityService.js';

export const addFacilityGroup = async (name, res) => {
  try {
    const fg_idx = await insertFacilityGroup(name);
    res.status(200).json({ fg_idx });
  } catch (err) {
    res.status(500).json({ error: '설비그룹 등록 실패' });
  }
};

export const addFacility = async (fg_idx, name, res) => {
  try {
    const fa_idx = await insertFacility(fg_idx, name);
    res.status(200).json({ fa_idx });
  } catch (err) {
    res.status(500).json({ error: '설비 등록 실패' });
  }
};

export const addSensor = async (fa_idx, name, res) => {
  try {
    const sn_idx = await insertSensor(fa_idx, name);
    res.status(200).json({ sn_idx });
  } catch (err) {
    res.status(500).json({ error: '센서 등록 실패' });
  }
};

export const deleteSensor = async (sensorIds, res) => {
  try {
    const result = await deleteSensors(sensorIds);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: '센서 삭제 실패' });
  }
};
