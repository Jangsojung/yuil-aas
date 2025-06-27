import { pool } from '../../index.js';

export const getEdgeGatewaysFromDB = async () => {
  return new Promise((resolve, reject) => {
    const query =
      'select eg_idx, eg_server_temp, eg_network, eg_pc_temp, eg_ip_port, createdAt from tb_aasx_edge_gateway order by eg_idx desc';

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
            createdAt: eg.createdAt,
          };
        });

        resolve(edgeGateways);
      }
    });
  });
};

export const insertEdgeGatewaysToDB = async (serverTemp, networkStatus, pcTemp, pcIp, pcPort, user_idx) => {
  try {
    const ipPort = `${pcIp}:${pcPort}`;

    const query = `insert into tb_aasx_edge_gateway (eg_server_temp, eg_network, eg_pc_temp, eg_ip_port, creator, updater) values (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.promise().query(query, [serverTemp, networkStatus, pcTemp, ipPort, user_idx, user_idx]);

    console.log('Edge Gateway inserted successfully');

    return result.insertId;
  } catch (err) {
    console.log('Failed to insert Edge Gateway: ', err);
    throw err;
  }
};

export const updateEdgeGatewayToDB = async (eg_idx, serverTemp, networkStatus, pcTemp, pcIp, pcPort, user_idx) => {
  try {
    const ipPort = `${pcIp}:${pcPort}`;

    const query = `update tb_aasx_edge_gateway set eg_server_temp = ?, eg_network = ?, eg_pc_temp = ?, eg_ip_port = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP where eg_idx = ?`;
    await pool.promise().query(query, [serverTemp, networkStatus, pcTemp, ipPort, user_idx, eg_idx]);

    console.log('Edge Gateway updated successfully');
  } catch (err) {
    console.log('Failed to update Edge Gateway: ', err);
    throw err;
  }
};

export const deleteEdgeGatewaysFromDB = async (ids) => {
  try {
    if (!ids || ids.length === 0) {
      console.log('No IDs provided for deletion');
      return { success: false, message: '삭제할 ID가 없습니다.' };
    }

    const idString = ids.join(',');
    const query = `delete from tb_aasx_edge_gateway where eg_idx in (${idString})`;
    await pool.promise().query(query);

    console.log('Edge Gateway deleted successfully');
    return { success: true, message: '삭제가 완료되었습니다.' };
  } catch (err) {
    console.log('Failed to delete Edge Gateway: ', err);
    throw err;
  }
};
