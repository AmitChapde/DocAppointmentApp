import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0288d1' },
    secondary: { main: '#26a69a' },
    background: {
      default: '#f0f2f5',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export default theme;
