import express from 'express';
import {
  getFactories,
  getBases,
  insertBases,
  updateBase,
  deleteBases,
  getSelectedSensors,
  getFacilityGroups,
  getSensors,
  getBaseCode,
  insertBaseCode,
  editBaseCode,
  deleteBaseCode,
  insertSensorBaseCode,
  editSensorBaseCode,
  deleteSensorBaseCode,
} from '../../controller/basic_code/BasicCodeController.js';

const router = express.Router();

export default () => {
  router.get('/factories', (req, res) => {
    getFactories(res);
  });

  router.get('/bases', (req, res) => {
    getBases(res);
  });

  router.post('/bases', (req, res) => {
    const { name, ids } = req.body;
    insertBases(name, ids, res);
  });

  router.put('/bases', (req, res) => {
    const { ab_idx, name, ids } = req.body;
    updateBase(ab_idx, name, ids, res);
  });

  router.delete('/bases', (req, res) => {
    const { ids } = req.body;
    deleteBases(ids, res);
  });

  router.get('/bases/sensors', (req, res) => {
    const { ab_idx } = req.query;
    getSelectedSensors(ab_idx, res);
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

  router.post('/', (req, res) => {
    const { fg_idx } = req.query;
    const { fa_idx, fa_name } = req.body;
    insertBaseCode(fa_idx, fg_idx, fa_name, res);
  });

  router.put('/', (req, res) => {
    const { fg_idx } = req.query;
    const { fa_idx, fa_name } = req.body;
    editBaseCode(fg_idx, fa_idx, fa_name, res);
  });

  router.delete('/', (req, res) => {
    const { fa_idx } = req.body;
    deleteBaseCode(fa_idx, res);
  });

  router.post('/sensors', (req, res) => {
    const { sn_idx, fa_idx, sn_name } = req.body;
    insertSensorBaseCode(sn_idx, fa_idx, sn_name, res);
  });

  router.put('/sensors', (req, res) => {
    const { sn_idx, sn_name } = req.body;
    editSensorBaseCode(sn_idx, sn_name, res);
  });

  router.delete('/sensors', (req, res) => {
    const { sn_idx } = req.body;
    deleteSensorBaseCode(sn_idx, res);
  });

  return router;
};
