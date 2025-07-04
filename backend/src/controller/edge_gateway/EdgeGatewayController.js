import {
  getEdgeGatewaysFromDB,
  getEdgeGatewaysWithRealTimeStatus,
  insertEdgeGatewaysToDB,
  updateEdgeGatewayToDB,
  deleteEdgeGatewaysFromDB,
  checkNetworkStatus,
  getServerTemperature,
} from '../../service/edge_gateway/EdgeGatewayService.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

export const getEdgeGateways = async (res) => {
  try {
    const result = await getEdgeGatewaysFromDB();

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getEdgeGatewaysWithStatus = async (res) => {
  try {
    const result = await getEdgeGatewaysWithRealTimeStatus();
    res.status(200).json(result);
  } catch (err) {
    console.error('getEdgeGatewaysWithStatus error:', err.message);
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

export const downloadDeployFiles = async (res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const deployPath = path.join(__dirname, '../../../deploy');

    // 배포 폴더가 존재하는지 확인
    if (!fs.existsSync(deployPath)) {
      return res.status(404).json({ error: '배포 파일을 찾을 수 없습니다.' });
    }

    // ZIP 파일 생성
    const archive = archiver('zip', {
      zlib: { level: 9 }, // 최대 압축
    });

    // 응답 헤더 설정
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="temperature-server-deploy.zip"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Disposition');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // 스트림 연결
    archive.pipe(res);

    // 배포 폴더의 모든 파일을 ZIP에 추가
    archive.directory(deployPath, false);

    // ZIP 파일 생성 완료
    await archive.finalize();
  } catch (err) {
    console.error('배포 파일 다운로드 오류:', err);
    res.status(500).json({ error: '배포 파일 생성 실패' });
  }
};

export const checkEdgeGatewayPing = async (ip, port, res) => {
  try {
    const isConnected = await checkNetworkStatus(ip);
    res.status(200).json({ connected: isConnected });
  } catch (err) {
    res.status(500).json({ error: 'Ping check failed' });
  }
};

export const checkEdgeGatewayTemperature = async (ip, port, res) => {
  try {
    const temperature = await getServerTemperature(ip, port);
    res.status(200).json({ temperature: temperature });
  } catch (err) {
    res.status(500).json({ error: 'Temperature check failed' });
  }
};
