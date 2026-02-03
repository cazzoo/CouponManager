import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './services/LanguageContext';
import { AuthProvider } from './services/AuthContext';
import { useThemeStore } from './stores/themeStore';

import './index.css';
import './i18n';

function Root(): JSX.Element {
  const theme = useThemeStore((state) => state.theme);

  React.useEffect(() => {
    // Apply theme to document element for DaisyUI components to respect
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
); 