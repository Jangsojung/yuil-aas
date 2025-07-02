# Edge Gateway 온도 측정 서버

이 서버는 Edge Gateway PC의 온도와 시스템 정보를 실시간으로 측정하여 제공합니다.

## 설치 방법

1. **Node.js 설치**

   - Node.js 16.x 이상 버전이 필요합니다.
   - [Node.js 공식 사이트](https://nodejs.org/)에서 다운로드하여 설치하세요.

2. **의존성 설치**
   ```bash
   npm install
   ```

## 실행 방법

### 일반 실행

```bash
npm start
```

### 개발 모드 실행 (자동 재시작)

```bash
npm run dev
```

### 직접 실행

```bash
node temperature-server.js
```

## API 엔드포인트

- **온도 확인**: `GET http://localhost:3001/temperature`
- **서버 정보**: `GET http://localhost:3001/info`
- **상태 확인**: `GET http://localhost:3001/health`

## 포트 변경

기본 포트는 3001입니다. 다른 포트를 사용하려면:

```bash
PORT=3002 npm start
```

또는 환경 변수로 설정:

```bash
set PORT=3002  # Windows
export PORT=3002  # Linux/Mac
npm start
```

## 주의사항

- Windows 환경에서는 CPU 부하 기반으로 온도를 추정합니다.
- 실제 하드웨어 온도 센서에 접근하려면 OpenHardwareMonitor를 설치하고 관리자 권한으로 실행해야 합니다.
- 방화벽에서 해당 포트(기본 3001)를 허용해야 합니다.

## 문제 해결

1. **포트 충돌**: 다른 포트를 사용하세요.
2. **권한 오류**: 관리자 권한으로 실행하세요.
3. **의존성 오류**: `npm install`을 다시 실행하세요.
