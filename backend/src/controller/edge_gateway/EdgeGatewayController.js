import {
  getEdgeGatewaysFromDB,
  insertEdgeGatewaysToDB,
  updateEdgeGatewayToDB,
  deleteEdgeGatewaysFromDB,
} from '../../service/edge_gateway/EdgeGatewayService.js';

export const getEdgeGateways = async (res) => {
  try {
    const result = await getEdgeGatewaysFromDB();

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const insertEdgeGateways = async (serverTemp, networkStatus, pcTemp, pcIp, pcPort, res) => {
  try {
    const result = await insertEdgeGatewaysToDB(serverTemp, networkStatus, pcTemp, pcIp, pcPort);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const updateEdgeGateway = async (eg_idx, serverTemp, networkStatus, pcTemp, pcIp, pcPort, res) => {
  try {
    const result = await updateEdgeGatewayToDB(eg_idx, serverTemp, networkStatus, pcTemp, pcIp, pcPort);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const deleteEdgeGateways = async (ids, res) => {
  try {
    const result = await deleteEdgeGatewaysFromDB(ids);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};
