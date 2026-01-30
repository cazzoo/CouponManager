import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import App from '../../App';
import { renderWithProviders, mockTranslate, MockLanguageProvider, MockUseAuth } from '../util/test-utils';

// Mock the CouponService to avoid real API calls
vi.mock('../../services/CouponService', () => ({
  couponService: {
    getAllCoupons: () => [],
  }
}));

// Mock the useLanguage hook to use our improved mock implementation
vi.mock('../../services/LanguageContext', () => {
  return {
    useLanguage: () => {
      const [language, setLanguage] = React.useState('en');
      return {
        language,
        changeLanguage: (newLang) => {
          setLanguage(newLang);
        },
        t: (key) => mockTranslate(key, language),
        getSupportedLanguages: () => [
          { code: 'en', name: 'English' },
          { code: 'es', name: 'Spanish' },
          { code: 'fr', name: 'French' },
          { code: 'de', name: 'German' }
        ]
      };
    },
    LanguageProvider: ({ children }) => <>{children}</>
  };
});

// Mock the AuthContext
vi.mock('../../services/AuthContext', () => {
  return {
    useAuth: () => MockUseAuth(),
    AuthProvider: ({ children }) => <>{children}</>
  };
});

describe('App with Language Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renders language selector in the app bar', () => {
    renderWithProviders(<App />);

    // Find the language selector by its ID or role
    const languageSelector = screen.getByLabelText(/language/i);
    expect(languageSelector).toBeTruthy();
  });

  it('changes language when selector is used', () => {
    renderWithProviders(<App />);

    // Find language selector
    const languageSelect = screen.getByLabelText('Language');

    // Change language to Spanish using change event (for native select)
    fireEvent.change(languageSelect, { target: { value: 'es' } });

    // Verify language changed by checking the select value changed
    expect(languageSelect).toHaveValue('es');
  });

  it('preserves language selection on component re-renders', () => {
    const { rerender } = renderWithProviders(<App />);

    // Find language selector
    const languageSelect = screen.getByLabelText('Language');

    // Change language to Spanish using change event (for native select)
    fireEvent.change(languageSelect, { target: { value: 'es' } });

    // Re-render the component
    rerender(<App />);

    // Verify language is still Spanish by checking the select value
    expect(languageSelect).toHaveValue('es');
  });
}); 