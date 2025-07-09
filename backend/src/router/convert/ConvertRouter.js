import express from 'express';
import { insertConverts } from '../../controller/convert/ConvertController.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { fc_idx, user_idx, startDate, endDate, selectedConvert, af_kind } = req.body;
  insertConverts(fc_idx, startDate, endDate, selectedConvert, user_idx, af_kind, res);
});

export default router;
