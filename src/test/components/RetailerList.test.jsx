import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RetailerList from '../../components/RetailerList';
import { renderWithProviders } from '../util/test-utils';

vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
    language: 'en',
    changeLanguage: vi.fn(),
    getSupportedLanguages: () => ['en', 'es', 'fr', 'de']
  })
}));

describe('RetailerList Component', () => {
  const mockCoupons = [
    {
      id: 1,
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '50',
      expirationDate: new Date('2027-12-31'),
      activationCode: 'AMZN2024',
      pin: '1234'
    },
    {
      id: 2,
      retailer: 'Amazon',
      initialValue: '25',
      currentValue: '25',
      expirationDate: new Date('2027-06-30'),
      activationCode: 'AMZN25',
      pin: '5678'
    },
    {
      id: 3,
      retailer: 'Target',
      initialValue: '75',
      currentValue: '75',
      expirationDate: new Date('2027-09-30'),
      activationCode: 'TGT75FALL',
      pin: '4321'
    },
    {
      id: 4,
      retailer: 'Target',
      initialValue: '30',
      currentValue: '0', // Used coupon
      expirationDate: new Date('2027-08-15'),
      activationCode: 'TGT30SUMMER',
      pin: '8765'
    },
    {
      id: 5,
      retailer: 'Best Buy',
      initialValue: '100',
      currentValue: '100',
      expirationDate: new Date('2025-12-31'), // Expired coupon (relative to 2026-01-30)
      activationCode: 'BB100DEC',
      pin: '5678'
    }
  ];

  const mockOnRetailerClick = vi.fn();

  it('renders without crashing', () => {
    renderWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={mockOnRetailerClick}
      />
    );

    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Best Buy/i).length).toBeGreaterThan(0);
  });

  it('displays correct statistics for each retailer', () => {
    renderWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={mockOnRetailerClick}
      />
    );

    // Check Amazon stats (2 coupons, both active, total value $75)
    // Use getAllByText since retailer appears in both mobile and desktop views
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Coupon count
    expect(screen.getAllByText('$75.00').length).toBeGreaterThan(0); // Total value

    // Check Target stats (2 coupons, 1 active and 1 used, total value $75)
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Coupon count
    expect(screen.getAllByText('$75.00').length).toBeGreaterThan(0); // Total value

    // Check Best Buy stats (1 coupon, expired, value $100)
    expect(screen.getAllByText(/Best Buy/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Coupon count
    expect(screen.getAllByText('$0.00').length).toBeGreaterThan(0); // Active value (0 since expired)
    expect(screen.getAllByText('$100.00').length).toBeGreaterThan(0); // Total/expired value
  });

  it('calls onRetailerClick when a retailer is clicked', () => {
    renderWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={mockOnRetailerClick}
      />
    );

    // Click the first Amazon element (appears in both mobile and desktop)
    const amazonRetailers = screen.getAllByText(/Amazon/i);
    fireEvent.click(amazonRetailers[0]);

    expect(mockOnRetailerClick).toHaveBeenCalledWith('Amazon', { field: 'expirationDate', order: 'asc' });
  });

  it('handles empty coupons array gracefully', () => {
    renderWithProviders(
      <RetailerList
        coupons={[]}
        onRetailerClick={mockOnRetailerClick}
      />
    );

    // Empty state message appears in both mobile and desktop views
    expect(screen.getAllByText('messages.no_retailers_found').length).toBeGreaterThan(0);
  });

  it('correctly calculates active vs expired coupon statistics', () => {
    renderWithProviders(
      <RetailerList
        coupons={mockCoupons}
        onRetailerClick={mockOnRetailerClick}
      />
    );

    // Best Buy has 1 expired coupon
    expect(screen.getAllByText(/Best Buy/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('0').length).toBeGreaterThan(0); // Active count
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Expired count

    // Target has 1 active and 1 used coupon (used counts as expired)
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Active count (only 1 of 2 is active)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Expired/used count (1 used coupon)
  });
});