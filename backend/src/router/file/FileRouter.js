import express from 'express';
import multer from 'multer';
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

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export default () => {
  // AASX 파일 업로드 (파일 포함)
  router.post('/aasx', upload.single('file'), (req, res) => {
    if (req.file) {
      uploadAASXFile(req, res);
    } else {
      res.status(400).json({ error: '파일이 필요합니다.' });
    }
  });

  // AASX 파일 수정 (파일 없음)
  router.post('/aasx/update', (req, res) => {
    const { fileName } = req.body;
    const { af_idx, user_idx, fc_idx } = req.query;
    if (af_idx) {
      updateAASXFile(af_idx, fileName, user_idx, fc_idx, res);
    } else {
      res.status(400).json({ error: 'af_idx가 필요합니다.' });
    }
  });

  router.delete('/aasx', (req, res) => {
    const { ids } = req.body;
    deleteFiles(ids, res);
  });

  router.delete('/files', (req, res) => {
    const { ids } = req.body;
    deleteFiles(ids, res);
  });

  router.post('/aasxFiles', (req, res) => {
    const { af_kind, fc_idx, startDate, endDate } = req.body;
    getFiles(af_kind, fc_idx, startDate, endDate, res);
  });

  router.post('/jsonFiles', (req, res) => {
    const { af_kind, fc_idx, startDate, endDate } = req.body;
    getFiles(af_kind, fc_idx, startDate, endDate, res);
  });

  router.post('/checkFileSize', (req, res) => {
    const { file } = req.body;
    checkFileSize(file, res);
  });

  router.post('/verify', (req, res) => {
    const { file } = req.body;
    getVerify(file, res);
  });

  router.post('/words', (req, res) => {
    const { fc_idx } = req.body;
    getWords(fc_idx, res);
  });

  router.put('/words', (req, res) => {
    const { updates } = req.body;
    updateWords(updates, res);
  });

  router.post('/search', (req, res) => {
    const { fc_idx, type, text } = req.body;
    getSearch(fc_idx, type, text, res);
  });

  router.post('/getFileFCIdx', getFileFCIdx);

  router.post('/files', (req, res) => {
    const { ids } = req.body;
    deleteFiles(ids, res);
  });

  return router;
};
