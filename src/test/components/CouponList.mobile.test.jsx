import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CouponList from '../../components/CouponList';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
          onMarkAsUsed={mockOnMarkAsUsed}
          setRetailerFilter={mockSetRetailerFilter}
          defaultSort={{ field: 'retailer', order: 'asc' }}
        />
      </TestWrapper>
    );
    
    // Check for status chips - need to make sure the expired coupon is shown
    const showExpiredCheckbox = screen.getByLabelText(/Show Expired/i);
    fireEvent.click(showExpiredCheckbox);
    
    // Now check for status chips
    const expiredChips = screen.getAllByText(/Expired/i);
    expect(expiredChips.length).toBeGreaterThan(0);
    
    const usedChips = screen.getAllByText(/Used/i);
    expect(usedChips.length).toBeGreaterThan(0);
  });

  it('clears all filters when Clear Filters button is clicked', () => {
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
    const retailerFilter = screen.getByLabelText(/Filter by Retailer/i);
    fireEvent.change(retailerFilter, { target: { value: 'Amazon' } });
    
    const minAmountFilter = screen.getByLabelText(/Min Amount/i);
    fireEvent.change(minAmountFilter, { target: { value: '40' } });
    
    const maxAmountFilter = screen.getByLabelText(/Max Amount/i);
    fireEvent.change(maxAmountFilter, { target: { value: '80' } });
    
    const showExpiredCheckbox = screen.getByLabelText(/Show Expired/i);
    fireEvent.click(showExpiredCheckbox);
    
    // Click clear filters button
    const clearFiltersButton = screen.getByText(/Clear Filters/i);
    fireEvent.click(clearFiltersButton);
    
    // Instead of checking input values directly, verify that the filter state is reset
    // by checking that all coupons are displayed again
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
    
    // Check the checkbox is unchecked
    expect(showExpiredCheckbox).not.toBeChecked();
  });

  it('displays no coupons message when filters match no coupons', () => {
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
    
    // Set filters that won't match any coupons
    const retailerFilter = screen.getByLabelText(/Filter by Retailer/i);
    fireEvent.change(retailerFilter, { target: { value: 'NonExistentRetailer' } });
    
    // Check for no coupons message
    expect(screen.getByText(/No coupons found matching your filters/i)).toBeInTheDocument();
  });

  it('handles edit button click in mobile view', () => {
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
    
    // Find and click the Edit button
    const editButton = screen.getAllByText('Edit')[0];
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