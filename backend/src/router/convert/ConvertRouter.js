import express from 'express';
import { insertConverts } from '../../controller/convert/ConvertController.js';

const router = express.Router();

export default () => {
  router.post('/', (req, res) => {
    const { fc_idx, user_idx } = req.query;
    const { start, end, ids } = req.body;
    insertConverts(fc_idx, start, end, ids, user_idx, res);
  });

  return router;
};
