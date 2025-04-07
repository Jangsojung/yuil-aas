import express from 'express';
import {
  getEdgeGateways,
  insertEdgeGateways,
  deleteEdgeGateways,
} from '../../controller/edge_gateway/EdgeGatewayController.js';

const router = express.Router();

export default () => {
  router.get('/', (req, res) => {
    getEdgeGateways(res);
  });

  router.post('/', (req, res) => {
    const { serverTemp, networkStatus, pcTemp, pcIp, pcPort } = req.body;
    insertEdgeGateways(serverTemp, networkStatus, pcTemp, pcIp, pcPort, res);
  });

  router.delete('/', (req, res) => {
    const { ids } = req.body;
    deleteEdgeGateways(ids, res);
  });

  return router;
};
