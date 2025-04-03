import { getEdgeGatewaysFromDB } from '../../service/edge_gateway/EdgeGatewayService.js';

export const getEdgeGateways = async (res) => {
  try {
    const result = await getEdgeGatewaysFromDB();

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};
