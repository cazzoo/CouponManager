import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Scan } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import BarcodeScanner from './BarcodeScanner';
import { useLanguage } from '../services/LanguageContext';
import { Coupon, CouponData, CouponFormData } from '../types';

const localeMap: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE'
};

interface AddCouponFormProps {
  open: boolean;
  onClose: () => void;
  onAddCoupon: (coupon: CouponFormData) => void;
  onUpdateCoupon: (coupon: Partial<Coupon>) => void;
  coupon?: Coupon;
  coupons?: Coupon[];
}

interface FormState {
  retailer: string;
  initialValue: string;
  currentValue: string;
  expirationDate: Date | null;
  activationCode: string;
  pin: string;
  notes?: string;
  barcode?: string;
  reference?: string;
  id?: string;
  userId?: string;
  created_at?: string;
  updated_at?: string;
}

interface AddCouponFormProps {
  open: boolean;
  onClose: () => void;
  onAddCoupon: (coupon: CouponFormData) => void;
  onUpdateCoupon: (coupon: Partial<Coupon>) => void;
  coupon?: Coupon;
  coupons?: Coupon[];
}

interface FormState {
  retailer: string;
  initialValue: string;
  currentValue: string;
  expirationDate: Date | null;
  activationCode: string;
  pin: string;
  notes?: string;
  barcode?: string;
  reference?: string;
  id?: string;
  userId?: string;
  created_at?: string;
  updated_at?: string;
}

