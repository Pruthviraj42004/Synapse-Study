/**
 * Enhanced Theme Configuration
 * Extends MUI theme with cyberpunk aesthetic
 * Drop-in replacement for existing theme in index.js
 */

import { createTheme } from '@mui/material/styles';

const cyberTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f0ff',
      light: '#33f3ff',
      dark: '#00c0cc',
      contrastText: '#000000',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#bd00ff',
      light: '#ca33ff',
      dark: '#9700cc',
      contrastText: '#ffffff',
    },
    success: {
      main: '#39ff14',
      light: '#5dff43',
      dark: '#2ecc10',
    },
    warning: {
      main: '#ffff00',
      light: '#ffff33',
      dark: '#cccc00',
    },
    error: {
      main: '#ff0080',
      light: '#ff3399',
      dark: '#cc0066',
    },
    info: {
      main: '#00f0ff',
      light: '#33f3ff',
      dark: '#00c0cc',
    },
    background: {
      default: '#0a0a0f',
      paper: '#16161d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b4b4b4',
      disabled: '#6b6b6b',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Outfit", "Space Grotesk", system-ui, -apple-system, sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    code: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
  shadows: [
    'none',
    '0 2px 4px rgba(0, 0, 0, 0.3)',
    '0 4px 8px rgba(0, 0, 0, 0.3)',
    '0 8px 16px rgba(0, 0, 0, 0.3)',
    '0 12px 24px rgba(0, 0, 0, 0.3)',
    '0 16px 32px rgba(0, 0, 0, 0.3)',
    '0 20px 40px rgba(0, 0, 0, 0.3)',
    '0 24px 48px rgba(0, 0, 0, 0.3)',
    // Neon glow shadows
    '0 0 20px rgba(255, 0, 128, 0.4)',
    '0 0 20px rgba(0, 240, 255, 0.4)',
    '0 0 20px rgba(189, 0, 255, 0.4)',
    '0 0 30px rgba(255, 0, 128, 0.5), 0 0 50px rgba(255, 0, 128, 0.3)',
    '0 0 30px rgba(0, 240, 255, 0.5), 0 0 50px rgba(0, 240, 255, 0.3)',
    '0 0 30px rgba(189, 0, 255, 0.5), 0 0 50px rgba(189, 0, 255, 0.3)',
    '8px 8px 0 rgba(0, 0, 0, 0.8)',
    '12px 12px 0 rgba(0, 0, 0, 0.8)',
    '0 0 40px rgba(255, 0, 128, 0.6), 0 0 80px rgba(255, 0, 128, 0.4)',
    '0 0 40px rgba(0, 240, 255, 0.6), 0 0 80px rgba(0, 240, 255, 0.4)',
    '0 0 40px rgba(189, 0, 255, 0.6), 0 0 80px rgba(189, 0, 255, 0.4)',
    'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
    '0 0 60px rgba(255, 0, 128, 0.7), 0 0 120px rgba(255, 0, 128, 0.5)',
    '0 0 60px rgba(0, 240, 255, 0.7), 0 0 120px rgba(0, 240, 255, 0.5)',
    '0 0 60px rgba(189, 0, 255, 0.7), 0 0 120px rgba(189, 0, 255, 0.5)',
    '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 0, 128, 0.4)',
    '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 240, 255, 0.4)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.5px',
          borderRadius: '4px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.4)',
          '&:hover': {
            boxShadow: '0 0 30px rgba(255, 0, 128, 0.6), 0 0 50px rgba(255, 0, 128, 0.3)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            boxShadow: '0 0 20px currentColor',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#16161d',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#16161d',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#00f0ff',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f0ff',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#16161d',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          letterSpacing: '0.3px',
        },
        filled: {
          border: '1px solid currentColor',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#16161d',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          fontSize: '0.875rem',
        },
      },
    },
  },
});

export default cyberTheme;
