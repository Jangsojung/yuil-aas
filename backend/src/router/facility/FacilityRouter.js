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
} from '../../controller/facility/FacilityController.js';

const routes = [
  {
    method: 'post',
    path: '/aasx/group',
    controller: addFacilityGroup,
    extractor: extractors.fromBody(['name']),
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
    extractor: extractors.fromBody(['factoryIds']),
  },
  {
    method: 'post',
    path: '/aasx/synchronize',
    controller: synchronizeFacility,
    extractor: () => [],
  },
];

export default createRouter(routes);
