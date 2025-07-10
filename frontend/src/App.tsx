import React, { useMemo } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation } from '@toolpad/core/AppProvider';

import Layout from './layouts/dashboard';
import AuthLayout from './layouts/auth';
import DashboardPage from './pages/dashboard/dashboard';
import ConvertPage from './pages/aas/convert';
import TransmitPage from './pages/aasx/transmit';
import AasxManagerPage from './pages/aasx/aasx';
import DataManagerPage from './pages/data/data';
import JSONManagerPage from './pages/data/json';
import EdgePage from './pages/edge';
import SignInPage from './pages/signIn/sign';
import ProtectedRoute from './components/route/ProtectedRoute';

import FacilityPage from './pages/aas/facility';
import BasicCodeIndex from './pages/aas/basic';
import BasicCodeAdd from './pages/aas/basic/add';
import BasicCodeEdit from './pages/aas/basic/edit';
import JsonDetail from './pages/data/json/detail';

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
                  path: 'facility',
                  element: <FacilityPage />,
                },
                {
                  path: 'basic',
                  element: <BasicCodeIndex />,
                },
                {
                  path: 'basic/add',
                  element: <BasicCodeAdd />,
                },
                {
                  path: 'basic/edit/:id/:mode',
                  element: <BasicCodeEdit />,
                },
                {
                  path: 'convert',
                  element: <ConvertPage />,
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
                  element: <JSONManagerPage />,
                },
                {
                  path: 'jsonManager/detail/:id',
                  element: <JsonDetail />,
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
        segment: 'facility',
        title: '설비 관리',
      },
      {
        segment: 'basic',
        title: '기초코드 관리',
      },
      {
        segment: 'convert',
        title: '기초코드 변환',
      },
    ],
  },
  {
    segment: 'data',
    title: '데이터 관리',
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
