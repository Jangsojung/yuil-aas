import express from 'express';
import {
  insertFile,
  updateFile,
  deleteFiles,
  getAASXFiles,
  insertAASXFile,
  updateAASXFile,
  deleteAASXFiles,
  getVerify,
  getWords,
  getSearch,
} from '../../controller/file/FileController.js';

const router = express.Router();

export default () => {
  router.post('/', (req, res) => {
    const { fc_idx, af_idx, user_idx } = req.query;
    const { fileName } = req.body;
    if (af_idx) {
      updateFile(af_idx, fileName, user_idx, res);
    } else {
      insertFile(fc_idx, fileName, user_idx, res);
    }
  });

  router.post('/aasx', (req, res) => {
    const { fc_idx, af_idx, user_idx } = req.query;
    const { fileName } = req.body;
    if (af_idx) {
      updateAASXFile(af_idx, fileName, user_idx, res);
    } else {
      insertAASXFile(fc_idx, fileName, user_idx, res);
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

  router.get('/aasxFiles', (req, res) => {
    const { af_kind, fc_idx, startDate, endDate } = req.query;
    getAASXFiles(af_kind, fc_idx, startDate, endDate, res);
  });

  router.post('/verify', (req, res) => {
    const { file } = req.body;
    getVerify(file, res);
  });

  router.get('/words', (req, res) => {
    getWords(res);
  });

  router.get('/search', (req, res) => {
    const { type, text } = req.query;
    getSearch(type, text, res);
  });

  return router;
};
