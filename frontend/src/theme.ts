import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  cssVariables: true,
  palette: {
    success: {
      main: '#36B37E',
    },
    primary: {
      main: '#3785FF',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#FF5630',
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
