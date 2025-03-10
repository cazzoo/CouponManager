import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all language files
import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import frCommon from './locales/fr/common.json';
import deCommon from './locales/de/common.json';

// Language resources
const resources = {
  en: {
    common: enCommon
  },
  es: {
    common: esCommon
  },
  fr: {
    common: frCommon
  },
  de: {
    common: deCommon
  }
};

// Supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }
];

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    // Key format options
    keySeparator: '.',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Caching
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    
    // Debug mode - disable in production
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n; 