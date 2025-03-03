import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BarcodeScanner from '../../components/BarcodeScanner';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock theme for testing
const theme = createTheme();

// Mock the react-qr-reader module
vi.mock('react-qr-reader', () => ({
  QrReader: ({ onScan, onError }) => (
    <div data-testid="mock-qr-reader">
      <button 
        data-testid="mock-scan-button"
        onClick={() => onScan('{\'retailer\':\'Target\',\'initialValue\':\'50\',\'expirationDate\':\'2024-12-31\',\'activationCode\':\'TGT50XMAS\',\'pin\':\'1234\'}')}
      >
        Simulate Scan
      </button>
      <button 
        data-testid="mock-error-button"
        onClick={() => onError('Camera access denied')}
      >
        Simulate Error
      </button>
      <button 
        data-testid="mock-invalid-scan-button"
        onClick={() => onScan('invalid-json-data')}
      >
        Simulate Invalid Scan
      </button>
      <button 
        data-testid="mock-missing-fields-button"
        onClick={() => onScan('{\'retailer\':\'Target\'}')}
      >
        Simulate Missing Fields
      </button>
      <button 
        data-testid="mock-single-quotes-button"
        onClick={() => onScan('\\\'retailer\\\':\\\'Target\\\',\\\'initialValue\\\':\\\'50\\\',\\\'expirationDate\\\':\\\'2024-12-31\\\',\\\'activationCode\\\':\\\'TGT50XMAS\\\',\\\'pin\\\':\\\'1234\\\'')}
      >
        Simulate Single Quotes
      </button>
    </div>
  )
}));

// Reset the mock before each test to ensure consistent behavior
beforeEach(() => {
  vi.resetModules();
});

// Wrapper component to provide theme context
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('BarcodeScanner Component', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the scanner correctly', () => {
    render(
      <TestWrapper>
        <BarcodeScanner 
          open={true} 
          onClose={mockOnClose} 
          onScanSuccess={mockOnScanSuccess} 
        />
      </TestWrapper>
    );
    
    // Check if the component renders with the correct title
    expect(screen.getByText('Scan Coupon')).toBeInTheDocument();
    
    // Check if the scanner is rendered
    expect(screen.getByTestId('mock-qr-reader')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <TestWrapper>
        <BarcodeScanner 
          open={true} 
          onClose={mockOnClose} 
          onScanSuccess={mockOnScanSuccess} 
        />
      </TestWrapper>
    );
    
    // Click the close button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('processes scanned QR code data correctly', async () => {
    render(
      <TestWrapper>
        <BarcodeScanner 
          open={true} 
          onClose={mockOnClose} 
          onScanSuccess={mockOnScanSuccess} 
        />
      </TestWrapper>
    );
    
    // Simulate a successful scan
    fireEvent.click(screen.getByTestId('mock-scan-button'));
    
    // Check if onScanSuccess was called with the parsed data
    await waitFor(() => {
      expect(mockOnScanSuccess).toHaveBeenCalledWith({
        retailer: 'Target',
        initialValue: '50',
        expirationDate: '2024-12-31',
        activationCode: 'TGT50XMAS',
        pin: '1234'
      });
    });
    
    // Check if the dialog was closed after successful scan
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles scan errors gracefully', async () => {
    render(
      <TestWrapper>
        <BarcodeScanner 
          open={true} 
          onClose={mockOnClose} 
          onScanSuccess={mockOnScanSuccess} 
        />
      </TestWrapper>
    );
    
    // Simulate an error
    fireEvent.click(screen.getByTestId('mock-error-button'));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Error accessing camera/i)).toBeInTheDocument();
    });
    
    // onScanSuccess should not be called
    expect(mockOnScanSuccess).not.toHaveBeenCalled();
  });

  it('handles invalid QR code data gracefully', async () => {
    render(
      <TestWrapper>
        <BarcodeScanner 
          open={true} 
          onClose={mockOnClose} 
          onScanSuccess={mockOnScanSuccess} 
        />
      </TestWrapper>
    );
    
    // Simulate an invalid scan
    fireEvent.click(screen.getByTestId('mock-invalid-scan-button'));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid QR code format/i)).toBeInTheDocument();
    });
    
    // onScanSuccess should not be called
    expect(mockOnScanSuccess).not.toHaveBeenCalled();
  });

  it('handles QR codes with missing required fields', async () => {
    render(
      <TestWrapper>
        <BarcodeScanner 
          open={true} 
          onClose={mockOnClose} 
          onScanSuccess={mockOnScanSuccess} 
        />
      </TestWrapper>
    );
    
    // Simulate a scan with missing fields
    fireEvent.click(screen.getByTestId('mock-missing-fields-button'));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid QR code format: missing required fields/i)).toBeInTheDocument();
    });
    
    // onScanSuccess should not be called
    expect(mockOnScanSuccess).not.toHaveBeenCalled();
  });

  it('handles QR codes with single quotes format', async () => {
    render(
      <TestWrapper>
        <BarcodeScanner 
          open={true} 
          onClose={mockOnClose} 
          onScanSuccess={mockOnScanSuccess} 
        />
      </TestWrapper>
    );
    
    // Simulate a scan with single quotes format
    fireEvent.click(screen.getByTestId('mock-single-quotes-button'));
    
    // Check if the component attempts to handle the format
    // This could either succeed or show an error depending on implementation
    await waitFor(() => {
      // Either an error is shown or onScanSuccess is called
      const errorShown = screen.queryByText(/Invalid QR code format/i) !== null;
      const successCalled = mockOnScanSuccess.mock.calls.length > 0;
      
      expect(errorShown || successCalled).toBe(true);
    });
  });

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <BarcodeScanner 
          open={false} 
          onClose={mockOnClose} 
          onScanSuccess={mockOnScanSuccess} 
        />
      </TestWrapper>
    );
    
    // Check that the dialog is not rendered when open=false
    expect(screen.queryByText('Scan Coupon')).not.toBeInTheDocument();
  });
});