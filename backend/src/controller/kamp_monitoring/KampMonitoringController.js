import { getFilesFromDB, getAASXFilesFromDB } from '../../service/kamp_monitoring/KampMonitoringService.js';

export const getFiles = async (fc_idx, res) => {
  try {
    const result = await getFilesFromDB(fc_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getAASXFiles = async (af_kind, fc_idx, res) => {
  try {
    const result = await getAASXFilesFromDB(af_kind, fc_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};
