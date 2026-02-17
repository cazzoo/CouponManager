import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCouponForm from '../../components/AddCouponForm';
import { LanguageProvider } from '../../services/LanguageContext';
import type { Coupon, CouponFormData } from '../../types';

vi.stubGlobal('import', { meta: { env: { DEV: false } } });

const mockT = (key: string, options?: { defaultValue?: string }): string => {
  const translations: Record<string, string> = {
    'app.add_coupon': 'Add Coupon',
    'actions.edit': 'Edit',
    'actions.update': 'Update',
    'actions.add': 'Add',
    'actions.cancel': 'Cancel',
    'actions.scan_barcode': 'Scan Barcode',
    'form.retailer': 'Retailer',
    'form.select_retailer': 'Select Retailer',
    'form.initial_value': 'Initial Value',
    'form.current_value': 'Current Value',
    'form.expiration_date': 'Expiration Date',
    'form.select_date': 'Select Date',
    'form.activation_code': 'Activation Code',
    'form.pin': 'PIN',
    'form.notes': 'Notes',
    'form.barcode': 'Barcode',
    'form.reference': 'Reference'
  };

  return translations[key] || options?.defaultValue || key;
};

vi.mock('../../services/LanguageContext', () => ({
  useLanguage: () => ({
    t: mockT,
    language: 'en-US'
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('../../components/BarcodeScanner', () => ({
  default: ({ open, onClose, onScanSuccess }: any) => {
    if (!open) return null;
    return (
      <div data-testid="barcode-scanner-modal">
        <button onClick={() => onScanSuccess('SCANNED_BARCODE_123')}>Simulate Scan</button>
        <button onClick={onClose}>Close Scanner</button>
      </div>
    );
  }
}));

const mockOnAddCoupon = vi.fn();
const mockOnUpdateCoupon = vi.fn();
const mockOnClose = vi.fn();

const mockCoupons: Coupon[] = [
  {
    id: '1',
    userId: 'user1',
    retailer: 'Amazon',
    initialValue: '50',
    currentValue: '30',
    expirationDate: '2024-12-31'
  },
  {
    id: '2',
    userId: 'user1',
    retailer: 'Target',
    initialValue: '25',
    currentValue: '25'
  }
];

const renderComponent = (props: Partial<React.ComponentProps<typeof AddCouponForm>> = {}) => {
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onAddCoupon: mockOnAddCoupon,
    onUpdateCoupon: mockOnUpdateCoupon
  };

  return render(
    <LanguageProvider>
      <AddCouponForm {...defaultProps} {...props} />
    </LanguageProvider>
  );
};

describe('AddCouponForm - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when open prop is true', () => {
    renderComponent();
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('coupon-form')).toBeInTheDocument();
  });

  it('should not render modal when open prop is false', () => {
    renderComponent({ open: false });
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('coupon-form')).not.toBeInTheDocument();
  });

  it('should display "Add Coupon" title when no coupon is provided', () => {
    renderComponent();
    
    expect(screen.getByText('Add Coupon')).toBeInTheDocument();
  });

  it('should display "Edit" title when coupon is provided', () => {
    const mockCoupon: Coupon = {
      id: '123',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '30'
    };
    
    renderComponent({ coupon: mockCoupon });
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('should render all required form fields', () => {
    renderComponent();
    
    expect(screen.getByTestId('retailer-select')).toBeInTheDocument();
    expect(screen.getByTestId('initial-value-input')).toBeInTheDocument();
    expect(screen.getByTestId('current-value-input')).toBeInTheDocument();
  });

  it('should render all optional form fields', () => {
    renderComponent();
    
    expect(screen.getByTestId('expiration-date-picker')).toBeInTheDocument();
    expect(screen.getByTestId('activation-code-input')).toBeInTheDocument();
    expect(screen.getByTestId('pin-input')).toBeInTheDocument();
    expect(screen.getByTestId('notes-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('barcode-input')).toBeInTheDocument();
    expect(screen.getByTestId('reference-input')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    renderComponent();
    
    expect(screen.getByTestId('coupon-cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('coupon-submit-button')).toBeInTheDocument();
  });

  it('should render barcode scanner button', () => {
    renderComponent();
    
    expect(screen.getByText('Scan Barcode')).toBeInTheDocument();
  });
});

describe('AddCouponForm - Add Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display "Add" button text in add mode', () => {
    renderComponent();
    
    expect(screen.getByTestId('coupon-submit-button')).toHaveTextContent('Add');
  });

  it.skip('should have empty form fields initially in add mode when DEV mode is disabled', () => {
    renderComponent();
    
    const retailerSelect = screen.getByTestId('retailer-select') as HTMLSelectElement;
    const initialValueInput = screen.getByTestId('initial-value-input') as HTMLInputElement;
    const currentValueInput = screen.getByTestId('current-value-input') as HTMLInputElement;
    
    expect(retailerSelect.value).toBe('');
    expect(initialValueInput.value).toBe('');
    expect(currentValueInput.value).toBe('');
  });

  it('should populate retailer options from existing coupons', () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const options = retailerSelect.querySelectorAll('option');
    
    expect(options).toHaveLength(3);
    expect(options[0].value).toBe('');
    expect(options[1].value).toBe('Amazon');
    expect(options[2].value).toBe('Target');
  });

  it('should show "Select Retailer" as default option', () => {
    renderComponent({ coupons: mockCoupons });
    
    expect(screen.getByText('Select Retailer')).toBeInTheDocument();
  });
});

describe('AddCouponForm - Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display "Update" button text in edit mode', () => {
    const mockCoupon: Coupon = {
      id: '123',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '30'
    };
    
    renderComponent({ coupon: mockCoupon });
    
    expect(screen.getByTestId('coupon-submit-button')).toHaveTextContent('Update');
  });

  it.skip('should populate form with existing coupon data', async () => {
    const mockCoupon: Coupon = {
      id: '123',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '30',
      expirationDate: '2024-12-31',
      activationCode: 'ACT123',
      pin: '1234',
      notes: 'Test notes',
      barcode: 'BAR123',
      reference: 'REF123'
    };
    
    renderComponent({ coupon: mockCoupon });
    
    await waitFor(() => {
      const retailerSelect = screen.getByTestId('retailer-select') as HTMLSelectElement;
      expect(retailerSelect.value).toBe('Amazon');
    });
    
    const initialValueInput = screen.getByTestId('initial-value-input') as HTMLInputElement;
    const currentValueInput = screen.getByTestId('current-value-input') as HTMLInputElement;
    const activationCodeInput = screen.getByTestId('activation-code-input') as HTMLInputElement;
    const pinInput = screen.getByTestId('pin-input') as HTMLInputElement;
    const notesTextarea = screen.getByTestId('notes-textarea') as HTMLTextAreaElement;
    const barcodeInput = screen.getByTestId('barcode-input') as HTMLInputElement;
    const referenceInput = screen.getByTestId('reference-input') as HTMLInputElement;
    
    expect(initialValueInput.value).toBe('50');
    expect(currentValueInput.value).toBe('30');
    expect(activationCodeInput.value).toBe('ACT123');
    expect(pinInput.value).toBe('1234');
    expect(notesTextarea.value).toBe('Test notes');
    expect(barcodeInput.value).toBe('BAR123');
    expect(referenceInput.value).toBe('REF123');
  });

  it('should handle coupon without optional fields', () => {
    const mockCoupon: Coupon = {
      id: '123',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '30'
    };
    
    renderComponent({ coupon: mockCoupon });
    
    const activationCodeInput = screen.getByTestId('activation-code-input') as HTMLInputElement;
    const pinInput = screen.getByTestId('pin-input') as HTMLInputElement;
    
    expect(activationCodeInput.value).toBe('');
    expect(pinInput.value).toBe('');
  });
});

describe('AddCouponForm - Form Input Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update retailer field on change', () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    fireEvent.change(retailerSelect, { target: { value: 'Amazon' } });
    
    expect(retailerSelect).toHaveValue('Amazon');
  });

  it('should update initial value field on change', () => {
    renderComponent();
    
    const initialValueInput = screen.getByTestId('initial-value-input');
    fireEvent.change(initialValueInput, { target: { value: '100' } });
    
    expect(initialValueInput).toHaveValue(100);
  });

  it('should update current value field on change', () => {
    renderComponent();
    
    const currentValueInput = screen.getByTestId('current-value-input');
    fireEvent.change(currentValueInput, { target: { value: '75' } });
    
    expect(currentValueInput).toHaveValue(75);
  });

  it('should update activation code field on change', () => {
    renderComponent();
    
    const activationCodeInput = screen.getByTestId('activation-code-input');
    fireEvent.change(activationCodeInput, { target: { value: 'CODE123' } });
    
    expect(activationCodeInput).toHaveValue('CODE123');
  });

  it('should update PIN field on change', () => {
    renderComponent();
    
    const pinInput = screen.getByTestId('pin-input');
    fireEvent.change(pinInput, { target: { value: '1234' } });
    
    expect(pinInput).toHaveValue('1234');
  });

  it('should update notes field on change', () => {
    renderComponent();
    
    const notesTextarea = screen.getByTestId('notes-textarea');
    fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });
    
    expect(notesTextarea).toHaveValue('Test notes');
  });

  it('should update barcode field on change', () => {
    renderComponent();
    
    const barcodeInput = screen.getByTestId('barcode-input');
    fireEvent.change(barcodeInput, { target: { value: 'BAR123' } });
    
    expect(barcodeInput).toHaveValue('BAR123');
  });

  it('should update reference field on change', () => {
    renderComponent();
    
    const referenceInput = screen.getByTestId('reference-input');
    fireEvent.change(referenceInput, { target: { value: 'REF123' } });
    
    expect(referenceInput).toHaveValue('REF123');
  });
});

