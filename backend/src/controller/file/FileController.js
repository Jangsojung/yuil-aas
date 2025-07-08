import {
  insertAASXFileToDB,
  updateAASXFileToDB,
  deleteFilesFromDB,
  getVerifyFromDB,
  checkFileSizeFromDB,
  getWordsFromDB,
  getSearchFromDB,
  updateWordsToDB,
  getFilesFromDB,
  getFileFCIdxFromDB,
} from '../../service/file/FileService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFiles = async (af_kind, fc_idx, startDate, endDate, res) => {
  try {
    const result = await getFilesFromDB(af_kind, fc_idx, startDate, endDate);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const insertAASXFile = async (fc_idx, fileName, user_idx, res) => {
  try {
    const result = await insertAASXFileToDB(fc_idx, fileName, user_idx);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    if (err.message && err.message.includes('이미 생성되어있는 파일입니다.')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const uploadAASXFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
    }
    const { fc_idx, user_idx } = req.body;
    const fileName = req.file.originalname;
    // front 폴더에 파일 저장
    const frontDir = path.join(__dirname, '../../../../files/front');
    if (!fs.existsSync(frontDir)) {
      fs.mkdirSync(frontDir, { recursive: true });
    }
    const frontFilePath = path.join(frontDir, fileName);
    fs.writeFileSync(frontFilePath, req.file.buffer);
    // AASX 파일 생성 및 DB 저장
    const result = await insertAASXFileToDB(fc_idx, fileName, user_idx);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    if (err.message && err.message.includes('이미 생성되어있는 파일입니다.')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateAASXFile = async (af_idx, fileName, user_idx, fc_idx, res) => {
  try {
    const result = await updateAASXFileToDB(af_idx, fileName, user_idx, fc_idx);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    if (err.message && err.message.includes('이미 생성되어있는 파일입니다.')) {
      return res.status(400).json({ error: err.message });
    }
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

export const checkFileSize = async (file, res) => {
  try {
    const result = await checkFileSizeFromDB(file);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    if (res) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.error('Internal Server Error (no res)');
    }
  }
};

export const getVerify = async (file, res) => {
  try {
    const result = await getVerifyFromDB(file);
    if (!result) {
      return res.status(400).json({ error: '파일 정보가 필요합니다' });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    if (res) {
      // 특별한 에러 코드 처리
      if (err.message === 'FILE_TOO_LARGE' || err.message === 'AAS_FILE_TOO_LARGE') {
        return res.status(400).json({ error: 'FILE_TOO_LARGE' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.error('Internal Server Error (no res)');
    }
  }
};

export const getWords = async (fc_idx, res) => {
  try {
    const result = await getWordsFromDB(fc_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getSearch = async (fc_idx, type, text, res) => {
  try {
    const result = await getSearchFromDB(fc_idx, type, text);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const updateWords = async (updates, res) => {
  try {
    const result = await updateWordsToDB(updates);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getFileFCIdx = async (req, res) => {
  try {
    const { fileName, af_kind } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: '파일명이 필요합니다.',
      });
    }

    if (!af_kind) {
      return res.status(400).json({
        success: false,
        message: '파일 타입(af_kind)이 필요합니다.',
      });
    }

    const fc_idx = await getFileFCIdxFromDB(fileName, af_kind);

    res.json({
      success: true,
      data: { fc_idx },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '파일 fc_idx 조회 중 오류가 발생했습니다.',
    });
  }
};
