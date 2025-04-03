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
