import { pool } from '../../index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execAsync = promisify(exec);

export const getEdgeGatewaysFromDB = async () => {
  return new Promise((resolve, reject) => {
    const query =
      'select eg_idx, eg_pc_name, eg_ip_port, createdAt, updatedAt from tb_aasx_edge_gateway order by eg_idx desc';

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
            eg_pc_name: eg.eg_pc_name,
            eg_ip_port: eg.eg_ip_port,
            createdAt: eg.createdAt,
            updatedAt: eg.updatedAt,
          };
        });

        resolve(edgeGateways);
      }
    });
  });
};

// Ping을 통한 네트워크 상태 확인
export const checkNetworkStatus = async (ip) => {
  try {
    const platform = process.platform;
    let command;

    if (platform === 'win32') {
      command = `ping -n 1 -w 2000 ${ip}`; // Windows: 2초 타임아웃 추가
    } else {
      command = `ping -c 1 -W 2 ${ip}`; // Linux/Mac: 2초 타임아웃 추가
    }

    const { stdout, stderr } = await execAsync(command);

    // ping 결과에서 응답 시간이나 특정 패턴을 확인
    let isConnected = false;
    if (platform === 'win32') {
      // Windows ping 결과 확인
      isConnected = stdout.includes('TTL=') || stdout.includes('시간=') || stdout.includes('Reply from');
    } else {
      // Linux/Mac ping 결과 확인
      isConnected =
        stdout.includes('1 received') || stdout.includes('1 packets received') || stdout.includes('bytes from');
    }

    return isConnected;
  } catch (error) {
    console.error(`Ping failed for ${ip}:`, error.message);
    // ping 실패 시 연결 안 됨으로 처리
    return false;
  }
};

// 모든 Edge Gateway의 실시간 상태 가져오기
export const getEdgeGatewaysWithRealTimeStatus = async () => {
  try {
    const edgeGateways = await getEdgeGatewaysFromDB();

    if (!edgeGateways) {
      return [];
    }

    // 각 Edge Gateway에 대해 실시간 상태 확인
    const edgeGatewaysWithStatus = await Promise.all(
      edgeGateways.map(async (eg) => {
        try {
          const [ip, port] = eg.eg_ip_port.split(':');

          // 네트워크 상태 확인
          const networkStatus = await checkNetworkStatus(ip);
          const result = {
            ...eg,
            eg_network: networkStatus ? 1 : 0,
          };

          return result;
        } catch (error) {
          console.error(`Error checking status for ${eg.eg_pc_name}:`, error.message);
          // 개별 Edge Gateway 에러 시 기본값으로 반환
          return {
            ...eg,
            eg_network: 0,
          };
        }
      })
    );

    return edgeGatewaysWithStatus;
  } catch (error) {
    console.error('Failed to get Edge Gateways with real-time status:', error);
    throw error;
  }
};

export const insertEdgeGatewaysToDB = async (pcName, pcIp, pcPort, user_idx) => {
  try {
    const ipPort = `${pcIp}:${pcPort}`;

    const query = `insert into tb_aasx_edge_gateway (eg_pc_name, eg_ip_port, creator, updater) values (?, ?, ?, ?)`;
    const [result] = await pool.promise().query(query, [pcName, ipPort, user_idx, user_idx]);

    return result.insertId;
  } catch (err) {
    // console.error('Failed to insert Edge Gateway: ', err);
    throw err;
  }
};

export const updateEdgeGatewayToDB = async (eg_idx, pcName, pcIp, pcPort, user_idx) => {
  try {
    const ipPort = `${pcIp}:${pcPort}`;

    const query = `update tb_aasx_edge_gateway set eg_pc_name = ?, eg_ip_port = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP where eg_idx = ?`;
    await pool.promise().query(query, [pcName, ipPort, user_idx, eg_idx]);
  } catch (err) {
    // console.error('Failed to update Edge Gateway: ', err);
    throw err;
  }
};

export const deleteEdgeGatewaysFromDB = async (ids) => {
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: '삭제할 ID가 없습니다.' };
    }

    const idString = ids.join(',');
    const query = `delete from tb_aasx_edge_gateway where eg_idx in (${idString})`;
    await pool.promise().query(query);

    return { success: true, message: '삭제가 완료되었습니다.' };
  } catch (err) {
    // console.error('Failed to delete Edge Gateway: ', err);
    throw err;
  }
};
