import express from 'express';
import {
  getFactories,
  getFacilityGroups,
  getSensors,
  getBaseCode,
  editBaseCode,
  editSensorBaseCode,
} from '../../controller/basic_code/BasicCodeController.js';

const router = express.Router();

export default () => {
  router.get('/factories', (req, res) => {
    getFactories(res);
  });

  router.get('/facilityGroups', (req, res) => {
    const { fc_idx, order } = req.query;
    getFacilityGroups(fc_idx, order, res);
  });

  router.get('/sensors', (req, res) => {
    const { fa_idx } = req.query;
    getSensors(fa_idx, res);
  });

  router.get('/', (req, res) => {
    const { fg_idx } = req.query;
    getBaseCode(fg_idx, res);
  });

  router.put('/', (req, res) => {
    const { fg_idx } = req.query;
    const { fa_idx, fa_name } = req.body;
    editBaseCode(fg_idx, fa_idx, fa_name, res);
  });

  router.put('/sensors', (req, res) => {
    const { sn_idx, sn_name } = req.body;
    editSensorBaseCode(sn_idx, sn_name, res);
  });

  return router;
};
