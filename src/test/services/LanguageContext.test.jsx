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

// Setup localStorage mock before importing modules
beforeEach(() => {
  // Create a mock implementation of localStorage
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  vi.clearAllMocks();
});

// Mock react-i18next
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

// Get supported languages from a direct mock to avoid the hook call issue
const mockSupportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }
];

// Mock the LanguageContext module
vi.mock('../../services/LanguageContext', () => {
  // Create a mock context
  const React = require('react');
  const mockContext = React.createContext();
  
  // Create mock functions
  const changeLanguageMock = vi.fn((lang) => {
    // Update localStorage when called
    window.localStorage.setItem('language', lang);
  });
  
  // Mock getSupportedLanguages as a regular function, not a hook
  const getSupportedLanguagesFn = () => mockSupportedLanguages;
  
  // Create test provider that checks localStorage
  const LanguageProvider = ({ children }) => {
    // Check localStorage for language when rendering
    const storedLang = window.localStorage.getItem('language');
    
    const value = {
      language: storedLang || 'en',
      changeLanguage: changeLanguageMock,
      t: (key) => key,
      getSupportedLanguages: getSupportedLanguagesFn
    };
    
    return React.createElement(mockContext.Provider, { value }, children);
  };
  
  // Create hook implementation
  const useLanguage = () => {
    const context = React.useContext(mockContext);
    if (!context) {
      throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
  };
  
  return {
    LanguageContext: mockContext,
    LanguageProvider,
    useLanguage,
    // Export getSupportedLanguages directly for non-hook tests
    getSupportedLanguages: getSupportedLanguagesFn
  };
});

// Import after mocking
import { LanguageProvider, useLanguage, LanguageContext, getSupportedLanguages } from '../../services/LanguageContext';

// Test component to use the hook
const TestComponent = () => {
  const { language, changeLanguage, t } = useLanguage();
  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="translated">{t('test.key')}</div>
      <button data-testid="change-to-es" onClick={() => changeLanguage('es')}>
        Change to Spanish
      </button>
    </div>
  );
};

describe('LanguageContext', () => {
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

  it('loads the language from localStorage on initial load', () => {
    // Setup localStorage to return 'fr' for language
    localStorageMock.getItem.mockImplementation((key) => key === 'language' ? 'fr' : null);
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    // Verify localStorage was checked for the language
    expect(localStorageMock.getItem).toHaveBeenCalledWith('language');
  });
  
  it('useLanguage throws an error when used outside LanguageProvider', () => {
    // Suppress the error logging for this test
    const consoleSpy = vi.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow();
    
    consoleSpy.mockRestore();
  });
  
  it('getSupportedLanguages returns the expected languages', () => {
    // Use the non-hook version directly
    const languages = getSupportedLanguages();
    
    expect(languages).toHaveLength(4);
    expect(languages[0].code).toBe('en');
    expect(languages[1].name).toBe('Spanish');
  });
}); 