import { pool } from '../../index.js';

export const getEdgeGatewaysFromDB = async () => {
  return new Promise((resolve, reject) => {
    const query =
      'select eg_idx, eg_server_temp, eg_network, eg_pc_temp, eg_ip_port from tb_aasx_edge_gateway order by eg_idx desc';

    pool.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const edgeGateways = results.map((eg) => {
          return {
            eg_idx: eg.eg_idx,
            eg_server_temp: eg.eg_server_temp,
            eg_network: eg.eg_network,
            eg_pc_temp: eg.eg_pc_temp,
            eg_ip_port: eg.eg_ip_port,
          };
        });

        resolve(edgeGateways);
      }
    });
  });
};

export const insertEdgeGatewaysToDB = async (serverTemp, networkStatus, pcTemp, pcIp, pcPort) => {
  try {
    const ipPort = `${pcIp}:${pcPort}`;

    const query = `insert into tb_aasx_edge_gateway (eg_server_temp, eg_network, eg_pc_temp, eg_ip_port, eg_path) values (?, ?, ?, ?, '/src/files/kamp')`;
    await pool.promise().query(query, [serverTemp, networkStatus, pcTemp, ipPort]);

    console.log('Edge Gateway inserted successfully');
  } catch (err) {
    console.log('Failed to insert Edge Gateway: ', err);
    throw err;
  }
};

export const deleteEdgeGatewaysFromDB = async (ids) => {
  try {
    const query = `delete from tb_aasx_edge_gateway where eg_idx in (?)`;
    await pool.promise().query(query, [ids]);

    console.log('Edge Gateway deleted successfully');
  } catch (err) {
    console.log('Failed to deleted Edge Gateway: ', err);
    throw err;
  }
};
