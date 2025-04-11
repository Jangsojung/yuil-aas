import {
  insertFileToDB,
  updateFileToDB,
  deleteFilesFromDB,
  getAASXFilesFromDB,
} from '../../service/file/FileService.js';

export const insertFile = async (fc_idx, file, res) => {
  try {
    const result = await insertFileToDB(fc_idx, file);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateFile = async (af_idx, file, res) => {
  try {
    const result = await updateFileToDB(af_idx, file);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteFiles = async (ids, res) => {
  try {
    const result = await deleteFilesFromDB(ids);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getAASXFiles = async (res) => {
  try {
    const result = await getAASXFilesFromDB();

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};
