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
  getFactoriesByCmIdx,
  insertFactory,
  insertFacilityGroup,
  insertFacility,
  insertSensor,
  syncFactories,
  getBaseById,
} from '../../controller/basic_code/BasicCodeController.js';

const router = express.Router();

export default () => {
  router.post('/bases', (req, res) => {
    const { fc_idx } = req.body;
    getBases(fc_idx, res);
  });

  router.post('/bases/insert', (req, res) => {
    const { user_idx } = req.body;
    const { name, note, ids, fc_idx } = req.body;
    insertBases(name, note, ids, user_idx, fc_idx, res);
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

  router.get('/factories/:cm_idx', async (req, res) => {
    const { cm_idx } = req.params;
    await getFactoriesByCmIdx(cm_idx, res);
  });

  // 설비 추가 관련 엔드포인트
  router.post('/factory', async (req, res) => {
    const { cm_idx, fc_name } = req.body;
    await insertFactory(cm_idx, fc_name, res);
  });

  router.post('/facilityGroup', async (req, res) => {
    const { fc_idx, fg_name } = req.body;
    await insertFacilityGroup(fc_idx, fg_name, res);
  });

  router.post('/facility', async (req, res) => {
    const { fg_idx, fa_name } = req.body;
    await insertFacility(fg_idx, fa_name, res);
  });

  router.post('/sensor', async (req, res) => {
    const { fa_idx, sn_name } = req.body;
    await insertSensor(fa_idx, sn_name, res);
  });

  // 공장 동기화 엔드포인트
  router.post('/sync-factories', async (req, res) => {
    await syncFactories(res);
  });

  // 기초코드 ID로 조회
  router.get('/bases/:id', (req, res) => {
    const { id } = req.params;
    getBaseById(id, res);
  });

  return router;
};