describe('AddCouponForm - Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not submit form when required fields are empty', () => {
    renderComponent();
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    const form = screen.getByTestId('coupon-form');
    
    fireEvent.change(retailerSelect, { target: { value: '' } });
    fireEvent.change(initialValueInput, { target: { value: '' } });
    fireEvent.change(currentValueInput, { target: { value: '' } });
    
    fireEvent.submit(form);
    
    expect(mockOnAddCoupon).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should submit form with valid required fields', async () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    const form = screen.getByTestId('coupon-form');
    
    fireEvent.change(retailerSelect, { target: { value: 'Amazon' } });
    fireEvent.change(initialValueInput, { target: { value: '50' } });
    fireEvent.change(currentValueInput, { target: { value: '50' } });
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockOnAddCoupon).toHaveBeenCalledOnce();
      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  it('should include all form data in submission', async () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    const activationCodeInput = screen.getByTestId('activation-code-input');
    const pinInput = screen.getByTestId('pin-input');
    const notesTextarea = screen.getByTestId('notes-textarea');
    const barcodeInput = screen.getByTestId('barcode-input');
    const referenceInput = screen.getByTestId('reference-input');
    const form = screen.getByTestId('coupon-form');
    
    fireEvent.change(retailerSelect, { target: { value: 'Amazon' } });
    fireEvent.change(initialValueInput, { target: { value: '100' } });
    fireEvent.change(currentValueInput, { target: { value: '80' } });
    fireEvent.change(activationCodeInput, { target: { value: 'ACT123' } });
    fireEvent.change(pinInput, { target: { value: '1234' } });
    fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });
    fireEvent.change(barcodeInput, { target: { value: 'BAR123' } });
    fireEvent.change(referenceInput, { target: { value: 'REF123' } });
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockOnAddCoupon).toHaveBeenCalledWith({
        retailer: 'Amazon',
        initialValue: '100',
        currentValue: '80',
        activationCode: 'ACT123',
        pin: '1234',
        notes: 'Test notes',
        barcode: 'BAR123',
        reference: 'REF123',
        expirationDate: undefined
      });
    });
  });

  it('should include both initial and current values in submission', async () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    const form = screen.getByTestId('coupon-form');
    
    fireEvent.change(retailerSelect, { target: { value: 'Amazon' } });
    fireEvent.change(initialValueInput, { target: { value: '50' } });
    fireEvent.change(currentValueInput, { target: { value: '50' } });
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockOnAddCoupon).toHaveBeenCalled();
      const calledWith = mockOnAddCoupon.mock.calls[0][0] as CouponFormData;
      expect(calledWith.currentValue).toBe('50');
      expect(calledWith.initialValue).toBe('50');
    });
  });
});

