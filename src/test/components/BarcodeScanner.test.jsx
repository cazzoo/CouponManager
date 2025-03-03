import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import BarcodeScanner from '../../components/BarcodeScanner';
import { renderWithProviders, mockTranslate } from '../util/test-utils';

// Mock the useLanguage hook
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    changeLanguage: vi.fn(),
    t: mockTranslate
  })
}));

// Mock the QrReader component
vi.mock('react-qr-reader', () => ({
  QrReader: ({ onScan, onError }) => (
    <div data-testid="mock-qr-reader">
      <button
        onClick={() => onScan && onScan('mocked-data')}
        data-testid="mock-scan-button"
      >
        Trigger Scan
      </button>
      <button
        onClick={() => onScan && onScan('{"retailer":"Test Store","initialValue":"50"}')}
        data-testid="mock-json-scan-button"
      >
        Trigger JSON Scan
      </button>
      <button
        onClick={() => onError && onError('mock error')}
        data-testid="mock-error-button"
      >
        Trigger Error
      </button>
    </div>
  )
}));

describe('BarcodeScanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('renders the scanner correctly', () => {
    const onClose = vi.fn();
    const onScanSuccess = vi.fn();
    
    renderWithProviders(
      <BarcodeScanner 
        open={true} 
        onClose={onClose} 
        onScanSuccess={onScanSuccess} 
      />
    );
    
    expect(screen.getByTestId('mock-qr-reader')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const onScanSuccess = vi.fn();
    
    renderWithProviders(
      <BarcodeScanner 
        open={true} 
        onClose={onClose} 
        onScanSuccess={onScanSuccess} 
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
  
  test('processes scanned QR code data correctly', () => {
    const onClose = vi.fn();
    const onScanSuccess = vi.fn();
    
    renderWithProviders(
      <BarcodeScanner 
        open={true} 
        onClose={onClose} 
        onScanSuccess={onScanSuccess} 
      />
    );
    
    // Trigger a scan with a simple string
    fireEvent.click(screen.getByTestId('mock-scan-button'));
    expect(onScanSuccess).toHaveBeenCalledWith('mocked-data');
    expect(onClose).toHaveBeenCalled();
  });
  
  test('processes JSON QR code data correctly', () => {
    const onClose = vi.fn();
    const onScanSuccess = vi.fn();
    
    renderWithProviders(
      <BarcodeScanner 
        open={true} 
        onClose={onClose} 
        onScanSuccess={onScanSuccess} 
      />
    );
    
    // Trigger a scan with JSON data
    fireEvent.click(screen.getByTestId('mock-json-scan-button'));
    expect(onScanSuccess).toHaveBeenCalledWith(expect.objectContaining({
      retailer: 'Test Store',
      initialValue: '50'
    }));
    expect(onClose).toHaveBeenCalled();
  });
  
  test('handles scan errors gracefully', () => {
    const onClose = vi.fn();
    const onScanSuccess = vi.fn();
    
    renderWithProviders(
      <BarcodeScanner 
        open={true} 
        onClose={onClose} 
        onScanSuccess={onScanSuccess} 
      />
    );
    
    // Trigger an error
    fireEvent.click(screen.getByTestId('mock-error-button'));
    expect(screen.getByText(/Error accessing camera: mock error/i)).toBeInTheDocument();
  });
  
  test('does not render when closed', () => {
    const onClose = vi.fn();
    const onScanSuccess = vi.fn();
    
    renderWithProviders(
      <BarcodeScanner 
        open={false} 
        onClose={onClose} 
        onScanSuccess={onScanSuccess} 
      />
    );
    
    // The dialog should not be visible when open is false
    expect(screen.queryByTestId('mock-qr-reader')).not.toBeInTheDocument();
  });
});