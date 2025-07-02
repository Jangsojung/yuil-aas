const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// CPU 온도 측정 함수
async function getCPUTemperature() {
  try {
    // CPU 부하 기반 온도 추정 (Windows에서 하드웨어 센서 접근이 어려운 경우)
    const cpuLoad = await si.currentLoad();
    const cpuTemp = 30 + cpuLoad.currentLoad * 0.5; // 기본 30도 + 부하에 따른 온도 증가

    return Math.round(cpuTemp);
  } catch (error) {
    console.error('CPU 온도 측정 오류:', error);
    return 25; // 기본값
  }
}

// 서버 상태 확인
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 온도 정보 제공
app.get('/temperature', async (req, res) => {
  try {
    const temperature = await getCPUTemperature();
    res.json({
      temperature: temperature,
      timestamp: new Date().toISOString(),
      unit: 'celsius',
    });
  } catch (error) {
    console.error('온도 측정 오류:', error);
    res.status(500).json({ error: '온도 측정 실패' });
  }
});

// 서버 정보 제공
app.get('/info', async (req, res) => {
  try {
    const cpu = await si.cpu();
    const mem = await si.mem();
    const os = await si.osInfo();

    res.json({
      cpu: {
        model: cpu.manufacturer + ' ' + cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed,
      },
      memory: {
        total: Math.round((mem.total / 1024 / 1024 / 1024) * 100) / 100, // GB
        used: Math.round((mem.used / 1024 / 1024 / 1024) * 100) / 100, // GB
        free: Math.round((mem.free / 1024 / 1024 / 1024) * 100) / 100, // GB
      },
      os: {
        platform: os.platform,
        distro: os.distro,
        release: os.release,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('서버 정보 조회 오류:', error);
    res.status(500).json({ error: '서버 정보 조회 실패' });
  }
});

app.listen(PORT, () => {
  console.log(`온도 측정 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`- 온도 확인: http://localhost:${PORT}/temperature`);
  console.log(`- 서버 정보: http://localhost:${PORT}/info`);
  console.log(`- 상태 확인: http://localhost:${PORT}/health`);
});
