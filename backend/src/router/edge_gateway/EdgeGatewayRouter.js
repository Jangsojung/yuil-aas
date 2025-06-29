import express from 'express';
import {
  getEdgeGateways,
  insertEdgeGateways,
  updateEdgeGateway,
  deleteEdgeGateways,
} from '../../controller/edge_gateway/EdgeGatewayController.js';

const router = express.Router();

export default () => {
  router.post('/', (req, res) => {
    getEdgeGateways(res);
  });

  router.post('/insert', (req, res) => {
    const { user_idx } = req.body;
    const { serverTemp, networkStatus, pcTemp, pcIp, pcPort } = req.body;
    insertEdgeGateways(serverTemp, networkStatus, pcTemp, pcIp, pcPort, user_idx, res);
  });

  router.put('/', (req, res) => {
    const { eg_idx, user_idx } = req.body;
    const { serverTemp, networkStatus, pcTemp, pcIp, pcPort } = req.body;

    updateEdgeGateway(eg_idx, serverTemp, networkStatus, pcTemp, pcIp, pcPort, user_idx, res);
  });

  router.delete('/', (req, res) => {
    const { ids } = req.body;
    deleteEdgeGateways(ids, res);
  });

  return router;
};
