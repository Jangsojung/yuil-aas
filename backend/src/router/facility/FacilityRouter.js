import express from 'express';
import {
  addFacilityGroup,
  addFacility,
  addSensor,
  deleteSensor,
} from '../../controller/facility/FacilityController.js';

const router = express.Router();

export default () => {
  router.post('/aasx/group', (req, res) => {
    const { name } = req.body;
    addFacilityGroup(name, res);
  });

  router.post('/aasx/facility', (req, res) => {
    const { fg_idx, name } = req.body;
    addFacility(fg_idx, name, res);
  });

  router.post('/aasx/sensor', (req, res) => {
    const { fa_idx, name } = req.body;
    addSensor(fa_idx, name, res);
  });

  router.delete('/aasx/sensors', (req, res) => {
    const { sensorIds } = req.body;
    deleteSensor(sensorIds, res);
  });

  return router;
};