describe('AddCouponForm - Edit Mode Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onUpdateCoupon when editing existing coupon', async () => {
    const mockCoupon: Coupon = {
      id: '123',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '30'
    };
    
    renderComponent({ coupon: mockCoupon, coupons: mockCoupons });
    
    const currentValueInput = screen.getByTestId('current-value-input');
    const form = screen.getByTestId('coupon-form');
    
    fireEvent.change(currentValueInput, { target: { value: '25' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockOnUpdateCoupon).toHaveBeenCalledOnce();
      expect(mockOnAddCoupon).not.toHaveBeenCalled();
    });
  });

  it('should preserve coupon id and userId in edit mode', async () => {
    const mockCoupon: Coupon = {
      id: '123',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '30'
    };
    
    renderComponent({ coupon: mockCoupon, coupons: mockCoupons });
    
    const form = screen.getByTestId('coupon-form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      const calledWith = mockOnUpdateCoupon.mock.calls[0][0] as Partial<Coupon>;
      expect(calledWith.id).toBe('123');
      expect(calledWith.userId).toBe('user1');
    });
  });
});

describe('AddCouponForm - Cancel Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onClose when cancel button is clicked', () => {
    renderComponent();
    
    const cancelButton = screen.getByTestId('coupon-cancel-button');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledOnce();
    expect(mockOnAddCoupon).not.toHaveBeenCalled();
  });

  it('should not submit data when cancelled', () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    const cancelButton = screen.getByTestId('coupon-cancel-button');
    
    fireEvent.change(retailerSelect, { target: { value: 'Amazon' } });
    fireEvent.change(initialValueInput, { target: { value: '50' } });
    fireEvent.change(currentValueInput, { target: { value: '50' } });
    
    fireEvent.click(cancelButton);
    
    expect(mockOnAddCoupon).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledOnce();
  });
});

