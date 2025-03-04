import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import BarcodeScanner from '../../components/BarcodeScanner';
import { renderWithProviders } from '../util/test-utils';

// Mock the QrReader component
vi.mock('react-qr-reader', () => {
  const QrReader = ({ onScan, onError }) => (
    <div data-testid="mock-qr-reader">
      <button 
        data-testid="simulate-scan-button"
        onClick={() => onScan({ text: 'test-barcode-123' })}
      >
        Simulate Successful Scan
      </button>
      <button 
        data-testid="simulate-error-button"
        onClick={() => onError('mock-error')}
      >
        Simulate Error
      </button>
      <button 
        data-testid="simulate-null-scan"
        onClick={() => onScan(null)}
      >
        Simulate Null Scan
      </button>
    </div>
  );
  
  return { QrReader };
});

// Mock the LanguageContext
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => {
      const translations = {
        'actions.scan_barcode': 'Scan Barcode',
        'actions.cancel': 'Cancel',
        'errors.error_accessing_camera': 'Error accessing camera: {error}',
        'dialog.barcode_scanning_instruction': 'Position the barcode within the scanning area'
      };
      return translations[key] || key;
    }
  })
}));

describe('BarcodeScanner Component', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    mockOnScanSuccess.mockClear();
    mockOnClose.mockClear();
  });
  
  it('renders when open is true', () => {
    render(
      <BarcodeScanner 
        open={true} 
        onScanSuccess={mockOnScanSuccess} 
        onClose={mockOnClose} 
      />
    );
    
    // Check that the component is rendered
    expect(screen.getByTestId('mock-qr-reader')).toBeInTheDocument();
    expect(screen.getByText('Scan Barcode')).toBeInTheDocument();
  });
  
  it('does not render when open is false', () => {
    render(
      <BarcodeScanner 
        open={false} 
        onScanSuccess={mockOnScanSuccess} 
        onClose={mockOnClose} 
      />
    );
    
    // Check that the component is not rendered
    expect(screen.queryByTestId('mock-qr-reader')).not.toBeInTheDocument();
  });
  
  it('calls onScanSuccess and onClose when a barcode is scanned', async () => {
    render(
      <BarcodeScanner 
        open={true} 
        onScanSuccess={mockOnScanSuccess} 
        onClose={mockOnClose} 
      />
    );
    
    // Simulate a successful scan
    fireEvent.click(screen.getByTestId('simulate-scan-button'));
    
    // Check that onScanSuccess was called with the scanned data
    expect(mockOnScanSuccess).toHaveBeenCalledWith('test-barcode-123');
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('displays an error message when scanner encounters an error', () => {
    render(
      <BarcodeScanner 
        open={true} 
        onScanSuccess={mockOnScanSuccess} 
        onClose={mockOnClose} 
      />
    );
    
    // Simulate an error
    fireEvent.click(screen.getByTestId('simulate-error-button'));
    
    // Check that an error message is displayed with the correct format
    expect(screen.getByText('Error accessing camera: {error}: mock-error')).toBeInTheDocument();
  });
  
  it('closes the scanner when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <BarcodeScanner 
        open={true} 
        onScanSuccess={mockOnScanSuccess} 
        onClose={mockOnClose} 
      />
    );
    
    // Click the cancel button
    await user.click(screen.getByText('Cancel'));
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('ignores null scan results', () => {
    render(
      <BarcodeScanner 
        open={true} 
        onScanSuccess={mockOnScanSuccess} 
        onClose={mockOnClose} 
      />
    );
    
    // Simulate a null scan
    fireEvent.click(screen.getByTestId('simulate-null-scan'));
    
    // Check that neither onScanSuccess nor onClose were called
    expect(mockOnScanSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});