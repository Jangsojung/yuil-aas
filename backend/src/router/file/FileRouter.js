import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { insertFile } from '../../controller/file/FileController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'files', 'python');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// multer 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// multer 업로드 설정
const upload = multer({ storage: storage });

const router = express.Router();

export default () => {
  router.post('/', upload.single('file'), (req, res) => {
    const { fc_idx } = req.query;

    insertFile(fc_idx, req.file, res);
  });

  return router;
};
