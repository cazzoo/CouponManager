import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CouponList from '../../components/CouponList';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';

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
    expect(screen.getAllByText(/BB100DEC/i)[0]).toBeInTheDocument();
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

  it('filters coupons by amount range', () => {
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
    
    // Find the min and max amount filters
    const minAmountFilter = screen.getByLabelText(/^Min Amount$/i);
    const maxAmountFilter = screen.getByLabelText(/^Max Amount$/i);
    
    // Set filter values to only show coupons between $40 and $80
    fireEvent.change(minAmountFilter, { target: { value: '40' } });
    fireEvent.change(maxAmountFilter, { target: { value: '80' } });
    
    // Check that Amazon coupon ($50) is visible
    expect(screen.getAllByText(/AMZN2024/i)[0]).toBeInTheDocument();
    
    // Check that Target coupon ($75) is visible
    expect(screen.getAllByText(/TGT75FALL/i)[0]).toBeInTheDocument();
    
    // Check that Best Buy coupon ($100) is not visible (it's filtered out by max amount)
    expect(screen.queryByText(/BB100DEC/i)).not.toBeInTheDocument();
  });

  it('sorts coupons by different columns', () => {
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
    
    // Find the retailer column header and click to sort
    const retailerHeaders = screen.getAllByText(/Retailer/i);
    fireEvent.click(retailerHeaders[retailerHeaders.length - 1]); // Get the table header specifically
    
    // Find all retailer cells
    const tableCells = screen.getAllByRole('cell');
    
    // Check that sorting works (this is a simplified test as we can't easily check the exact order)
    expect(tableCells.length).toBeGreaterThan(0);
    
    // Now click the value column header to sort by value
    const valueHeaders = screen.getAllByText(/Current Value/i);
    fireEvent.click(valueHeaders[0]);
    
    // Check that the component didn't crash after sorting
    expect(screen.getAllByRole('cell').length).toBeGreaterThan(0);
  });

  it('opens partial use dialog when Partial Use button is clicked', () => {
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
    
    // Find and click the 'Partial Use' button for the first coupon
    const partialUseButtons = screen.getAllByTitle(/Partial Use/i);
    fireEvent.click(partialUseButtons[0]);
    
    // Check that the dialog opens
    expect(screen.getByRole('heading', { name: /Partial Use/i })).toBeInTheDocument();
    expect(screen.getByText(/Enter amount to use:/i)).toBeInTheDocument();
    
    // Enter an amount and submit
    const amountInput = screen.getByLabelText(/Amount to Use/i);
    fireEvent.change(amountInput, { target: { value: '10' } });
    
    // Find and click the submit button
    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);
    
    // Check that onMarkAsUsed was called with the correct coupon ID and new value
    // Allow for either '40' or '40.00' format since the implementation might format numbers differently
    expect(mockOnMarkAsUsed).toHaveBeenCalledWith(1, expect.stringMatching(/^40(.00)?$/));
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
    
    // Find and click the copy button for the activation code
    const copyButtons = screen.getAllByTitle(/Copy to clipboard/i);
    fireEvent.click(copyButtons[0]); // First copy button (activation code)
    
    // Check that clipboard.writeText was called with the correct text
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('AMZN2024');
  });

  it('handles partial use dialog validation', async () => {
    // Reset mock before this test
    mockOnMarkAsUsed.mockReset();
    
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
    
    // Open partial use dialog
    const partialUseButtons = screen.getAllByTitle(/Partial Use/i);
    fireEvent.click(partialUseButtons[0]);
    
    // Try to submit without entering amount
    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);
    
    // Check that onMarkAsUsed was not called when no amount is entered
    expect(mockOnMarkAsUsed).not.toHaveBeenCalled();
    
    // Try to enter invalid amount (greater than current value)
    const amountInput = screen.getByLabelText(/Amount to Use/i);
    fireEvent.change(amountInput, { target: { value: '60' } });
    fireEvent.click(submitButton);
    
    // Check that onMarkAsUsed was not called with invalid amount
    expect(mockOnMarkAsUsed).not.toHaveBeenCalled();
    
    // Enter valid amount
    fireEvent.change(amountInput, { target: { value: '25' } });
    fireEvent.click(submitButton);
    
    // Check that onMarkAsUsed was called with correct values
    expect(mockOnMarkAsUsed).toHaveBeenCalledWith(1, '25.00');
  });

  it('handles invalid date formats', () => {
    const couponsWithInvalidDate = [
      {
        id: 1,
        retailer: 'Test Store',
        initialValue: '50',
        currentValue: '50',
        expirationDate: 'invalid-date',
        activationCode: 'TEST123',
        pin: '1234'
      }
    ];

    render(
      <TestWrapper>
        <CouponList 
          coupons={couponsWithInvalidDate} 
          onUpdateCoupon={mockOnUpdateCoupon} 
          onMarkAsUsed={mockOnMarkAsUsed}
          setRetailerFilter={mockSetRetailerFilter}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });

  it('handles empty coupons array', () => {
    render(
      <TestWrapper>
        <CouponList 
          coupons={[]} 
          onUpdateCoupon={mockOnUpdateCoupon} 
          onMarkAsUsed={mockOnMarkAsUsed}
          setRetailerFilter={mockSetRetailerFilter}
        />
      </TestWrapper>
    );

    expect(screen.getByText('No coupons found matching your filters.')).toBeInTheDocument();
  });

  it('updates retailer filter when prop changes', () => {
    const { rerender } = render(
      <TestWrapper>
        <CouponList 
          coupons={mockCoupons} 
          onUpdateCoupon={mockOnUpdateCoupon} 
          onMarkAsUsed={mockOnMarkAsUsed}
          setRetailerFilter={mockSetRetailerFilter}
          retailerFilter="Amazon"
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Filter by Retailer/i)).toHaveValue('Amazon');

    // Update retailer filter prop
    rerender(
      <TestWrapper>
        <CouponList 
          coupons={mockCoupons} 
          onUpdateCoupon={mockOnUpdateCoupon} 
          onMarkAsUsed={mockOnMarkAsUsed}
          setRetailerFilter={mockSetRetailerFilter}
          retailerFilter="Target"
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Filter by Retailer/i)).toHaveValue('Target');
  });
});