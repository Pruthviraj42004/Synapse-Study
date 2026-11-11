import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import cyberTheme from './styles/cyberTheme';
import './styles/theme.css';
import './styles/focus.css';
import './styles/animations.css';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import App from './App';
import store from './redux/store';
import { ProgrammingProvider } from './context/ProgrammingContext';

// Use cyberpunk brutalist theme

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={cyberTheme}>
        <HelmetProvider>
          <CssBaseline />
          <ProgrammingProvider>
            {/* AnimatedWrap, AnimatedButton, Icon available globally */}
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-cyber-bg-dark, #18181b)',
                  color: 'var(--color-cyber-pink, #ff0080)',
                },
              }}
            />
          </ProgrammingProvider>
        </HelmetProvider>
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);