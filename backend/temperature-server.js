import express from 'express';
import cors from 'cors';
import os from 'os';

const app = express();
const PORT = 15;

// CORS 설정
app.use(cors());

// JSON 파싱
app.use(express.json());

// CPU 온도 시뮬레이션 (실제로는 시스템 모니터링 라이브러리 사용)
function getCPUTemperature() {
  // 실제 환경에서는 시스템 모니터링 라이브러리 사용
  // 예: node-cpu-temp, systeminformation 등
  const baseTemp = 35; // 기본 온도
  const load = os.loadavg()[0]; // CPU 부하
  const temp = baseTemp + load * 10; // 부하에 따른 온도 증가
  return Math.round(temp * 10) / 10; // 소수점 첫째자리까지
}

// 온도 API 엔드포인트
app.get('/api/temperature', (req, res) => {
  try {
    const temperature = getCPUTemperature();
    res.json({
      temperature: temperature,
      timestamp: new Date().toISOString(),
      unit: 'celsius',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get temperature',
      message: error.message,
    });
  }
});

// 상태 API 엔드포인트
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: os.cpus()[0].model,
  });
});

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    service: 'Temperature API Server',
    version: '1.0.0',
    endpoints: ['/api/temperature', '/status'],
  });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Temperature API Server running on http://0.0.0.0:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  - GET /api/temperature`);
  console.log(`  - GET /status`);
  console.log(`  - GET /`);
});

// 에러 처리
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
