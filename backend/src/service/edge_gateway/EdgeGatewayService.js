import { pool } from '../../config/database.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const getEdgeGatewaysFromDB = async () => {
  try {
    const query =
      'select eg_idx, eg_pc_name, eg_ip_port, createdAt, updatedAt from tb_aasx_edge_gateway order by eg_idx desc';

    const [results] = await pool.promise().query(query);

    if (results.length === 0) {
      return null;
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

    return edgeGateways;
  } catch (err) {
    throw err;
  }
};

// Ping을 통한 네트워크 상태 확인
export const checkNetworkStatus = async (ip) => {
  try {
    const platform = process.platform;
    let command;

    if (platform === 'win32') {
      command = `ping -n 1 -w 2000 ${ip}`; // Windows
    } else {
      command = `ping -c 1 -W 2 ${ip}`; // Linux/Mac
    }

    const { stdout, stderr } = await execAsync(command);

    // ping 결과에서 응답 시간이나 특정 패턴을 확인
    let isConnected = false;
    if (platform === 'win32') {
      // Windows
      isConnected = stdout.includes('TTL=') || stdout.includes('시간=') || stdout.includes('Reply from');
    } else {
      // Linux/Mac
      isConnected =
        stdout.includes('1 received') || stdout.includes('1 packets received') || stdout.includes('bytes from');
    }

    return isConnected;
  } catch (error) {
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
    throw error;
  }
};

export const insertEdgeGatewaysToDB = async (pcName, pcIp, pcPort, user_idx) => {
  try {
    // 파라미터 검증
    const validatedPcName = pcName && pcName !== null && pcName !== undefined ? pcName : null;
    const validatedPcIp = pcIp && pcIp !== null && pcIp !== undefined ? pcIp : null;
    const validatedPcPort = pcPort && pcPort !== null && pcPort !== undefined ? pcPort : null;
    const validatedUserIdx = user_idx && user_idx !== null && user_idx !== undefined ? user_idx : null;

    const ipPort = `${validatedPcIp}:${validatedPcPort}`;

    const query = `insert into tb_aasx_edge_gateway (eg_pc_name, eg_ip_port, creator, updater) values (?, ?, ?, ?)`;
    const [result] = await pool.promise().query(query, [validatedPcName, ipPort, validatedUserIdx, validatedUserIdx]);

    return result.insertId;
  } catch (err) {
    throw err;
  }
};

export const updateEdgeGatewayToDB = async (eg_idx, pcName, pcIp, pcPort, user_idx) => {
  try {
    // 파라미터 검증
    const validatedEgIdx = eg_idx && eg_idx !== null && eg_idx !== undefined ? eg_idx : null;
    const validatedPcName = pcName && pcName !== null && pcName !== undefined ? pcName : null;
    const validatedPcIp = pcIp && pcIp !== null && pcIp !== undefined ? pcIp : null;
    const validatedPcPort = pcPort && pcPort !== null && pcPort !== undefined ? pcPort : null;
    const validatedUserIdx = user_idx && user_idx !== null && user_idx !== undefined ? user_idx : null;

    const ipPort = `${validatedPcIp}:${validatedPcPort}`;

    const query = `update tb_aasx_edge_gateway set eg_pc_name = ?, eg_ip_port = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP where eg_idx = ?`;
    await pool.promise().query(query, [validatedPcName, ipPort, validatedUserIdx, validatedEgIdx]);
  } catch (err) {
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
    throw err;
  }
};
