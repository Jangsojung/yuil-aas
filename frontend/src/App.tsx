import React, { useMemo } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation } from '@toolpad/core/AppProvider';

import Layout from './layouts/dashboard';
import AuthLayout from './layouts/auth';
import DashboardPage from './pages/dashboard/dashboard';
import BasiccodePage from './pages/aas/basiccode';
import ConvertPage from './pages/aas/convert';
import TransmitPage from './pages/aas/transmit';
import AasxManagerPage from './pages/aasx/aasxManager';
import DataManagerPage from './pages/aasx/dataManager';
import EdgePage from './pages/edge/edge';
import SignInPage from './pages/signIn/sign';
import ProtectedRoute from './components/route/ProtectedRoute';
import JsonPage from './pages/aasx/jsonManager';

function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}

export default function ReactRouter() {
  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: '/',
          Component: App,
          children: [
            {
              index: true,
              element: <Navigate to='/dashboard/dashboard' replace />,
            },
            {
              path: 'dashboard',
              element: (
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              ),
              children: [
                {
                  path: 'dashboard',
                  element: <DashboardPage />,
                },
              ],
            },
            {
              path: 'signIn',
              element: <AuthLayout />,
              children: [
                {
                  path: 'sign',
                  element: <SignInPage />,
                },
              ],
            },
            {
              path: 'aas',
              element: (
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              ),
              children: [
                {
                  path: 'basiccode',
                  element: <BasiccodePage />,
                },
                {
                  path: 'convert',
                  element: <ConvertPage />,
                },
                {
                  path: 'transmit',
                  element: <TransmitPage />,
                },
              ],
            },
            {
              path: 'data',
              element: (
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              ),
              children: [
                {
                  path: 'dataManager',
                  element: <DataManagerPage />,
                },
                {
                  path: 'jsonManager',
                  element: <JsonPage />,
                },
              ],
            },
            {
              path: 'aasx',
              element: (
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              ),
              children: [
                {
                  path: 'aasxManager',
                  element: <AasxManagerPage />,
                },
                {
                  path: 'transmit',
                  element: <TransmitPage />,
                },
              ],
            },
            {
              path: 'edge',
              element: (
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              ),
              children: [
                {
                  path: 'edge',
                  element: <EdgePage />,
                },
              ],
            },
          ],
        },
      ]),
    []
  );

  return <RouterProvider router={router} />;
}

const NAVIGATION: Navigation = [
  {
    segment: 'aas',
    title: 'AAS KAMP DATA I/F',
    children: [
      {
        segment: 'basiccode',
        title: '기초코드 등록',
      },
      {
        segment: 'convert',
        title: '기초코드 변환',
      },
    ],
  },
  {
    segment: 'data',
    title: 'DATA 관리',
    children: [
      {
        segment: 'dataManager',
        title: '식별 ID 관리',
      },
      {
        segment: 'jsonManager',
        title: 'JSON 파일 관리',
      },
    ],
  },
  {
    segment: 'aasx',
    title: 'AASX Package Explorer 관리',
    children: [
      {
        segment: 'aasxManager',
        title: 'AASX 관리',
      },
      {
        segment: 'transmit',
        title: 'AASX 송신',
      },
    ],
  },
  {
    segment: 'edge',
    title: 'Edge Gateway 관리',
    children: [
      {
        segment: 'edge',
        title: 'Edge Gateway 관리',
      },
    ],
  },
];
