import * as React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation } from '@toolpad/core/AppProvider';

import Layout from './layouts/dashboard';
import AuthLayout from './layouts/auth';
import DashboardPage from './pages/aas/dashboard';
import ConvertPage from './pages/aas/convert';
import TransmitPage from './pages/aas/transmit';
import AasxManagerPage from './pages/aasx/aasxManager';
import DataManagerPage from './pages/aasx/dataManager';
import EdgePage from './pages/edge/edge';
import SignInPage from './pages/signIn/sign';
import ProtectedRoute from './components/route/ProtectedRoute';



const NAVIGATION: Navigation = [
  {
    segment: 'aas',
    title: 'AAS KAMP DATA I/F',
    children: [
      {
        segment: 'dashboard',
        title: '기초코드',
      },
      {
        segment: 'convert',
        title: 'DATA 변환',
      },
      {
        segment: 'transmit',
        title: 'DATA 송신',
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
        segment: 'dataManager',
        title: '데이터 관리',
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

function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}

export default function ReactRouter() {
  const router = React.useMemo(
    () =>
      createBrowserRouter([
        {
          path: '/',
          Component: App,
          children: [
            {
              path: '',
              element: <Navigate to='/aas/dashboard' replace />,
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
                  path: 'dashboard',
                  element: <DashboardPage />,
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
                  path: 'dataManager',
                  element: <DataManagerPage />,
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
