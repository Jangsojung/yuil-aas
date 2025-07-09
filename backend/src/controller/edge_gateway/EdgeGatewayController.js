import {
  getEdgeGatewaysFromDB,
  getEdgeGatewaysWithRealTimeStatus,
  insertEdgeGatewaysToDB,
  updateEdgeGatewayToDB,
  deleteEdgeGatewaysFromDB,
  checkNetworkStatus,
} from '../../service/edge_gateway/EdgeGatewayService.js';
import { successResponse, internalServerError, pingCheckError } from '../../utils/responseHandler.js';

export const getEdgeGateways = async (res) => {
  try {
    const result = await getEdgeGatewaysFromDB();
    successResponse(res, result);
  } catch (err) {
    internalServerError(res);
  }
};

export const getEdgeGatewaysWithStatus = async (res) => {
  try {
    const result = await getEdgeGatewaysWithRealTimeStatus();
    successResponse(res, result);
  } catch (err) {
    internalServerError(res);
  }
};

export const insertEdgeGateways = async (pcName, pcIp, pcPort, user_idx, res) => {
  try {
    const eg_idx = await insertEdgeGatewaysToDB(pcName, pcIp, pcPort, user_idx);

    const newEdgeGateway = {
      eg_idx,
      eg_pc_name: pcName,
      eg_ip_port: `${pcIp}:${pcPort}`,
    };

    successResponse(res, newEdgeGateway);
  } catch (err) {
    internalServerError(res);
  }
};

export const updateEdgeGateway = async (eg_idx, pcName, pcIp, pcPort, user_idx, res) => {
  try {
    await updateEdgeGatewayToDB(eg_idx, pcName, pcIp, pcPort, user_idx);
    successResponse(res, { success: true });
  } catch (err) {
    internalServerError(res);
  }
};

export const deleteEdgeGateways = async (ids, res) => {
  try {
    const result = await deleteEdgeGatewaysFromDB(ids);
    successResponse(res, result);
  } catch (err) {
    internalServerError(res);
  }
};

export const checkEdgeGatewayPing = async (ip, port, res) => {
  try {
    const isConnected = await checkNetworkStatus(ip);
    successResponse(res, { connected: isConnected });
  } catch (err) {
    pingCheckError(res);
  }
};