describe('AddCouponForm - Barcode Scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should open barcode scanner when scan button is clicked', () => {
    renderComponent();
    
    const scanButton = screen.getByText('Scan Barcode');
    fireEvent.click(scanButton);
    
    expect(screen.getByTestId('barcode-scanner-modal')).toBeInTheDocument();
  });

  it('should close barcode scanner on close', () => {
    renderComponent();
    
    const scanButton = screen.getByText('Scan Barcode');
    fireEvent.click(scanButton);
    
    const closeButton = screen.getByText('Close Scanner');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('barcode-scanner-modal')).not.toBeInTheDocument();
  });

  it('should populate barcode field when scan returns string', () => {
    renderComponent();
    
    const scanButton = screen.getByText('Scan Barcode');
    fireEvent.click(scanButton);
    
    const simulateButton = screen.getByText('Simulate Scan');
    fireEvent.click(simulateButton);
    
    const barcodeInput = screen.getByTestId('barcode-input') as HTMLInputElement;
    expect(barcodeInput.value).toBe('SCANNED_BARCODE_123');
  });
});

describe('AddCouponForm - Date Picker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display "Select Date" when no date is selected', () => {
    renderComponent();
    
    expect(screen.getByText('Select Date')).toBeInTheDocument();
  });

  it('should toggle date picker dropdown on click', () => {
    renderComponent();
    
    const datePicker = screen.getByTestId('expiration-date-picker');
    fireEvent.click(datePicker);
    
    const dropdown = document.getElementById('date-picker-dropdown');
    expect(dropdown).toHaveClass('dropdown-open');
  });

  it('should populate date from coupon in edit mode', () => {
    const mockCoupon: Coupon = {
      id: '123',
      userId: 'user1',
      retailer: 'Amazon',
      initialValue: '50',
      currentValue: '30',
      expirationDate: '2024-12-31'
    };
    
    renderComponent({ coupon: mockCoupon });
    
    const datePicker = screen.getByTestId('expiration-date-picker');
    expect(datePicker).toHaveTextContent('12/31/2024');
  });
});

