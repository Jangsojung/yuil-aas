import { createRouter, extractors } from '../../utils/routerHelper.js';
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
  getBaseFCIdx,
} from '../../controller/basic_code/BasicCodeController.js';

const routes = [
  {
    method: 'post',
    path: '/bases',
    controller: getBases,
    extractor: extractors.fromBody(['fc_idx']),
  },
  {
    method: 'post',
    path: '/bases/insert',
    controller: insertBases,
    extractor: extractors.fromBody(['name', 'note', 'ids', 'user_idx', 'fc_idx']),
  },
  {
    method: 'put',
    path: '/bases',
    controller: updateBase,
    extractor: extractors.fromBody(['ab_idx', 'name', 'note', 'ids', 'user_idx']),
  },
  {
    method: 'delete',
    path: '/bases',
    controller: deleteBases,
    extractor: extractors.fromBody(['ids']),
  },
  {
    method: 'post',
    path: '/bases/sensors',
    controller: getSelectedSensors,
    extractor: extractors.fromBody(['ab_idx']),
  },
  {
    method: 'post',
    path: '/bases/:ab_idx/sensors',
    controller: getSelectedSensors,
    extractor: extractors.fromParams(['ab_idx']),
  },
  {
    method: 'post',
    path: '/facilityGroups',
    controller: getFacilityGroups,
    extractor: extractors.fromBody(['fc_idx', 'order']),
  },
  {
    method: 'post',
    path: '/sensors',
    controller: getSensors,
    extractor: extractors.fromBody(['fa_idx']),
  },
  {
    method: 'post',
    path: '/',
    controller: getBaseCode,
    extractor: extractors.fromBody(['fg_idx']),
  },
  {
    method: 'post',
    path: '/allSensorsInGroup',
    controller: getAllSensorsInGroup,
    extractor: extractors.fromBody(['fg_idx']),
  },
  {
    method: 'post',
    path: '/factories/:cm_idx',
    controller: getFactoriesByCmIdx,
    extractor: extractors.fromParams(['cm_idx']),
  },
  {
    method: 'post',
    path: '/factory',
    controller: insertFactory,
    extractor: extractors.fromBody(['cm_idx', 'fc_name']),
  },
  {
    method: 'post',
    path: '/facilityGroup',
    controller: insertFacilityGroup,
    extractor: extractors.fromBody(['fc_idx', 'fg_name']),
  },
  {
    method: 'post',
    path: '/facility',
    controller: insertFacility,
    extractor: extractors.fromBody(['fg_idx', 'fa_name']),
  },
  {
    method: 'post',
    path: '/sensor',
    controller: insertSensor,
    extractor: extractors.fromBody(['fa_idx', 'sn_name']),
  },
  {
    method: 'post',
    path: '/sync-factories',
    controller: syncFactories,
    extractor: () => [],
  },
  {
    method: 'post',
    path: '/bases/:id',
    controller: getBaseById,
    extractor: extractors.fromParams(['id']),
  },
  {
    method: 'post',
    path: '/bases/:id/fc_idx',
    controller: getBaseFCIdx,
    extractor: extractors.fromParams(['id']),
  },
];

export default createRouter(routes);
