import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { languageService, getSupportedLanguages } from '../../services/LanguageService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Language Service', () => {
  beforeEach(() => {
    // Clear all mock calls and reset language to English
    vi.clearAllMocks();
    languageService.setCurrentLanguage('en');
  });

  afterEach(() => {
    // Reset mocks after each test
    vi.resetAllMocks();
  });

  it('provides supported languages', () => {
    const languages = getSupportedLanguages();
    // Check that the return type is an array of objects with code and name
    expect(languages).toEqual([
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' }
    ]);
  });

  it('translates based on the current language', () => {
    languageService.setCurrentLanguage('es');
    expect(languageService.translate('add_coupon')).toBe('Añadir Cupón');
  });

  it('handles missing translations by returning the key', () => {
    expect(languageService.translate('non_existent_key')).toBe('non_existent_key');
  });

  it('gets the current language', () => {
    // Default language should be 'en'
    expect(languageService.getCurrentLanguage()).toBe('en');
  });

  it('sets the current language', () => {
    languageService.setCurrentLanguage('fr');
    expect(languageService.getCurrentLanguage()).toBe('fr');
  });

  it('falls back to English when unsupported language is set', () => {
    // German is actually supported in the code (de), so we need to use a truly unsupported language
    languageService.setCurrentLanguage('it'); // Italian is not supported
    expect(languageService.getCurrentLanguage()).toBe('en');
  });

  it('language service uses localStorage for persistence', () => {
    // Mock localStorage to return 'en' for 'language' key
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'language') return 'en';
      return null;
    });

    // Create a new instance which should read from localStorage
    const tempService = new languageService.constructor();
    
    // Verify localStorage.getItem was called with 'language'
    expect(localStorageMock.getItem).toHaveBeenCalledWith('language');

    // Set a new language
    tempService.setCurrentLanguage('fr');
    
    // Verify localStorage.setItem was called with 'language' and 'fr'
    expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'fr');
  });
}); 