import express from 'express';
import { getFiles, getAASXFiles } from '../../controller/kamp_monitoring/KampMonitoringController.js';

const router = express.Router();

export default () => {
  router.get('/files', (req, res) => {
    const { fc_idx } = req.query;

    getFiles(fc_idx, res);
  });

  router.get('/AASXfiles', (req, res) => {
    const { af_kind, fc_idx, startDate, endDate } = req.query;
    getAASXFiles(af_kind, fc_idx, startDate, endDate, res);
  });

  return router;
};
