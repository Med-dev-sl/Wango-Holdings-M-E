import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // blue
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#fff',
    },
    secondary: {
      main: '#4caf50', // green
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: ['Century Gothic', 'Trebuchet MS', 'Candara', 'sans-serif'].join(','),
    h1: {
      fontFamily: 'Century Gothic, sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: 'Century Gothic, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Century Gothic, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Century Gothic, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Century Gothic, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Century Gothic, sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: 'Trebuchet MS, sans-serif',
    },
    body2: {
      fontFamily: 'Trebuchet MS, sans-serif',
    },
    button: {
      fontFamily: 'Candara, sans-serif',
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: 'Candara, sans-serif',
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'transform 0.2s',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            fontFamily: 'Trebuchet MS, sans-serif',
          },
          '& .MuiOutlinedInput-root': {
            fontFamily: 'Trebuchet MS, sans-serif',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-h1, &.MuiTypography-h2, &.MuiTypography-h3, &.MuiTypography-h4, &.MuiTypography-h5, &.MuiTypography-h6': {
            fontFamily: 'Century Gothic, sans-serif',
          },
          '&.MuiTypography-body1, &.MuiTypography-body2': {
            fontFamily: 'Trebuchet MS, sans-serif',
          },
        },
      },
    },
  },
});

export default theme;
