import express from 'express';
import { HTTP_STATUS } from '../constants/errors.js';

// 라우터 팩토리 함수
export const createRoute = (method, path, controller, paramExtractor) => {
  return (req, res) => {
    const params = paramExtractor(req);
    controller(...params, res);
  };
};

// 라우터 생성 헬퍼 함수
export const createRouter = (routes) => {
  const router = express.Router();

  routes.forEach(({ method, path, controller, extractor, middleware = [] }) => {
    const routeHandler = (req, res) => {
      try {
        const params = extractor(req);

        // 파라미터 검증: undefined나 null 값 필터링
        const validParams = params.map((param) => {
          if (param === undefined || param === null) {
            return null; // null로 변환하여 MySQL에서 처리 가능하도록
          }
          return param;
        });

        // res 객체가 항상 마지막 파라미터로 전달되도록 보장
        controller(...validParams, res);
      } catch (error) {
        console.error('라우터 핸들러 오류:', error);
        if (res && typeof res.status === 'function') {
          res.status(HTTP_STATUS.OK).json({
            success: false,
            message: '서버 내부 오류가 발생했습니다.',
          });
        }
      }
    };

    if (middleware.length > 0) {
      router[method](path, ...middleware, routeHandler);
    } else {
      router[method](path, routeHandler);
    }
  });

  return router;
};

// 일반적인 파라미터 추출 함수들
export const extractors = {
  // req.body에서 파라미터 추출
  fromBody: (paramNames) => (req) => {
    return paramNames.map((name) => req.body[name] || null);
  },

  // req.params에서 파라미터 추출
  fromParams: (paramNames) => (req) => {
    return paramNames.map((name) => req.params[name] || null);
  },

  // req.query에서 파라미터 추출
  fromQuery: (paramNames) => (req) => {
    return paramNames.map((name) => req.query[name] || null);
  },

  // 혼합 파라미터 추출 (body + params)
  mixed: (bodyParams, paramParams) => (req) => {
    const bodyValues = bodyParams.map((name) => req.body[name] || null);
    const paramValues = paramParams.map((name) => req.params[name] || null);
    return [...bodyValues, ...paramValues];
  },

  // 단일 파라미터 추출
  single:
    (paramName, source = 'body') =>
    (req) => {
      return [req[source][paramName] || null];
    },

  // 전체 req.body 전달
  fullBody: () => (req) => {
    return [req.body || {}];
  },

  // 전체 req 객체 전달
  fullRequest: () => (req) => {
    return [req];
  },
};
