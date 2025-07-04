import express from 'express';
import {
  getEdgeGateways,
  getEdgeGatewaysWithStatus,
  insertEdgeGateways,
  updateEdgeGateway,
  deleteEdgeGateways,
  downloadDeployFiles,
  checkEdgeGatewayPing,
  checkEdgeGatewayTemperature,
} from '../../controller/edge_gateway/EdgeGatewayController.js';

const router = express.Router();

export default () => {
  router.post('/', (req, res) => {
    getEdgeGateways(res);
  });

  router.post('/status', (req, res) => {
    getEdgeGatewaysWithStatus(res);
  });

  router.post('/insert', (req, res) => {
    const { user_idx } = req.body;
    const { pcName, pcIp, pcPort } = req.body;
    insertEdgeGateways(pcName, pcIp, pcPort, user_idx, res);
  });

  router.put('/', (req, res) => {
    const { eg_idx, user_idx } = req.body;
    const { pcName, pcIp, pcPort } = req.body;

    updateEdgeGateway(eg_idx, pcName, pcIp, pcPort, user_idx, res);
  });

  router.delete('/', (req, res) => {
    const { ids } = req.body;
    deleteEdgeGateways(ids, res);
  });

  router.get('/download-deploy', (req, res) => {
    downloadDeployFiles(res);
  });

  router.post('/ping', (req, res) => {
    const { ip, port } = req.body;
    checkEdgeGatewayPing(ip, port, res);
  });

  router.post('/temperature', (req, res) => {
    const { ip, port } = req.body;
    checkEdgeGatewayTemperature(ip, port, res);
  });

  return router;
};