const AddCouponForm: React.FC<AddCouponFormProps> = ({ 
  open, 
  onClose, 
  onAddCoupon, 
  onUpdateCoupon, 
  coupon, 
  coupons = [] 
}) => {
  const { t, language } = useLanguage();
  const retailerOptions = coupons.length > 0 ? [...new Set(coupons.map(c => c.retailer))] : [];
  const initialFormState: FormState = {
    retailer: '',
    initialValue: '',
    currentValue: '',
    expirationDate: null,
    activationCode: '',
    pin: ''
  };

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (coupon) {
      const expirationDate = coupon.expirationDate 
        ? new Date(coupon.expirationDate) 
        : null;
      
      setFormData({
        ...coupon,
        expirationDate,
        activationCode: coupon.activationCode || '',
        pin: coupon.pin || ''
      });
    } else {
      if (import.meta.env.DEV) {
        console.log('AddCouponForm: Pre-filling form with example values for testing');
        setFormData({
          ...initialFormState,
          retailer: 'Example Store',
          initialValue: '10',
          currentValue: '10'
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [coupon]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRetailerChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      retailer: e.target.value
    });
  };

  const validateForm = (): boolean => {
    console.log('Validating form with values:', {
      retailer: formData.retailer,
      initialValue: formData.initialValue,
      currentValue: formData.currentValue
    });
    
    const isValid = Boolean(formData.retailer && formData.initialValue && formData.currentValue);
    console.log('Form valid:', isValid);
    
    return isValid;
  };

  const handleCouponData = (): void => {
    if (coupon && coupon.id) {
      const formattedData = {
        ...formData,
        id: coupon.id,
        userId: coupon.userId,
        expirationDate: formData.expirationDate ? formData.expirationDate.toISOString().split('T')[0] : undefined
      };
      
      onUpdateCoupon(formattedData as Partial<Coupon>);
    } else {
      const formattedData: CouponFormData = {
        retailer: formData.retailer,
        initialValue: formData.initialValue,
        currentValue: formData.currentValue || formData.initialValue,
        expirationDate: formData.expirationDate ? formData.expirationDate.toISOString().split('T')[0] : undefined,
        notes: formData.notes,
        barcode: formData.barcode,
        reference: formData.reference,
        activationCode: formData.activationCode,
        pin: formData.pin
      };
      
      onAddCoupon(formattedData);
    }
  };

  const handleDateChange = (date: Date | null): void => {
    setFormData({
      ...formData,
      expirationDate: date
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (validateForm()) {
      handleCouponData();
      onClose();
    }
  };

  const toggleScanner = (): void => {
    setScannerOpen(!scannerOpen);
  };

  const handleScanSuccess = (scannedData: CouponData | string): void => {
    setScannerOpen(false);
    
    if (typeof scannedData === 'string') {
      setFormData({
        ...formData,
        barcode: scannedData
      });
    } else {
      const newFormData = {
        ...formData,
        retailer: scannedData.retailer || formData.retailer,
        initialValue: scannedData.initialValue?.toString() || formData.initialValue,
        currentValue: scannedData.currentValue?.toString() || scannedData.initialValue?.toString() || formData.currentValue
      };
      
      if (scannedData.expirationDate) {
        newFormData.expirationDate = new Date(scannedData.expirationDate);
      }
      
      if (scannedData.barcode) {
        newFormData.barcode = scannedData.barcode;
      }
      
      setFormData(newFormData);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="modal modal-open" role="dialog" aria-modal="true">
        <div className="modal-box max-w-2xl">
          <form onSubmit={handleSubmit} data-testid="coupon-form">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">
                {coupon && coupon.id ? t('actions.edit') : t('app.add_coupon')}
              </h3>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={toggleScanner}
              >
                <Scan className="w-4 h-4 mr-2" />
                {t('actions.scan_barcode')}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('form.retailer')} *</span>
                </label>
                <select
                  className="select select-bordered"
                  name="retailer"
                  value={formData.retailer}
                  onChange={handleRetailerChange}
                  required
                  data-testid="retailer-select"
                  aria-label={t('form.retailer')}
                >
                  <option value="">{t('form.select_retailer')}</option>
                  {retailerOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-4">
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">{t('form.initial_value')} *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-bordered"
                    name="initialValue"
                    value={formData.initialValue}
                    onChange={handleChange}
                    required
                    data-testid="initial-value-input"
                  />
                </div>
                
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">{t('form.current_value')} *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-bordered"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleChange}
                    required
                    data-testid="current-value-input"
                  />
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('form.expiration_date')}</span>
                </label>
                <div className="dropdown">
                  <div 
                    className="input input-bordered cursor-pointer flex items-center justify-between"
                    onClick={() => document.getElementById('date-picker-dropdown')?.classList.toggle('dropdown-open')}
                    data-testid="expiration-date-picker"
                  >
                    <span>
                      {formData.expirationDate 
                        ? formData.expirationDate.toLocaleDateString(language)
                        : t('form.select_date')
                      }
                    </span>
                  </div>
                  <div id="date-picker-dropdown" className="dropdown-content z-10 p-2 shadow bg-base-100 text-base-content rounded-box w-full">
                    <DayPicker
                      mode="single"
                      selected={formData.expirationDate || undefined}
                      onSelect={(date) => handleDateChange(date || null)}
                      required={false}
                      className="mx-auto"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">{t('form.activation_code')}</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    name="activationCode"
                    value={formData.activationCode}
                    onChange={handleChange}
                    data-testid="activation-code-input"
                  />
                </div>
                
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">{t('form.pin')}</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    data-testid="pin-input"
                  />
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('form.notes')}</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows={2}
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  data-testid="notes-textarea"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('form.barcode')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  name="barcode"
                  value={formData.barcode || ''}
                  onChange={handleChange}
                  data-testid="barcode-input"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('form.reference')}</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  name="reference"
                  value={formData.reference || ''}
                  onChange={handleChange}
                  data-testid="reference-input"
                />
              </div>
            </div>

            <div className="modal-action">
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={onClose}
                data-testid="coupon-cancel-button"
              >
                {t('actions.cancel')}
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                data-testid="coupon-submit-button"
              >
                {coupon && coupon.id ? t('actions.update') : t('actions.add')}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <BarcodeScanner
        open={scannerOpen}
        onClose={toggleScanner}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
};

export default AddCouponForm;