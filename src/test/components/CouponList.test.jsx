import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CouponList from '../../components/CouponList';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock theme for testing
const theme = createTheme();

// Wrapper component to provide theme context
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('CouponList Component', () => {
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

  it('renders without crashing', () => {
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
    
    // Check if the component renders with some basic content
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Target/i).length).toBeGreaterThan(0);
  });

  it('filters coupons by retailer', () => {
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
    
    // Find the retailer filter input
    const retailerFilter = screen.getByLabelText(/Retailer/i);
    
    // Type 'Amazon' into the filter
    fireEvent.change(retailerFilter, { target: { value: 'Amazon' } });
    
    // Check that Amazon coupons are visible and Target is not in the table
    expect(screen.getAllByText(/Amazon/i).length).toBeGreaterThan(0);
    
    // Find all table cells and check that none contain 'Target'
    const tableCells = screen.getAllByRole('cell');
    const targetCells = tableCells.filter(cell => cell.textContent === 'Target');
    expect(targetCells.length).toBe(0);
  });

  it('shows expired coupons when checkbox is checked', () => {
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
    
    // Initially, expired coupons should not be visible
    expect(screen.queryByText(/BB100DEC/i)).not.toBeInTheDocument();
    
    // Find and click the 'Show Expired' checkbox
    const showExpiredCheckbox = screen.getByLabelText(/Show Expired/i);
    fireEvent.click(showExpiredCheckbox);
    
    // Now the expired coupon should be visible
    expect(screen.getByText(/BB100DEC/i)).toBeInTheDocument();
  });

  it('calls onMarkAsUsed when Mark as Used button is clicked', () => {
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
    
    // Find and click the 'Mark as Used' button for the first coupon
    const markAsUsedButtons = screen.getAllByTitle(/Mark as Used/i);
    fireEvent.click(markAsUsedButtons[0]);
    
    // Check that onMarkAsUsed was called with the correct coupon ID
    expect(mockOnMarkAsUsed).toHaveBeenCalledWith(1);
  });
});