import express from 'express';
import multer from 'multer';
import { FILE } from '../../constants/index.js';
import { createRouter, extractors } from '../../utils/routerHelper.js';
import {
  getFiles,
  insertAASXFile,
  uploadAASXFile,
  updateAASXFile,
  deleteFiles,
  checkFileSize,
  getVerify,
  getWords,
  getSearch,
  updateWords,
  getFileFCIdx,
} from '../../controller/file/FileController.js';
import { fileRequiredError, afIdxRequiredError } from '../../utils/responseHandler.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FILE.MAX_SIZE,
  },
});

// 파일 업로드 미들웨어
const fileUploadMiddleware = (req, res, next) => {
  if (req.file) {
    next();
  } else {
    fileRequiredError(res);
  }
};

// af_idx 검증 미들웨어
const afIdxValidationMiddleware = (req, res, next) => {
  if (req.query.af_idx) {
    next();
  } else {
    afIdxRequiredError(res);
  }
};

const routes = [
  {
    method: 'post',
    path: '/aasx',
    controller: uploadAASXFile,
    extractor: extractors.fullRequest(),
    middleware: [upload.single('file'), fileUploadMiddleware],
  },
  {
    method: 'post',
    path: '/aasx/update',
    controller: updateAASXFile,
    extractor: (req) => [req.query.af_idx, req.body.fileName, req.query.user_idx, req.query.fc_idx, req.body.linkName],
    middleware: [afIdxValidationMiddleware],
  },
  {
    method: 'delete',
    path: '/aasx',
    controller: deleteFiles,
    extractor: extractors.fromBody(['ids']),
  },
  {
    method: 'delete',
    path: '/files',
    controller: deleteFiles,
    extractor: extractors.fromBody(['ids']),
  },
  {
    method: 'post',
    path: '/aasxFiles',
    controller: getFiles,
    extractor: extractors.fromBody(['af_kind', 'fc_idx', 'startDate', 'endDate', 'limit']),
  },
  {
    method: 'post',
    path: '/jsonFiles',
    controller: getFiles,
    extractor: extractors.fromBody(['af_kind', 'fc_idx', 'startDate', 'endDate', 'limit']),
  },
  {
    method: 'post',
    path: '/checkFileSize',
    controller: checkFileSize,
    extractor: extractors.fromBody(['file']),
  },
  {
    method: 'post',
    path: '/verify',
    controller: getVerify,
    extractor: extractors.fromBody(['file']),
  },
  {
    method: 'post',
    path: '/words',
    controller: getWords,
    extractor: extractors.fromBody([]),
  },
  {
    method: 'put',
    path: '/words',
    controller: updateWords,
    extractor: extractors.fromBody(['updates']),
  },
  {
    method: 'post',
    path: '/search',
    controller: getSearch,
    extractor: extractors.fromBody(['type', 'text']),
  },
  {
    method: 'post',
    path: '/getFileFCIdx',
    controller: getFileFCIdx,
    extractor: extractors.fullRequest(),
  },
  {
    method: 'post',
    path: '/files',
    controller: deleteFiles,
    extractor: extractors.fromBody(['ids']),
  },
];

export default createRouter(routes);
