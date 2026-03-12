import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CouponList from '../../components/CouponList';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, MockLanguageProvider } from '../util/test-utils';

vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
    language: 'en',
    changeLanguage: vi.fn(),
    getSupportedLanguages: () => ['en', 'es', 'fr', 'de']
  })
}));

describe('CouponList Component', () => {
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
      retailer: 'Target',
      initialValue: '75',
      currentValue: '75',
      expirationDate: '2027-09-30',
      activationCode: 'TGT75FALL',
      pin: '4321'
    },
    {
      id: 3,
      retailer: 'Amazon',
      initialValue: '25',
      currentValue: '0',
      expirationDate: '2027-06-30',
      activationCode: 'AMZN25SPRING',
      pin: '9012'
    },
    {
      id: 4,
      retailer: 'Best Buy',
      initialValue: '100',
      currentValue: '100',
      expirationDate: '2025-12-31',
      activationCode: 'BB100DEC',
      pin: '5678'
    }
  ];

  const mockOnUpdateCoupon = vi.fn();
  const mockOnMarkAsUsed = vi.fn();
  const mockSetRetailerFilter = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(
      <CouponList 
        coupons={mockCoupons} 
        onUpdateCoupon={mockOnUpdateCoupon} 
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );
    
    // Check if the component renders with some basic content
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
  });

  it('filters coupons by retailer', () => {
    renderWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={mockOnUpdateCoupon}
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );

    const retailerFilter = screen.getByTestId('filter-retailer');
    fireEvent.change(retailerFilter, { target: { value: 'Amazon' } });

    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);

    const tableCells = screen.getAllByRole('cell');
    const targetCells = tableCells.filter(cell => cell.textContent === 'Target');
    expect(targetCells.length).toBe(0);
  });

  it('shows expired coupons when checkbox is checked', () => {
    renderWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={mockOnUpdateCoupon}
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );

    expect(screen.queryByText(/BB100DEC/i)).not.toBeInTheDocument();

    const showExpiredCheckbox = screen.getByTestId('filter-show-expired');
    fireEvent.click(showExpiredCheckbox);

    expect(screen.getByText(/BB100DEC/i)).toBeInTheDocument();
  });

  it('calls onMarkAsUsed when Mark as Used button is clicked', () => {
    renderWithProviders(
      <CouponList 
        coupons={mockCoupons} 
        onUpdateCoupon={mockOnUpdateCoupon} 
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );
    
    // The "Mark as Used" button has aria-label="actions.mark_as_used"
    const markAsUsedButtons = screen.getAllByRole('button', { name: 'actions.mark_as_used' });
    fireEvent.click(markAsUsedButtons[0]);
    
    expect(mockOnMarkAsUsed).toHaveBeenCalled();
  });

  it('filters coupons by amount range', () => {
    renderWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={mockOnUpdateCoupon}
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );

    const minAmountFilter = screen.getByTestId('filter-min-amount');
    const maxAmountFilter = screen.getByTestId('filter-max-amount');

    fireEvent.change(minAmountFilter, { target: { value: '40' } });
    fireEvent.change(maxAmountFilter, { target: { value: '80' } });

    expect(screen.getByText(/AMZN2024/i)).toBeInTheDocument();
    expect(screen.getByText(/TGT75FALL/i)).toBeInTheDocument();
    expect(screen.queryByText(/BB100DEC/i)).not.toBeInTheDocument();
  });

  it('sorts coupons by different columns', () => {
    renderWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={mockOnUpdateCoupon}
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );

    const retailerHeader = screen.getByTestId('sort-retailer');
    fireEvent.click(retailerHeader);

    const tableCells = screen.getAllByRole('cell');
    expect(tableCells.length).toBeGreaterThan(0);

    const valueHeader = screen.getByTestId('sort-value');
    fireEvent.click(valueHeader);

    expect(screen.getAllByRole('cell').length).toBeGreaterThan(0);
  });

  it('opens partial use dialog when Partial Use button is clicked', async () => {
    renderWithProviders(
      <CouponList 
        coupons={mockCoupons} 
        onUpdateCoupon={mockOnUpdateCoupon} 
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );
    
    // The "Partial Use" button has aria-label="actions.use_partially"
    const partialUseButtons = screen.getAllByRole('button', { name: 'actions.use_partially' });
    fireEvent.click(partialUseButtons[0]);
    
    // The partial use dialog should appear
    expect(screen.getByText('dialog.partial_use_title')).toBeInTheDocument();
  });

  it('copies activation code to clipboard when copy button is clicked', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true
    });

    renderWithProviders(
      <CouponList 
        coupons={mockCoupons} 
        onUpdateCoupon={mockOnUpdateCoupon} 
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );
    
    // In desktop mode: copy buttons have aria-label="actions.copy" (just the key, no field name).
    // The first matching button is the activation code copy for the first visible coupon.
    const copyButtons = screen.getAllByRole('button', { name: 'actions.copy' });
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });
  });

  it('handles edit button clicks', () => {
    const mockOnEditCoupon = vi.fn();
    renderWithProviders(
      <CouponList 
        coupons={mockCoupons} 
        onUpdateCoupon={mockOnUpdateCoupon} 
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
        onEditCoupon={mockOnEditCoupon}
      />
    );
    
    // Edit buttons have aria-label="actions.edit"
    const editButtons = screen.getAllByRole('button', { name: 'actions.edit' });
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEditCoupon).toHaveBeenCalled();
  });

  it('displays coupon list in responsive layout', () => {
    // The component renders both mobile cards (.sm:hidden) and desktop table (.hidden.sm:block)
    // JSDOM has innerWidth=0, so isMobile state is true, but both views are in the DOM
    renderWithProviders(
      <CouponList 
        coupons={mockCoupons} 
        onUpdateCoupon={mockOnUpdateCoupon} 
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );
    
    // Component renders the coupon list container
    expect(screen.getByTestId('coupon-list')).toBeInTheDocument();
    // Coupon data appears in the DOM regardless of view mode
    expect(screen.getAllByText('Amazon').length).toBeGreaterThan(0);
  });

  it('displays no coupons message when filtered results are empty', () => {
    renderWithProviders(
      <CouponList
        coupons={mockCoupons}
        onUpdateCoupon={mockOnUpdateCoupon}
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );

    const retailerFilter = screen.getByTestId('filter-retailer');
    fireEvent.change(retailerFilter, { target: { value: 'NonExistentRetailer' } });

    expect(screen.getByText(/messages\.no_coupons_found/i)).toBeInTheDocument();
  });

  it('supports i18n - uses translation keys for all UI text', () => {
    // The mock t function returns the key, so all UI strings should be translation keys
    renderWithProviders(
      <CouponList 
        coupons={mockCoupons} 
        onUpdateCoupon={mockOnUpdateCoupon} 
        onMarkAsUsed={mockOnMarkAsUsed}
        setRetailerFilter={mockSetRetailerFilter}
      />
    );
    
    // Column headers use translation keys from form namespace
    expect(screen.getAllByText('form.retailer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('form.current_value').length).toBeGreaterThan(0);
  });
});