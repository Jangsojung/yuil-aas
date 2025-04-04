import * as React from 'react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation } from '@toolpad/core/AppProvider';

import Layout from './layouts/dashboard';
import authLayout from './layouts/auth';

import DashboardPage from './pages/aas/dashboard';
import ConvertPage from './pages/aas/convert';
import TransmitPage from './pages/aas/transmit';
import MonitoringPage from './pages/aas/monitoring';
import aasxManagerPage from './pages/aasx/aasxManager';
import dataManagerPage from './pages/aasx/dataManager';
import edgePage from './pages/edge/edge';
import SignInPage from './pages/signIn/sign';

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
      {
        segment: 'monitoring',
        title: 'KAMP 송신 모니터링',
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
  {
    segment: 'signIn',
    title: 'signIn',
    children: [
      {
        segment: 'sign',
        title: 'signIn',
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
      createMemoryRouter([
        {
          Component: App,
          children: [
            {
              path: '/',
              Component: Layout,
              children: [
                {
                  path: '/aas/dashboard',
                  Component: DashboardPage,
                },
                {
                  path: '/aas/convert',
                  Component: ConvertPage,
                },
                {
                  path: '/aas/transmit',
                  Component: TransmitPage,
                },
                {
                  path: '/aas/monitoring',
                  Component: MonitoringPage,
                },
              ],
            },
            {
              path: '/',
              Component: Layout,
              children: [
                {
                  path: '/aasx/aasxManager',
                  Component: aasxManagerPage,
                },
                {
                  path: '/aasx/dataManager',
                  Component: dataManagerPage,
                },
              ],
            },
            {
              path: '/',
              Component: Layout,
              children: [
                {
                  path: '/edge/edge',
                  Component: edgePage,
                },
              ],
            },
            {
              path: '/',
              Component: authLayout,
              children: [
                {
                  path: '/signIn/sign',
                  Component: SignInPage,
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
