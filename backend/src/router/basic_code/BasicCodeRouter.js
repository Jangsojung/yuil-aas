import express from 'express';
import { getFactories, getBaseCode } from '../../controller/basic_code/BasicCodeController.js';

const router = express.Router();

export default () => {
  router.get('/factories', (req, res) => {
    getFactories(res);
  });

  router.get('/', (req, res) => {
    const { fc_idx } = req.query;
    getBaseCode(fc_idx, res);
  });

  return router;
};
