import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  cssVariables: true,
  palette: {
    success: {
      main: '#36B37E',
    },
    primary: {
      main: '#0070C0',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#C03221',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;