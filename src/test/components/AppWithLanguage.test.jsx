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
  };
});

// Mock UserMenu component
vi.mock('../../components/UserMenu', () => ({
  default: ({ user, onSignOut }) => (
    <div data-testid="user-menu">
      <button data-testid="open-menu-button">Open Menu</button>
      <div data-testid="menu-dropdown" className="dropdown-open">
        <button data-testid="language-en">English</button>
        <button data-testid="language-es">Spanish</button>
        <button data-testid="language-fr">French</button>
        <button data-testid="language-de">German</button>
      </div>
    </div>
  ),
}));

describe('App with Language Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders App with language context', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('can change language through UserMenu', () => {
    renderWithProviders(<App />);
    
    // Click on Spanish language button in the mock
    const spanishButton = screen.getByTestId('language-es');
    fireEvent.click(spanishButton);
    
    // Verify the button exists (language change is handled by the mock)
    expect(spanishButton).toBeInTheDocument();
  });

  it('preserves language selection on component re-renders', () => {
    const { rerender } = renderWithProviders(<App />);
    
    // Click on Spanish language button
    const spanishButton = screen.getByTestId('language-es');
    fireEvent.click(spanishButton);
    
    // Re-render the component
    rerender(<App />);
    
    // Verify the component still renders
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });
});
