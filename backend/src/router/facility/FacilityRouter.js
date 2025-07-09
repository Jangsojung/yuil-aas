import express from 'express';
import {
  addFacilityGroup,
  addFacility,
  addSensor,
  deleteSensor,
  deleteFacility,
  deleteFacilityGroup,
  deleteFactory,
  synchronizeFacility,
} from '../../controller/facility/FacilityController.js';

const router = express.Router();

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

router.post('/aasx/sensors', (req, res) => {
  const { sensorIds } = req.body;
  deleteSensor(sensorIds, res);
});

router.post('/aasx/facilities', (req, res) => {
  const { facilityIds } = req.body;
  deleteFacility(facilityIds, res);
});

router.post('/aasx/facility_groups', (req, res) => {
  const { facilityGroupIds } = req.body;
  deleteFacilityGroup(facilityGroupIds, res);
});

router.post('/aasx/factories', (req, res) => {
  const { factoryIds } = req.body;
  deleteFactory(factoryIds, res);
});

router.post('/aasx/synchronize', (req, res) => {
  synchronizeFacility(res);
});

export default router;
