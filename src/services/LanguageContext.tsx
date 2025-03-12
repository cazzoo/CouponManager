import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n';
import { Language } from '../types';

interface LanguageContextType {
  language: string;
  changeLanguage: (newLanguage: string) => void;
  t: (key: string) => string;
  getSupportedLanguages: () => Language[];
}

interface LanguageProviderProps {
  children: ReactNode;
}

// Create context
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (newLanguage: string): void => {
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
  const getSupportedLanguages = (): Language[] => supportedLanguages;
  
  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage,
      t: (key: string) => t(key),  // Simplify key format for compatibility with old code
      getSupportedLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
}; 