import express from 'express';
import multer from 'multer';
import {
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export default () => {
  router.post('/aasx', upload.single('file'), (req, res) => {
    if (req.file) {
      uploadAASXFile(req, res);
    } else {
      const { fc_idx } = req.body;
      const { fileName } = req.body;
      const { af_idx, user_idx } = req.query;
      if (af_idx) {
        updateAASXFile(af_idx, fileName, user_idx, res);
      } else {
        insertAASXFile(fc_idx, fileName, user_idx, res);
      }
    }
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