describe('AddCouponForm - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have proper ARIA attributes on modal', () => {
    renderComponent();
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('should have proper ARIA labels on form fields', () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    expect(retailerSelect).toHaveAttribute('aria-label', 'Retailer');
  });

  it('should have required attribute on required fields', () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    
    expect(retailerSelect).toBeRequired();
    expect(initialValueInput).toBeRequired();
    expect(currentValueInput).toBeRequired();
  });

  it('should have appropriate input types', () => {
    renderComponent();
    
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    
    expect(initialValueInput).toHaveAttribute('type', 'number');
    expect(currentValueInput).toHaveAttribute('type', 'number');
  });

  it('should have min and step attributes on number inputs', () => {
    renderComponent();
    
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    
    expect(initialValueInput).toHaveAttribute('min', '0');
    expect(initialValueInput).toHaveAttribute('step', '0.01');
    expect(currentValueInput).toHaveAttribute('min', '0');
    expect(currentValueInput).toHaveAttribute('step', '0.01');
  });
});

describe('AddCouponForm - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle empty coupons array', () => {
    renderComponent({ coupons: [] });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const options = retailerSelect.querySelectorAll('option');
    
    expect(options).toHaveLength(1);
    expect(options[0].value).toBe('');
  });

  it('should handle coupons prop being undefined', () => {
    renderComponent();
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const options = retailerSelect.querySelectorAll('option');
    
    expect(options).toHaveLength(1);
    expect(options[0].value).toBe('');
  });

  it('should handle unique retailer options from multiple coupons', () => {
    const duplicateCoupons: Coupon[] = [
      ...mockCoupons,
      {
        id: '3',
        userId: 'user1',
        retailer: 'Amazon',
        initialValue: '75',
        currentValue: '75'
      }
    ];
    
    renderComponent({ coupons: duplicateCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const options = retailerSelect.querySelectorAll('option');
    
    expect(options).toHaveLength(3);
  });

  it('should handle zero values', async () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    const form = screen.getByTestId('coupon-form');
    
    fireEvent.change(retailerSelect, { target: { value: 'Amazon' } });
    fireEvent.change(initialValueInput, { target: { value: '0' } });
    fireEvent.change(currentValueInput, { target: { value: '0' } });
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockOnAddCoupon).toHaveBeenCalled();
      const calledWith = mockOnAddCoupon.mock.calls[0][0] as CouponFormData;
      expect(calledWith.initialValue).toBe('0');
      expect(calledWith.currentValue).toBe('0');
    });
  });

  it('should handle decimal values', async () => {
    renderComponent({ coupons: mockCoupons });
    
    const retailerSelect = screen.getByTestId('retailer-select');
    const initialValueInput = screen.getByTestId('initial-value-input');
    const currentValueInput = screen.getByTestId('current-value-input');
    const form = screen.getByTestId('coupon-form');
    
    fireEvent.change(retailerSelect, { target: { value: 'Amazon' } });
    fireEvent.change(initialValueInput, { target: { value: '10.50' } });
    fireEvent.change(currentValueInput, { target: { value: '5.25' } });
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockOnAddCoupon).toHaveBeenCalled();
      const calledWith = mockOnAddCoupon.mock.calls[0][0] as CouponFormData;
      expect(calledWith.initialValue).toBe('10.50');
      expect(calledWith.currentValue).toBe('5.25');
    });
  });
});
