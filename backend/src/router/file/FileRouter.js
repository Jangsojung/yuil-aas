import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  insertFile,
  updateFile,
  deleteFiles,
  getAASXFiles,
  insertAASXFile,
  updateAASXFile,
  deleteAASXFiles,
  getVerify,
} from '../../controller/file/FileController.js';

const router = express.Router();

export default () => {
  router.post('/', (req, res) => {
    const { fc_idx, af_idx } = req.query;
    const { fileName } = req.body;
    if (af_idx) {
      updateFile(af_idx, fileName, res);
    } else {
      insertFile(fc_idx, fileName, res);
    }
  });

  router.post('/aasx', (req, res) => {
    const { fc_idx, af_idx } = req.query;
    const { fileName } = req.body;
    if (af_idx) {
      updateAASXFile(af_idx, fileName, res);
    } else {
      insertAASXFile(fc_idx, fileName, res);
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
    getAASXFiles(res);
  });

  router.post('/verify', (req, res) => {
    const { file } = req.body;
    getVerify(file, res);
  });

  return router;
};
