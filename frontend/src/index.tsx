import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { RecoilRoot } from 'recoil';
import App from './App';
import theme from './theme';
import './assets/scss/style.scss';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);

dayjs.locale('ko');
root.render(
  <RecoilRoot>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </RecoilRoot>
);
