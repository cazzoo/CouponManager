import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fireEvent } from '@testing-library/react';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key) => key === 'language' ? 'en' : null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 1,
  key: vi.fn(),
};

// Mock react-i18next without mocking the entire LanguageContext
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn((lang) => {
        return Promise.resolve();
      }),
    },
  }),
  initReactI18next: { 
    type: '3rdParty', 
    init: vi.fn()
  }
}));

// Setup localStorage mock
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  vi.clearAllMocks();
});

// Import the real module
import { LanguageProvider, useLanguage } from '../../services/LanguageContext';

// Test component using real hooks
const TestComponent = () => {
  const { language, changeLanguage, t, getSupportedLanguages } = useLanguage();
  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="translated">{t('test.key')}</div>
      <div data-testid="languages-count">{getSupportedLanguages().length}</div>
      <button data-testid="change-to-es" onClick={() => changeLanguage('es')}>
        Change to Spanish
      </button>
    </div>
  );
};

describe('LanguageContext Real Implementation', () => {
  it('provides the current language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId('language').textContent).toBe('en');
  });

  it('translates text using the t function', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId('translated').textContent).toBe('test.key');
  });

  it('changes the language when changeLanguage is called', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const button = screen.getByTestId('change-to-es');
    fireEvent.click(button);
    
    // Verify localStorage was called to save the new language
    expect(window.localStorage.setItem).toHaveBeenCalledWith('language', 'es');
  });

  it('returns supported languages via getSupportedLanguages', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    // There should be 4 languages based on the i18n configuration
    expect(screen.getByTestId('languages-count').textContent).toBe('4');
  });
}); 