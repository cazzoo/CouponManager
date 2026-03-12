/**
 * Tests for BarcodeScanner component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import BarcodeScanner from '../../components/BarcodeScanner';
import type { CouponData } from '../../types';

// Mock the QrReader component
vi.mock('react-qr-reader', () => {
  const QrReader = ({ onResult }: { onResult: (result: any, error: any) => void }) => (
    <div data-testid="mock-qr-reader">
      <button
        data-testid="simulate-scan-button"
        onClick={() => onResult({ text: 'test-barcode-123' }, null)}
      >
        Simulate Successful Scan
      </button>
      <button
        data-testid="simulate-error-button"
        onClick={() => onResult(null, { message: 'mock-error' })}
      >
        Simulate Error
      </button>
      <button
        data-testid="simulate-error-no-message"
        onClick={() => onResult(null, 'string-error')}
      >
        Simulate Error String
      </button>
      <button
        data-testid="simulate-null-scan"
        onClick={() => onResult(null, null)}
      >
        Simulate Null Scan
      </button>
      <button
        data-testid="simulate-json-scan"
        onClick={() => onResult({ text: '{"retailer":"Amazon","initialValue":"50"}' }, null)}
      >
        Simulate JSON Scan
      </button>
      <button
        data-testid="simulate-json-invalid"
        onClick={() => onResult({ text: '{"retailer":"Amazon"}' }, null)}
      >
        Simulate JSON Invalid
      </button>
      <button
        data-testid="simulate-json-single-quotes"
        onClick={() => onResult({ text: "{'retailer':'Amazon','initialValue':'50'}" }, null)}
      >
        Simulate JSON Single Quotes
      </button>
      <button
        data-testid="simulate-json-broken"
        onClick={() => onResult({ text: '{invalid json}' }, null)}
      >
        Simulate Broken JSON
      </button>
      <button
        data-testid="simulate-empty-text"
        onClick={() => onResult({ text: '' }, null)}
      >
        Simulate Empty Text
      </button>
      <button
        data-testid="simulate-result-no-text"
        onClick={() => onResult({}, null)}
      >
        Simulate Result No Text
      </button>
      <button
        data-testid="simulate-json-extra-fields"
        onClick={() => onResult({ text: '{"retailer":"Amazon","initialValue":"50","notes":"test","pin":"1234"}' }, null)}
      >
        Simulate JSON Extra Fields
      </button>
      <button
        data-testid="simulate-json-numeric-value"
        onClick={() => onResult({ text: '{"retailer":"BestBuy","initialValue":75}' }, null)}
      >
        Simulate JSON Numeric Value
      </button>
    </div>
  );

  return { QrReader };
});

// Mock the LanguageContext
vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'actions.scan_barcode': 'Scan Barcode',
        'actions.cancel': 'Cancel',
        'errors.error_accessing_camera': 'Error accessing camera',
        'errors.invalid_qr_format': 'Invalid QR format',
        'dialog.barcode_scanning_instruction': 'Position the barcode within the scanning area'
      };
      return translations[key] || key;
    }
  })
}));

describe('BarcodeScanner Component - Basic Rendering', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnScanSuccess.mockClear();
    mockOnClose.mockClear();
  });

  it('should render dialog when open is true', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByTestId('mock-qr-reader')).toBeInTheDocument();
    expect(screen.getByText('Scan Barcode')).toBeInTheDocument();
  });

  it('should not render anything when open is false', () => {
    const { container } = render(
      <BarcodeScanner
        open={false}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('mock-qr-reader')).not.toBeInTheDocument();
  });

  it('should display scanning instruction text', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('scanning-instruction')).toBeInTheDocument();
    expect(screen.getByText('Position the barcode within the scanning area')).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByTestId('cancel-button');
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveTextContent('Cancel');
  });
});

describe('BarcodeScanner Component - Raw Barcode Scanning', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnScanSuccess.mockClear();
    mockOnClose.mockClear();
  });

  it('should call onScanSuccess with raw text when scan succeeds', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-scan-button'));

    expect(mockOnScanSuccess).toHaveBeenCalledWith('test-barcode-123');
    expect(mockOnScanSuccess).toHaveBeenCalledTimes(1);
  });

  it('should call onClose after successful scan', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-scan-button'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should ignore null scan results', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-null-scan'));

    expect(mockOnScanSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should ignore scan results with empty text', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-empty-text'));

    expect(mockOnScanSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should ignore scan results without text property', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-result-no-text'));

    expect(mockOnScanSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

describe('BarcodeScanner Component - JSON QR Code Parsing', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnScanSuccess.mockClear();
    mockOnClose.mockClear();
  });

  it('should parse valid JSON QR code with required fields', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-json-scan'));

    const expectedData: CouponData = {
      retailer: 'Amazon',
      initialValue: '50'
    };
    expect(mockOnScanSuccess).toHaveBeenCalledWith(expectedData);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should convert single quotes to double quotes in JSON', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-json-single-quotes'));

    const expectedData: CouponData = {
      retailer: 'Amazon',
      initialValue: '50'
    };
    expect(mockOnScanSuccess).toHaveBeenCalledWith(expectedData);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should treat invalid JSON as raw text', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-json-broken'));

    expect(mockOnScanSuccess).toHaveBeenCalledWith('{invalid json}');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display error when JSON missing retailer field', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-json-invalid'));

    expect(mockOnScanSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('error-alert')).toBeInTheDocument();
    expect(screen.getByText('Invalid QR format')).toBeInTheDocument();
  });
});

describe('BarcodeScanner Component - Error Handling', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnScanSuccess.mockClear();
    mockOnClose.mockClear();
  });

  it('should display error when scanner has error with message', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-error-button'));

    expect(screen.getByTestId('error-alert')).toBeInTheDocument();
    expect(screen.getByText(/Error accessing camera.*mock-error/)).toBeInTheDocument();
  });

  it('should display error when scanner has string error', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-error-no-message'));

    expect(screen.getByTestId('error-alert')).toBeInTheDocument();
    expect(screen.getByText(/Error accessing camera.*string-error/)).toBeInTheDocument();
  });

  it('should not clear error on successful scan (error persists until component closes)', () => {
    // Component does not automatically clear errors on successful scan
    // The error state persists until the component is closed and reopened
    // This is the expected behavior - error shows last error encountered
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    // First trigger an error
    fireEvent.click(screen.getByTestId('simulate-error-button'));
    expect(screen.getByTestId('error-alert')).toBeInTheDocument();

    // Then a successful scan - error persists because that's the component design
    fireEvent.click(screen.getByTestId('simulate-json-scan'));
    // Error state is not cleared on successful scan - verify it still shows
    expect(screen.getByTestId('error-alert')).toBeInTheDocument();
  });
});

describe('BarcodeScanner Component - User Interactions', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnScanSuccess.mockClear();
    mockOnClose.mockClear();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByTestId('cancel-button'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnScanSuccess).not.toHaveBeenCalled();
  });

  it('should call onClose after each successful scan (sequential scan model)', () => {
    // After each scan, onClose is called — a new scan would require remounting.
    // This verifies the first scan triggers both onScanSuccess and onClose.
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('simulate-json-scan'));

    expect(mockOnScanSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

describe('BarcodeScanner Component - Accessibility', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnScanSuccess.mockClear();
    mockOnClose.mockClear();
  });

  it('should have proper ARIA attributes on error alert', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    // Trigger an error
    fireEvent.click(screen.getByTestId('simulate-error-button'));

    const errorAlert = screen.getByTestId('error-alert');
    expect(errorAlert).toHaveAttribute('role', 'alert');
  });

  it('should have accessible button elements', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByTestId('cancel-button');
    expect(cancelButton.tagName).toBe('BUTTON');
  });
});

describe('BarcodeScanner Component - Edge Cases', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnScanSuccess.mockClear();
    mockOnClose.mockClear();
  });

  it('should handle JSON with additional fields beyond required ones', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    // Scan JSON that includes extra fields beyond retailer+initialValue
    fireEvent.click(screen.getByTestId('simulate-json-extra-fields'));

    // Extra fields (notes, pin) are passed through to the parent
    expect(mockOnScanSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ retailer: 'Amazon', initialValue: '50', notes: 'test', pin: '1234' })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle numeric initialValue in JSON', () => {
    render(
      <BarcodeScanner
        open={true}
        onScanSuccess={mockOnScanSuccess}
        onClose={mockOnClose}
      />
    );

    // Scan JSON where initialValue is a number (not string)
    fireEvent.click(screen.getByTestId('simulate-json-numeric-value'));

    // JSON.parse preserves the numeric type; component passes it through
    expect(mockOnScanSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ retailer: 'BestBuy', initialValue: 75 })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });
});
