import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCouponForm from '../../components/AddCouponForm';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import userEvent from '@testing-library/user-event';

// Mock theme for testing
const theme = createTheme();

// Wrapper component to provide theme context and date picker context
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {children}
    </LocalizationProvider>
  </ThemeProvider>
);

describe('AddCouponForm Component', () => {
  const mockOnAddCoupon = vi.fn();
  const mockOnUpdateCoupon = vi.fn();
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
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
    }
  ];

  it('renders the add form correctly', () => {
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Check if the component renders with the correct title
    expect(screen.getByText('Add New Coupon')).toBeInTheDocument();
    
    // Check if form fields are present
    expect(screen.getByLabelText(/Retailer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Initial Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Activation Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PIN/i)).toBeInTheDocument();
  });

  it('renders the edit form correctly with coupon data', () => {
    const couponToEdit = mockCoupons[0];
    
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupon={couponToEdit}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Check if the component renders with the correct title
    expect(screen.getByText('Edit Coupon')).toBeInTheDocument();
    
    // Check if form fields are populated with coupon data
    expect(screen.getByDisplayValue('Amazon')).toBeInTheDocument();
    // Use getAllByDisplayValue for values that might appear multiple times
    expect(screen.getAllByDisplayValue('50').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('AMZN2024')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234')).toBeInTheDocument();
  });

  it('calls onUpdateCoupon when form is submitted with existing coupon', () => {
    const couponToEdit = mockCoupons[0];
    
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupon={couponToEdit}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Change some values in the form
    fireEvent.change(screen.getByLabelText(/Retailer/i), { target: { value: 'Updated Store' } });
    fireEvent.change(screen.getByLabelText(/Current Value/i), { target: { value: '25' } });
    
    // Submit the form
    const updateButton = screen.getByText('Update Coupon');
    fireEvent.click(updateButton);
    
    // Check that onUpdateCoupon was called with the correct data
    expect(mockOnUpdateCoupon).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      retailer: 'Updated Store',
      initialValue: '50',
      currentValue: '25'
    }));
  });
  
  it('calls onAddCoupon when form is submitted with new coupon', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Fill out the form
    await user.type(screen.getByLabelText(/Retailer/i), 'New Store');
    await user.type(screen.getByLabelText(/Initial Value/i), '100');
    
    // Mock date picker interaction
    const datePicker = screen.getByLabelText(/Expiration Date/i);
    await user.type(datePicker, '12/31/2025');
    await user.keyboard('{Enter}');
    
    await user.type(screen.getByLabelText(/Activation Code/i), 'NEW100');
    await user.type(screen.getByLabelText(/PIN/i), '5678');
    
    // Submit the form
    await user.click(screen.getByText('Add Coupon'));
    
    // Check that onAddCoupon was called with the correct data
    await waitFor(() => {
      expect(mockOnAddCoupon).toHaveBeenCalledWith(expect.objectContaining({
        retailer: 'New Store',
        initialValue: '100',
        currentValue: '100',
        activationCode: 'NEW100',
        pin: '5678'
      }));
    });
  });

  it('prevents currentValue from exceeding initialValue', () => {
    const couponToEdit = mockCoupons[0];
    
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupon={couponToEdit}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Change some values in the form
    fireEvent.change(screen.getByLabelText(/Retailer/i), { target: { value: 'Updated Store' } });
    fireEvent.change(screen.getByLabelText(/Current Value/i), { target: { value: '25' } });
    
    // Submit the form
    const updateButton = screen.getByText('Update Coupon');
    fireEvent.click(updateButton);
    
    // Check that onUpdateCoupon was called with the correct data
    expect(mockOnUpdateCoupon).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      retailer: 'Updated Store',
      initialValue: '50',
      currentValue: '25'
    }));
  });

  it('prevents currentValue from exceeding initialValue when editing', () => {
    // Mock an existing coupon for editing
    const existingCoupon = {
      id: 1,
      retailer: 'Test Store',
      initialValue: '50',
      currentValue: '50',
      expirationDate: new Date('2025-01-01')
    };
    
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true}
          onClose={mockOnClose}
          coupon={existingCoupon} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon} 
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Try to set currentValue higher than initialValue
    const currentValueInput = screen.getByLabelText(/Current Value/i);
    fireEvent.change(currentValueInput, { target: { value: '100' } });
    
    // Check that the value was capped at initialValue
    expect(screen.getByLabelText(/Current Value/i)).toHaveValue(50);
  });
  
  it('updates currentValue automatically when initialValue changes for new coupons', () => {
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Set initial value
    fireEvent.change(screen.getByLabelText(/Initial Value/i), { target: { value: '50' } });
    
    // Try to set current value higher than initial value
    fireEvent.change(screen.getByLabelText(/Current Value/i), { target: { value: '75' } });
    
    // Check that current value was capped at initial value
    expect(screen.getByLabelText(/Current Value/i)).toHaveValue(50);
  });

  it('does not allow editing initialValue when updating an existing coupon', () => {
    const couponToEdit = mockCoupons[0];
    
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupon={couponToEdit}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Check that initialValue field is read-only
    const initialValueInput = screen.getByLabelText(/Initial Value/i);
    expect(initialValueInput).toHaveAttribute('readonly');
    
    // Value should be the original value
    expect(initialValueInput.value).toBe('50');
  });

  it('validates required fields and prevents submission when invalid', () => {
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Submit the form without filling required fields
    const addButton = screen.getByText('Add Coupon');
    fireEvent.click(addButton);
    
    // Check that onAddCoupon was not called
    expect(mockOnAddCoupon).not.toHaveBeenCalled();
  });

  it('closes the form when cancel button is clicked', () => {
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('opens barcode scanner when scan button is clicked', () => {
    // Mock BarcodeScanner component
    vi.mock('../../components/BarcodeScanner', () => ({
      default: ({ open, onClose, onScanSuccess }) => (
        open ? <div data-testid="mock-barcode-scanner">Mock Scanner</div> : null
      )
    }));
    
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Initially scanner should be closed
    expect(screen.queryByTestId('mock-barcode-scanner')).not.toBeInTheDocument();
    
    // Click the scan button
    const scanButton = screen.getByText('Scan QR Code');
    fireEvent.click(scanButton);
    
    // Check that scanner is opened
    expect(screen.queryByTestId('mock-barcode-scanner')).toBeInTheDocument();
  });

  it('handles autocomplete retailer selection and input changes', () => {
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Get the autocomplete input
    const retailerInput = screen.getByLabelText(/Retailer/i);
    
    // Test onInputChange by typing in the input
    fireEvent.change(retailerInput, { target: { value: 'Ama' } });
    expect(retailerInput).toHaveValue('Ama');

    // Test onChange by selecting a value from options
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'Enter' });
    expect(retailerInput).toHaveValue('Amazon');

    // Test clearing the selection
    const clearButton = screen.getByTitle('Clear');
    fireEvent.click(clearButton);
    expect(retailerInput).toHaveValue('');
  });

  it('handles invalid number inputs in handleChange', () => {
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );

    // Test invalid initial value
    const initialValueInput = screen.getByLabelText(/Initial Value/i);
    fireEvent.change(initialValueInput, { target: { value: 'abc' } });
    expect(initialValueInput).toHaveValue(null);

    // Test invalid current value
    const currentValueInput = screen.getByLabelText(/Current Value/i);
    fireEvent.change(currentValueInput, { target: { value: 'abc' } });
    expect(currentValueInput).toHaveValue(null);
  });

  it('handles date picker changes', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );

    // Fill in required fields first
    await user.type(screen.getByLabelText(/Retailer/i), 'Test Store');
    await user.type(screen.getByLabelText(/Initial Value/i), '50');
    
    // Mock date picker interaction
    const datePicker = screen.getByLabelText(/Expiration Date/i);
    await user.type(datePicker, '12/31/2025');
    await user.keyboard('{Enter}');
    
    // Submit the form
    await user.click(screen.getByText('Add Coupon'));

    // Check that onAddCoupon was called with the correct data
    await waitFor(() => {
      expect(mockOnAddCoupon).toHaveBeenCalledWith(
        expect.objectContaining({
          retailer: 'Test Store',
          initialValue: '50',
          currentValue: '50',
          expirationDate: expect.any(Date)
        })
      );
    });
  });

  it('handles scanned data correctly', async () => {
    // Create a mock implementation for BarcodeScanner that simulates a successful scan
    vi.mock('../../components/BarcodeScanner', () => ({
      default: ({ open, onClose, onScanSuccess }) => {
        if (open) {
          // Simulate a scan after rendering
          setTimeout(() => {
            onScanSuccess({
              retailer: 'Scanned Store',
              initialValue: '200',
              expirationDate: '2026-01-01',
              activationCode: 'SCAN200',
              pin: '9876'
            });
            onClose();
          }, 0);
        }
        return open ? <div data-testid="mock-barcode-scanner">Mock Scanner</div> : null;
      }
    }));
    
    render(
      <TestWrapper>
        <AddCouponForm 
          open={true} 
          onClose={mockOnClose} 
          onAddCoupon={mockOnAddCoupon} 
          onUpdateCoupon={mockOnUpdateCoupon}
          coupons={mockCoupons}
        />
      </TestWrapper>
    );
    
    // Click the scan button
    const scanButton = screen.getByText('Scan QR Code');
    fireEvent.click(scanButton);
    
    // Wait for the scan to complete and check that form was updated with scanned data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Scanned Store')).toBeInTheDocument();
      expect(screen.getByLabelText(/Initial Value/i)).toHaveValue(200);
      expect(screen.getByDisplayValue('SCAN200')).toBeInTheDocument();
      expect(screen.getByDisplayValue('9876')).toBeInTheDocument();
    });
  });
});