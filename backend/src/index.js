import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import BaseCodeRouter from './router/basic_code/BasicCodeRouter.js';
import EdgeGatewayRouter from './router/edge_gateway/EdgeGatewayRouter.js';
import ConvertRouter from './router/convert/ConvertRouter.js';
import FileRouter from './router/file/FileRouter.js';
import SignInRouter from './router/signin/SignInRouter.js';
import FacilityRouter from './router/facility/FacilityRouter.js';
import { testConnection } from './config/database.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/base_code', BaseCodeRouter);
app.use('/api/edge_gateway', EdgeGatewayRouter);
app.use('/api/convert', ConvertRouter);
app.use('/api/file', FileRouter);
app.use('/api/signin', SignInRouter);
app.use('/api/facility', FacilityRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {});

  ws.on('close', () => {});
});

// 서버 시작 시 데이터베이스 연결 테스트
testConnection().then((isConnected) => {
  if (isConnected) {
    server.listen(port, () => {
      console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    });
  } else {
    console.error('데이터베이스 연결 실패로 서버를 시작할 수 없습니다.');
    process.exit(1);
  }
});

const closeServer = () => {
  wss.clients.forEach((client) => {
    client.close();
  });

  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
};

process.on('SIGINT', () => {
  closeServer();
});

process.on('exit', () => {});
