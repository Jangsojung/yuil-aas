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
import {
  successResponse,
  errorResponse,
  fileRequiredError,
  fileNotUploadedError,
  fileInfoRequiredError,
  fileTooLargeError,
  afIdxRequiredError,
} from '../../utils/responseHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFiles = async (af_kind, fc_idx, startDate, endDate, limit, res) => {
  try {
    const result = await getFilesFromDB(af_kind, fc_idx, startDate, endDate, null, limit);
    successResponse(res, result);
  } catch (err) {
    console.error('getFiles error:', err);
    errorResponse(res, err.message);
  }
};

export const insertAASXFile = async (fc_idx, fileName, user_idx, res) => {
  try {
    const result = await insertAASXFileToDB(fc_idx, fileName, user_idx);
    successResponse(res, result);
  } catch (err) {
    if (err.message && err.message.includes('이미 생성되어있는 파일입니다.')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('insertAASXFile error:', err);
    errorResponse(res, err.message);
  }
};

export const uploadAASXFile = async (req, res) => {
  try {
    if (!req.file) {
      return fileNotUploadedError(res);
    }
    const { fc_idx, user_idx, linkName } = req.body;
    const fileName = req.file.originalname;

    // files 디렉토리와 front 디렉토리 생성
    const filesDir = path.join(__dirname, '../../../../files');
    const frontDir = path.join(__dirname, '../../../../files/front');

    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }
    if (!fs.existsSync(frontDir)) {
      fs.mkdirSync(frontDir, { recursive: true });
    }

    const frontFilePath = path.join(frontDir, fileName);
    fs.writeFileSync(frontFilePath, req.file.buffer);
    // AASX 파일 생성 및 DB 저장
    const result = await insertAASXFileToDB(fc_idx, fileName, user_idx, linkName);
    successResponse(res, result);
  } catch (err) {
    if (err.message && err.message.includes('이미 생성되어있는 파일입니다.')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('uploadAASXFile error:', err);
    errorResponse(res, err.message);
  }
};

export const updateAASXFile = async (af_idx, fileName, user_idx, fc_idx, res) => {
  try {
    const result = await updateAASXFileToDB(af_idx, fileName, user_idx, fc_idx, 'aasx.com');
    successResponse(res, result);
  } catch (err) {
    if (err.message && err.message.includes('이미 생성되어있는 파일입니다.')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('updateAASXFile error:', err);
    errorResponse(res, err.message);
  }
};

export const deleteFiles = async (ids, res) => {
  try {
    const result = await deleteFilesFromDB(ids);
    successResponse(res, result);
  } catch (err) {
    console.error('deleteFiles error:', err);
    errorResponse(res, err.message);
  }
};

export const checkFileSize = async (file, res) => {
  try {
    const result = await checkFileSizeFromDB(file);
    successResponse(res, result);
  } catch (err) {
    if (res) {
      console.error('checkFileSize error:', err);
      errorResponse(res, err.message);
    }
  }
};

export const getVerify = async (file, res) => {
  try {
    const result = await getVerifyFromDB(file);
    if (!result) {
      return fileInfoRequiredError(res);
    }
    successResponse(res, result);
  } catch (err) {
    if (res) {
      if (err.message === 'FILE_TOO_LARGE' || err.message === 'AAS_FILE_TOO_LARGE') {
        return fileTooLargeError(res);
      }
      console.error('getVerify error:', err);
      errorResponse(res, err.message);
    }
  }
};

export const getWords = async (fc_idx, res) => {
  try {
    const result = await getWordsFromDB(fc_idx);
    successResponse(res, result);
  } catch (err) {
    console.error('getWords error:', err);
    errorResponse(res, err.message);
  }
};

export const getSearch = async (fc_idx, type, text, res) => {
  try {
    const result = await getSearchFromDB(fc_idx, type, text);
    successResponse(res, result);
  } catch (err) {
    console.error('getSearch error:', err);
    errorResponse(res, err.message);
  }
};

export const updateWords = async (updates, res) => {
  try {
    const result = await updateWordsToDB(updates);
    successResponse(res, result);
  } catch (err) {
    console.error('updateWords error:', err);
    errorResponse(res, err.message);
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
    console.error('getFileFCIdx error:', error);
    errorResponse(res, error.message);
  }
};
