import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import BaseCodeRouter from './router/basic_code/BasicCodeRouter.js';
import KampMonitoringRouter from './router/kamp_monitoring/KampMonitoringRouter.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors({ origin: '*' }));
app.use(express.json());

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.use('/api/base_code', BaseCodeRouter());
app.use('/api/kamp_monitoring', KampMonitoringRouter());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Backend: 웹 소켓 연결');

  ws.on('message', (message) => {
    console.log('Back Received:', message.toString());
  });

  ws.on('close', () => {
    console.log('Backend: 웹 소켓 연결 해제');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const closeServer = () => {
  wss.clients.forEach((client) => {
    client.close();
  });

  wss.close(() => {
    server.close(() => {
      console.log('포트 5001 해제');
      process.exit(0);
    });
  });
};

process.on('SIGINT', () => {
  console.log('서버 종료');
  closeServer();
});

process.on('exit', () => {
  console.log('서버 종료');
});
