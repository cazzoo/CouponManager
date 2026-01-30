import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RetailerList from '../../components/RetailerList';
import { renderWithProviders } from '../util/test-utils';

// Mock the useLanguage hook to avoid "useLanguage must be used within a LanguageProvider" error
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
    language: 'en',
    changeLanguage: vi.fn(),
    getSupportedLanguages: () => ['en', 'es', 'fr', 'de']
  })
}));

// Simulate mobile viewport by default for these tests
beforeEach(() => {
  window.matchMedia.mockImplementation(query => ({
    matches: query.includes('max-width'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe('RetailerList Component (Mobile View)', () => {
  const mockCoupons = [
    {
      id: 1,
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '50',
      expirationDate: '2027-12-31',
      activationCode: 'AMZN2024',
      pin: '1234'
    },
    {
      id: 2,
      retailer: 'Amazon',
      initialValue: '25',
      currentValue: '25',
      expirationDate: '2027-06-30',
      activationCode: 'AMZN25',
      pin: '5678'
    },
    {
      id: 3,
      retailer: 'Target',
      initialValue: '75',
      currentValue: '75',
      expirationDate: '2027-09-30',
      activationCode: 'TGT75FALL',
      pin: '4321'
    },
    {
      id: 4,
      retailer: 'Target',
      initialValue: '30',
      currentValue: '0',
      expirationDate: '2027-08-15',
      activationCode: 'TGT30SUMMER',
      pin: '8765'
    },
    {
      id: 5,
      retailer: 'Best Buy',
      initialValue: '100',
      currentValue: '100',
      expirationDate: '2025-12-31',
      activationCode: 'BB100DEC',
      pin: '5678'
    }
  ];

  const mockOnRetailerClick = vi.fn();

  it('renders retailer information', () => {
    renderWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={mockOnRetailerClick}
      />
    );
    
    // Check that retailer information is displayed
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Best Buy/i).length).toBeGreaterThan(0);
  });

  it('displays correct statistics for retailers', () => {
    renderWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={mockOnRetailerClick}
      />
    );

    // Check that retailers are displayed with statistics
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Best Buy/i).length).toBeGreaterThan(0);

    // Check that coupon counts are displayed (number 2 appears multiple times)
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });

  it('calls onRetailerClick when a retailer is clicked', () => {
    renderWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={mockOnRetailerClick}
      />
    );

    // Find and click on the Amazon retailer card
    const amazonText = screen.getAllByText('Amazon')[0];
    const clickableDiv = amazonText.closest('.cursor-pointer');
    fireEvent.click(clickableDiv);

    // Check that onRetailerClick was called
    expect(mockOnRetailerClick).toHaveBeenCalled();
  });

  it('displays chips for active and expired counts', () => {
    renderWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={mockOnRetailerClick}
      />
    );
    
    // Check that chips are rendered for counts
    const activeChips = screen.getAllByText('2');
    expect(activeChips.length).toBeGreaterThan(0);
    
    const expiredChips = screen.getAllByText('1');
    expect(expiredChips.length).toBeGreaterThan(0);
  });

  it('handles empty coupons array gracefully in mobile view', () => {
    renderWithProviders(
      <RetailerList
        coupons={[]}
        onRetailerClick={mockOnRetailerClick}
      />
    );

    // Check that a message is displayed when there are no retailers (appears in both mobile and desktop views)
    expect(screen.getAllByText('messages.no_retailers_found').length).toBeGreaterThan(0);
  });
});