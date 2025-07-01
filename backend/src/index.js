import express from 'express';
import mysql from 'mysql2';
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
app.use('/api/edge_gateway', EdgeGatewayRouter());
app.use('/api/convert', ConvertRouter());
app.use('/api/file', FileRouter());
app.use('/api/signin', SignInRouter());
app.use('/api/facility', FacilityRouter());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // console.log('Back Received:', message.toString());
  });

  ws.on('close', () => {});
});

server.listen(port, () => {});

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
