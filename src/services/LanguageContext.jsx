import React, { createContext, useState, useContext, useEffect } from 'react';
import { languageService } from './LanguageService';

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
  const [language, setLanguage] = useState(languageService.getCurrentLanguage());
  
  const changeLanguage = (newLanguage) => {
    const selectedLanguage = languageService.setCurrentLanguage(newLanguage);
    setLanguage(selectedLanguage);
  };
  
  // Helper function to translate text
  const t = (key) => {
    return languageService.translate(key);
  };
  
  useEffect(() => {
    // Set document title when language changes
    document.title = t('coupon_manager');
    
    // You could update document lang attribute if needed
    document.documentElement.lang = language;
  }, [language]);
  
  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
}; 