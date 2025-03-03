import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import App from '../../App';
import { renderWithProviders, mockTranslate, MockLanguageProvider } from '../util/test-utils';

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
        t: (key) => mockTranslate(key, language)
      };
    },
    LanguageProvider: ({ children }) => <>{children}</>
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
    const languageSelector = screen.getByLabelText(/Language/i);
    expect(languageSelector).toBeTruthy();
  });

  it('changes language when selector is used', () => {
    renderWithProviders(<App />);
    
    // Open language selector
    const languageSelect = screen.getByLabelText('Language');
    fireEvent.mouseDown(languageSelect);
    
    // Select Spanish
    const spanishOption = screen.getByRole('option', { name: 'Spanish' });
    fireEvent.click(spanishOption);
    
    // Verify language changed - check that the language label is now in Spanish
    expect(screen.getAllByText('Idioma')[0]).toBeInTheDocument();
  });

  it('preserves language selection on component re-renders', () => {
    const { rerender } = renderWithProviders(<App />);
    
    // Open language selector
    const languageSelect = screen.getByLabelText('Language');
    fireEvent.mouseDown(languageSelect);
    
    // Select Spanish
    const spanishOption = screen.getByRole('option', { name: 'Spanish' });
    fireEvent.click(spanishOption);
    
    // Re-render the component
    rerender(<App />);
    
    // Verify language is still Spanish - check that the language label is now in Spanish
    expect(screen.getAllByText('Idioma')[0]).toBeInTheDocument();
  });
}); 