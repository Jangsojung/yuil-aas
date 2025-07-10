import { createRouter, extractors } from '../../utils/routerHelper.js';
import {
  getEdgeGateways,
  getEdgeGatewaysWithStatus,
  insertEdgeGateways,
  updateEdgeGateway,
  deleteEdgeGateways,
  checkEdgeGatewayPing,
} from '../../controller/edge_gateway/EdgeGatewayController.js';

const routes = [
  {
    method: 'post',
    path: '/',
    controller: getEdgeGateways,
    extractor: () => [],
  },
  {
    method: 'post',
    path: '/status',
    controller: getEdgeGatewaysWithStatus,
    extractor: () => [],
  },
  {
    method: 'post',
    path: '/insert',
    controller: insertEdgeGateways,
    extractor: extractors.fromBody(['pcName', 'pcIp', 'pcPort', 'user_idx']),
  },
  {
    method: 'put',
    path: '/',
    controller: updateEdgeGateway,
    extractor: extractors.fromBody(['eg_idx', 'pcName', 'pcIp', 'pcPort', 'user_idx']),
  },
  {
    method: 'delete',
    path: '/',
    controller: deleteEdgeGateways,
    extractor: extractors.fromBody(['ids']),
  },
  {
    method: 'post',
    path: '/ping',
    controller: checkEdgeGatewayPing,
    extractor: extractors.fromBody(['ip', 'port']),
  },
];

export default createRouter(routes);
