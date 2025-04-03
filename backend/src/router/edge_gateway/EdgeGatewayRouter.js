import express from 'express';
import { getEdgeGateways } from '../../controller/edge_gateway/EdgeGatewayController.js';

const router = express.Router();

export default () => {
  router.get('/', (req, res) => {
    getEdgeGateways(res);
  });

  return router;
};
