import { describe, it, expect, beforeEach, vi } from 'vitest';
import { languageService, getSupportedLanguages } from '../../services/LanguageService';

describe('LanguageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    languageService.setCurrentLanguage('en');
  });

  describe('getSupportedLanguages()', () => {
    it('should return all supported languages', () => {
      const languages = getSupportedLanguages();
      expect(languages).toHaveLength(4);
      expect(languages).toEqual([
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' }
      ]);
    });
  });

  describe('getCurrentLanguage()', () => {
    it('should return current language', () => {
      expect(languageService.getCurrentLanguage()).toBe('en');
    });

    it('should reflect language changes', () => {
      languageService.setCurrentLanguage('fr');
      expect(languageService.getCurrentLanguage()).toBe('fr');
      languageService.setCurrentLanguage('en');
    });
  });

  describe('setCurrentLanguage()', () => {
    it('should set a valid language', () => {
      const result = languageService.setCurrentLanguage('es');
      expect(result).toBe('es');
    });

    it('should keep current language for invalid language code', () => {
      languageService.setCurrentLanguage('de');
      const result = languageService.setCurrentLanguage('invalid');
      expect(result).toBe('de');
    });

    it('should not change language for empty string', () => {
      languageService.setCurrentLanguage('fr');
      const result = languageService.setCurrentLanguage('');
      expect(result).toBe('fr');
    });
  });

  describe('translate()', () => {
    it('should return the key as-is (deprecated method)', () => {
      const translation = languageService.translate('common.save');
      expect(translation).toBe('common.save');
    });
  });

  describe('Integration', () => {
    it('should maintain language state across operations', () => {
      languageService.setCurrentLanguage('en');
      expect(languageService.getCurrentLanguage()).toBe('en');
      
      languageService.setCurrentLanguage('de');
      expect(languageService.getCurrentLanguage()).toBe('de');
      
      languageService.setCurrentLanguage('es');
      expect(languageService.getCurrentLanguage()).toBe('es');
    });

    it('should handle language switching correctly', () => {
      languageService.setCurrentLanguage('fr');
      expect(languageService.getCurrentLanguage()).toBe('fr');
      
      languageService.setCurrentLanguage('en');
      expect(languageService.getCurrentLanguage()).toBe('en');
    });
  });
});
