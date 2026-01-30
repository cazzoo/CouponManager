import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './services/LanguageContext';
import { AuthProvider } from './services/AuthContext';

import './index.css';
import './i18n';

function Root(): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  return (
    <div data-theme={isDarkMode ? 'dark' : 'light'}>
      <AuthProvider>
        <LanguageProvider>
          <App isDarkMode={isDarkMode} onThemeChange={setIsDarkMode} />
        </LanguageProvider>
      </AuthProvider>
    </div>
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