import express from 'express';
import {
  getBases,
  insertBases,
  updateBase,
  deleteBases,
  getSelectedSensors,
  getFacilityGroups,
  getSensors,
  getBaseCode,
  getAllSensorsInGroup,
} from '../../controller/basic_code/BasicCodeController.js';

const router = express.Router();

export default () => {
  router.get('/bases', (req, res) => {
    getBases(res);
  });

  router.post('/bases', (req, res) => {
    const { user_idx } = req.query;
    const { name, note, ids } = req.body;
    insertBases(name, note, ids, user_idx, res);
  });

  router.put('/bases', (req, res) => {
    const { user_idx } = req.query;
    const { ab_idx, name, note, ids } = req.body;
    updateBase(ab_idx, name, note, ids, user_idx, res);
  });

  router.delete('/bases', (req, res) => {
    const { ids } = req.body;
    deleteBases(ids, res);
  });

  router.get('/bases/sensors', (req, res) => {
    const { ab_idx } = req.query;
    getSelectedSensors(ab_idx, res);
  });

  router.get('/bases/:ab_idx/sensors', (req, res) => {
    const { ab_idx } = req.params;
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

  router.get('/allSensorsInGroup', (req, res) => {
    const { fg_idx } = req.query;
    getAllSensorsInGroup(fg_idx, res);
  });

  return router;
};
