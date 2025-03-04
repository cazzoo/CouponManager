import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CouponList from '../../components/CouponList';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the useLanguage hook to avoid "useLanguage must be used within a LanguageProvider" error
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
    language: 'en',
    changeLanguage: vi.fn(),
    getSupportedLanguages: () => ['en', 'es', 'fr', 'de']
  })
}));

// Mock theme for testing with mobile breakpoint
const theme = createTheme();

// Mock the theme and useMediaQuery to simulate mobile view
vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMediaQuery: () => true, // Always return true to simulate mobile view
    useTheme: () => ({
      ...actual.createTheme(),
      breakpoints: {
        down: () => true,
        up: () => false
      }
    })
  };
});

// Wrapper component to provide theme context
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('CouponList Component (Mobile View)', () => {
  const mockCoupons = [
    {
      id: 1,
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '50',
      expirationDate: new Date('2025-12-31'),
      activationCode: 'AMZN2024',
      pin: '1234'
    },
    {
      id: 2,
      retailer: 'Target',
      initialValue: '75',
      currentValue: '75',
      expirationDate: new Date('2025-09-30'),
      activationCode: 'TGT75FALL',
      pin: '4321'
    },
    {
      id: 3,
      retailer: 'Amazon',
      initialValue: '25',
      currentValue: '0', // Used coupon
      expirationDate: new Date('2025-06-30'),
      activationCode: 'AMZN25SPRING',
      pin: '9012'
    },
    {
      id: 4,
      retailer: 'Best Buy',
      initialValue: '100',
      currentValue: '100',
      expirationDate: new Date('2023-12-31'), // Expired coupon
      activationCode: 'BB100DEC',
      pin: '5678'
    }
  ];

  const mockOnUpdateCoupon = vi.fn();
  const mockOnMarkAsUsed = vi.fn();
  const mockSetRetailerFilter = vi.fn();

  it('renders coupon information', () => {
    render(
      <TestWrapper>
        <CouponList 
          coupons={mockCoupons} 
          onUpdateCoupon={mockOnUpdateCoupon} 
          onMarkAsUsed={mockOnMarkAsUsed}
          setRetailerFilter={mockSetRetailerFilter}
        />
      </TestWrapper>
    );
    
    // Check that coupon information is displayed
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$50/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$75/i).length).toBeGreaterThan(0);
  });

  it('shows expired and used status chips in mobile view', () => {
    render(
      <TestWrapper>
        <CouponList
          coupons={mockCoupons}
          onUpdateCoupon={mockOnUpdateCoupon}
          setRetailerFilter={mockSetRetailerFilter}
        />
      </TestWrapper>
    );
    
    // Check for status chips - need to make sure the expired coupon is shown
    // Instead of looking for the label, find the checkbox by its role and name
    const showExpiredCheckbox = screen.getByRole('checkbox', { name: 'status.expired' });
    fireEvent.click(showExpiredCheckbox);
    
    // Check that expired chips are displayed
    const expiredChips = screen.getAllByText('status.expired');
    expect(expiredChips.length).toBeGreaterThan(0);
    
    // Check that used chips are displayed
    const usedChips = screen.getAllByText('status.used');
    expect(usedChips.length).toBeGreaterThan(0);
  });

  it('clears all filters when Clear Filters button is clicked', async () => {
    render(
      <TestWrapper>
        <CouponList
          coupons={mockCoupons}
          onUpdateCoupon={mockOnUpdateCoupon}
          onMarkAsUsed={mockOnMarkAsUsed}
          setRetailerFilter={mockSetRetailerFilter}
        />
      </TestWrapper>
    );
    
    // Set some filters
    // Instead of looking for labels, find inputs by their role and name
    const retailerFilter = screen.getByRole('combobox', { name: 'filter.filter_by_retailer' });
    fireEvent.change(retailerFilter, { target: { value: 'Amazon' } });
    
    const minAmountFilter = screen.getByRole('spinbutton', { name: 'filter.min_amount' });
    fireEvent.change(minAmountFilter, { target: { value: '40' } });
    
    const maxAmountFilter = screen.getByRole('spinbutton', { name: 'filter.max_amount' });
    fireEvent.change(maxAmountFilter, { target: { value: '80' } });
    
    const showExpiredCheckbox = screen.getByRole('checkbox', { name: 'status.expired' });
    fireEvent.click(showExpiredCheckbox);
    
    // Click clear filters button
    const clearFiltersButton = screen.getByText('filter.clear_filters');
    fireEvent.click(clearFiltersButton);
    
    // Wait for the retailer filter to be cleared
    expect(mockSetRetailerFilter).toHaveBeenCalledWith('');
    
    // Verify that the filter inputs are reset
    expect(retailerFilter.value).toBe('');
    expect(minAmountFilter.value).toBe('');
    expect(maxAmountFilter.value).toBe('');
    expect(showExpiredCheckbox.checked).toBe(false);
  });

  it('displays no coupons message when filters match no coupons', () => {
    render(
      <TestWrapper>
        <CouponList
          coupons={mockCoupons}
          onUpdateCoupon={mockOnUpdateCoupon}
          setRetailerFilter={mockSetRetailerFilter}
        />
      </TestWrapper>
    );
    
    // Set filters that won't match any coupons
    const retailerFilter = screen.getByRole('combobox', { name: 'filter.filter_by_retailer' });
    fireEvent.change(retailerFilter, { target: { value: 'NonExistentRetailer' } });
    
    // Check that the no coupons message is displayed
    const noCouponsMessage = screen.getByText('messages.no_coupons_found');
    expect(noCouponsMessage).toBeInTheDocument();
  });

  it('handles edit button click in mobile view', () => {
    render(
      <TestWrapper>
        <CouponList
          coupons={mockCoupons}
          onUpdateCoupon={mockOnUpdateCoupon}
          setRetailerFilter={mockSetRetailerFilter}
        />
      </TestWrapper>
    );
    
    // Find and click the Edit button by its role instead of text
    // Look for buttons with the edit icon
    const editButtons = screen.getAllByRole('button');
    // Find the edit button (this is a simplification, in a real test you might need a more specific selector)
    const editButton = editButtons.find(button => button.innerHTML.includes('Edit') || button.innerHTML.includes('edit'));
    fireEvent.click(editButton);
    
    // Check that onUpdateCoupon was called with the correct coupon
    expect(mockOnUpdateCoupon).toHaveBeenCalledWith(mockCoupons[0]);
  });

  it('copies activation code to clipboard when copy button is clicked', () => {
    // Mock clipboard API
    const mockClipboard = {
      writeText: vi.fn().mockImplementation(() => Promise.resolve())
    };
    Object.assign(navigator, { clipboard: mockClipboard });
    
    render(
      <TestWrapper>
        <CouponList 
          coupons={mockCoupons} 
          onUpdateCoupon={mockOnUpdateCoupon} 
          onMarkAsUsed={mockOnMarkAsUsed}
          setRetailerFilter={mockSetRetailerFilter}
        />
      </TestWrapper>
    );
    
    // Find the activation code text
    const activationCodeText = screen.getByText('AMZN2024');
    
    // Find the copy button by its icon
    const copyIcons = screen.getAllByTestId('ContentCopyIcon');
    // Click the first copy icon (should be for activation code)
    fireEvent.click(copyIcons[0]);
    
    // Check that clipboard.writeText was called with the correct activation code
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('AMZN2024');
  });
});