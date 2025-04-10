import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { insertFile, updateFile, deleteFiles, getAASXFiles } from '../../controller/file/FileController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'files', 'python');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

export default () => {
  router.post('/', upload.single('file'), (req, res) => {
    const { fc_idx, af_idx } = req.query;
    if (af_idx) {
      updateFile(af_idx, req.file, res);
    } else {
      insertFile(fc_idx, req.file, res);
    }
  });

  router.delete('/', (req, res) => {
    const { ids } = req.body;

    deleteFiles(ids, res);
  });

  router.get('/aasxFiles', (req, res) => {
    getAASXFiles(res);
  });

  return router;
};
