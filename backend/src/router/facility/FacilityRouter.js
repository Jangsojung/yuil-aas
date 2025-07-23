import { createRouter, extractors } from '../../utils/routerHelper.js';
import {
  addFacilityGroup,
  addFacility,
  addSensor,
  deleteSensor,
  deleteFacility,
  deleteFacilityGroup,
  deleteFactory,
  synchronizeFacility,
  getFactoriesByCmIdxController,
  addFactory,
  getFacilityGroupsController,
  getFacilitiesController,
} from '../../controller/facility/FacilityController.js';

const routes = [
  {
    method: 'post',
    path: '/aasx/factory',
    controller: addFactory,
    extractor: extractors.fromBody(['cm_idx', 'fc_name']),
  },
  {
    method: 'post',
    path: '/aasx/group',
    controller: addFacilityGroup,
    extractor: extractors.fromBody(['fc_idx', 'name']),
  },
  {
    method: 'post',
    path: '/aasx/facility',
    controller: addFacility,
    extractor: extractors.fromBody(['fg_idx', 'name']),
  },
  {
    method: 'post',
    path: '/aasx/sensor',
    controller: addSensor,
    extractor: extractors.fromBody(['fa_idx', 'name']),
  },
  {
    method: 'post',
    path: '/aasx/sensors',
    controller: deleteSensor,
    extractor: extractors.fromBody(['sensorIds']),
  },
  {
    method: 'post',
    path: '/aasx/facilities',
    controller: deleteFacility,
    extractor: extractors.fromBody(['facilityIds']),
  },
  {
    method: 'post',
    path: '/aasx/facility_groups',
    controller: deleteFacilityGroup,
    extractor: extractors.fromBody(['facilityGroupIds']),
  },
  {
    method: 'post',
    path: '/aasx/factories',
    controller: deleteFactory,
    extractor: extractors.fromBody(['factoryIds', 'cm_idx']),
  },
  {
    method: 'post',
    path: '/aasx/factories/list',
    controller: getFactoriesByCmIdxController,
    extractor: (req) => [req.body ? req.body.cm_idx : null],
  },
  {
    method: 'post',
    path: '/aasx/facility_groups/list',
    controller: getFacilityGroupsController,
    extractor: extractors.fromBody(['fc_idx']),
  },
  {
    method: 'post',
    path: '/aasx/facilities/list',
    controller: getFacilitiesController,
    extractor: extractors.fromBody(['fg_idx']),
  },
  {
    method: 'post',
    path: '/aasx/synchronize',
    controller: synchronizeFacility,
    extractor: extractors.fromBody(['cm_idx']),
  },
];

export default createRouter(routes);
