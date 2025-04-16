import {
  insertFileToDB,
  updateFileToDB,
  deleteFilesFromDB,
  getAASXFilesFromDB,
  insertAASXFileToDB,
  updateAASXFileToDB,
  deleteAASXFilesFromDB,
  getVerifyFromDB,
} from '../../service/file/FileService.js';

export const insertFile = async (fc_idx, fileName, res) => {
  try {
    const result = await insertFileToDB(fc_idx, fileName);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateFile = async (af_idx, fileName, res) => {
  try {
    const result = await updateFileToDB(af_idx, fileName);

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

export const insertAASXFile = async (fc_idx, fileName, res) => {
  try {
    const result = await insertAASXFileToDB(fc_idx, fileName);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateAASXFile = async (af_idx, fileName, res) => {
  try {
    const result = await updateAASXFileToDB(af_idx, fileName);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteAASXFiles = async (ids, res) => {
  try {
    const result = await deleteAASXFilesFromDB(ids);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getVerify = async (file, res) => {
  try {
    const result = await getVerifyFromDB(file);
    if (!result) {
      return res.status(400).json({ error: '파일 정보가 필요합니다' });
    }

    return res.json(result);
  } catch (err) {
    console.error(err.message);
    if (res) {
      res.status(500).json({ err: 'Internal Server Error' });
    } else {
      console.error('Internal Server Error (no res)');
    }
  }
};
