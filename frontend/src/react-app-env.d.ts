/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_BASE_URL?: string;
    REACT_APP_WS_URL?: string;
    // 필요한 환경변수 추가
  }
}

interface Process {
  env: NodeJS.ProcessEnv;
}

declare var process: Process;
