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
  router.post('/bases', (req, res) => {
    getBases(res);
  });

  router.post('/bases/insert', (req, res) => {
    const { user_idx } = req.body;
    const { name, note, ids } = req.body;
    insertBases(name, note, ids, user_idx, res);
  });

  router.put('/bases', (req, res) => {
    const { user_idx } = req.body;
    const { ab_idx, name, note, ids } = req.body;
    updateBase(ab_idx, name, note, ids, user_idx, res);
  });

  router.delete('/bases', (req, res) => {
    const { ids } = req.body;
    deleteBases(ids, res);
  });

  router.post('/bases/sensors', (req, res) => {
    const { ab_idx } = req.body;
    getSelectedSensors(ab_idx, res);
  });

  router.post('/bases/:ab_idx/sensors', (req, res) => {
    const { ab_idx } = req.params;
    getSelectedSensors(ab_idx, res);
  });

  router.post('/facilityGroups', (req, res) => {
    const { fc_idx, order } = req.body;
    getFacilityGroups(fc_idx, order, res);
  });

  router.post('/sensors', (req, res) => {
    const { fa_idx } = req.body;
    getSensors(fa_idx, res);
  });

  router.post('/', (req, res) => {
    const { fg_idx } = req.body;
    getBaseCode(fg_idx, res);
  });

  router.post('/allSensorsInGroup', (req, res) => {
    const { fg_idx } = req.body;
    getAllSensorsInGroup(fg_idx, res);
  });

  return router;
};
