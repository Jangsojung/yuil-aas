import express from 'express';
import { insertConverts } from '../../controller/convert/ConvertController.js';

const router = express.Router();

export default () => {
  router.post('/', (req, res) => {
    const { fc_idx, user_idx, startDate, endDate, selectedConvert } = req.body;
    insertConverts(fc_idx, startDate, endDate, selectedConvert, user_idx, res);
  });

  return router;
};
