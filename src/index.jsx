import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { LanguageProvider } from './services/LanguageContext';
import { AuthProvider } from './services/AuthContext';

// Import i18n configuration
import './i18n';

// Conditionally initialize MSW in development mode
const initMockServiceWorker = async () => {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MEMORY_DB === 'true') {
    console.log('Initializing Mock Service Worker for development...');
    const { default: startMockServiceWorker } = await import('./mocks/browser');
    await startMockServiceWorker();
    console.log('Mock Service Worker initialized.');
  }
};

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#303030',
      paper: '#424242'
    },
    primary: {
      main: '#66bb6a'
    }
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
      paper: '#e8e8e8'
    },
    primary: {
      main: '#2e7d32'
    }
  },
});

function Root() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize MSW on component mount
  useEffect(() => {
    const initialize = async () => {
      await initMockServiceWorker();
      setIsInitialized(true);
    };
    
    initialize();
  }, []);

  // Show loading or app based on initialization status
  if (!isInitialized) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Initializing application...</p>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <AuthProvider>
        <LanguageProvider>
          <App isDarkMode={isDarkMode} onThemeChange={setIsDarkMode} />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);