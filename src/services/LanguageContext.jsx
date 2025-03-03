import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n';

// Create context
export const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (newLanguage) => {
    i18n.changeLanguage(newLanguage);
    // Set document lang attribute
    document.documentElement.lang = newLanguage;
    // Save to localStorage (i18next already does this via the detection plugin, 
    // but we're keeping the same API as before)
    localStorage.setItem('language', newLanguage);
  };
  
  // Get the current language
  const language = i18n.language || 'en';
  
  // Set document title when language changes
  document.title = t('app.coupon_manager');
  
  // Get supported languages from i18n config
  const getSupportedLanguages = () => supportedLanguages;
  
  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage,
      t: (key) => t(key),  // Simplify key format for compatibility with old code
      getSupportedLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
}; 