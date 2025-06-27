import express from 'express';
import multer from 'multer';
import {
  insertFile,
  updateFile,
  deleteFiles,
  getAASXFiles,
  insertAASXFile,
  updateAASXFile,
  uploadAASXFile,
  deleteAASXFiles,
  getVerify,
  getWords,
  getSearch,
  updateWords,
} from '../../controller/file/FileController.js';

const router = express.Router();

// multer 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
});

export default () => {
  router.post('/', (req, res) => {
    const { fc_idx, af_idx, user_idx } = req.body;
    const { fileName } = req.body;
    if (af_idx) {
      updateFile(af_idx, fileName, user_idx, res);
    } else {
      insertFile(fc_idx, fileName, user_idx, res);
    }
  });

  router.post('/aasx', upload.single('file'), (req, res) => {
    // 파일이 업로드된 경우 (파일 등록)
    if (req.file) {
      uploadAASXFile(req, res);
    } else {
      // 파일이 없는 경우 (파일 수정)
      const { fc_idx, af_idx, user_idx } = req.body;
      const { fileName } = req.body;
      if (af_idx) {
        updateAASXFile(af_idx, fileName, user_idx, res);
      } else {
        insertAASXFile(fc_idx, fileName, user_idx, res);
      }
    }
  });

  router.delete('/', (req, res) => {
    const { ids } = req.body;

    deleteFiles(ids, res);
  });

  router.delete('/aasx', (req, res) => {
    const { ids } = req.body;

    deleteAASXFiles(ids, res);
  });

  router.post('/aasxFiles', (req, res) => {
    const { af_kind, fc_idx, startDate, endDate } = req.body;
    getAASXFiles(af_kind, fc_idx, startDate, endDate, res);
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

  return router;
};
