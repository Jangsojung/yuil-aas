import express from 'express';
import { getFiles } from '../../controller/kamp_monitoring/KampMonitoringController.js';

const router = express.Router();

export default () => {
  router.get('/files', (req, res) => {
    const { fc_idx } = req.query;

    getFiles(fc_idx, res);
  });

  return router;
};
