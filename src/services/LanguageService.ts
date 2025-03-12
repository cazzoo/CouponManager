import { Language } from '../types';

// List of supported languages
const supportedLanguages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }
];

// Default language
const DEFAULT_LANGUAGE = 'en';

// Get all supported languages
export const getSupportedLanguages = (): Language[] => supportedLanguages;

/**
 * Language service interface
 */
export interface ILanguageService {
  getCurrentLanguage(): string;
  setCurrentLanguage(language: string): string;
  translate(key: string): string;
}

// Language service singleton - deprecated, use i18n instead
// This is kept for backward compatibility only
class LanguageService implements ILanguageService {
  private currentLanguage: string;
  
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || DEFAULT_LANGUAGE;
    console.warn('LanguageService is deprecated, please use i18n instead');
  }
  
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  setCurrentLanguage(language: string): string {
    if (supportedLanguages.some(lang => lang.code === language)) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
    }
    return this.currentLanguage;
  }
  
  translate(key: string): string {
    console.warn(`LanguageService.translate('${key}') is deprecated, please use i18n.t('${key}') instead`);
    return key;
  }
}

export const languageService = new LanguageService(); 