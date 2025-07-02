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

export const insertEdgeGateways = async (pcName, pcIp, pcPort, user_idx, res) => {
  try {
    const eg_idx = await insertEdgeGatewaysToDB(pcName, pcIp, pcPort, user_idx);

    const newEdgeGateway = {
      eg_idx,
      eg_pc_name: pcName,
      eg_ip_port: `${pcIp}:${pcPort}`,
    };

    res.status(200).json(newEdgeGateway);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const updateEdgeGateway = async (eg_idx, pcName, pcIp, pcPort, user_idx, res) => {
  try {
    await updateEdgeGatewayToDB(eg_idx, pcName, pcIp, pcPort, user_idx);

    res.status(200).json({ success: true });
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
