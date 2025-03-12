import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Autocomplete } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import BarcodeScanner from './BarcodeScanner';
import { useLanguage } from '../services/LanguageContext';
import { Coupon, CouponData, CouponFormData } from '../types';
import { enUS, es, fr, de } from 'date-fns/locale';

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

const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
  fr: fr,
  de: de
};

const AddCouponForm: React.FC<AddCouponFormProps> = ({ 
  open, 
  onClose, 
  onAddCoupon, 
  onUpdateCoupon, 
  coupon, 
  coupons = [] 
}) => {
  const { t, language } = useLanguage();
  // Extract unique retailer names for autocomplete suggestions
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
      // Convert string date to Date object if necessary
      const expirationDate = coupon.expirationDate 
        ? new Date(coupon.expirationDate) 
        : null;
      
      // Convert from Coupon to FormState
      setFormData({
        ...coupon,
        expirationDate,
        // Add any missing properties from initialFormState that aren't in Coupon
        activationCode: coupon.activationCode || '',
        pin: coupon.pin || ''
      });
    } else {
      // For development/testing purposes, pre-fill with example values
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRetailerChange = (_event: React.SyntheticEvent, newValue: string | null): void => {
    setFormData({
      ...formData,
      retailer: newValue || ''
    });
  };

  const validateForm = (): boolean => {
    // Debug log for form validation
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
    // If we are updating an existing coupon
    if (coupon && coupon.id) {
      // Format date for API
      const formattedData = {
        ...formData,
        id: coupon.id,
        userId: coupon.userId, // Make sure we include the userId from the original coupon
        expirationDate: formData.expirationDate ? formData.expirationDate.toISOString().split('T')[0] : undefined
      };
      
      // Cast to Partial<Coupon> since we're allowing partial updates
      onUpdateCoupon(formattedData as Partial<Coupon>);
    } else {
      // We are adding a new coupon
      // Format date for API
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
    // Close the scanner
    setScannerOpen(false);
    
    // Handle the scanned data
    if (typeof scannedData === 'string') {
      // If it's just a barcode string
      setFormData({
        ...formData,
        barcode: scannedData
      });
    } else {
      // It's a coupon object with data
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {coupon && coupon.id ? t('actions.edit') : t('app.add_coupon')}
        <Button
          variant="outlined"
          startIcon={<QrCodeScannerIcon />}
          onClick={toggleScanner}
          sx={{ float: 'right' }}
        >
          {t('actions.scan_barcode')}
        </Button>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              freeSolo
              options={retailerOptions}
              value={formData.retailer}
              onChange={handleRetailerChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label={t('form.retailer')}
                  name="retailer"
                  onChange={handleChange}
                />
              )}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label={t('form.initial_value')}
                name="initialValue"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={formData.initialValue}
                onChange={handleChange}
              />
              
              <TextField
                required
                fullWidth
                label={t('form.current_value')}
                name="currentValue"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={formData.currentValue}
                onChange={handleChange}
              />
            </Box>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeMap[language]}>
              <DatePicker
                label={t('form.expiration_date')}
                value={formData.expirationDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
            </LocalizationProvider>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label={t('form.activation_code')}
                name="activationCode"
                value={formData.activationCode}
                onChange={handleChange}
              />
              
              <TextField
                fullWidth
                label={t('form.pin')}
                name="pin"
                value={formData.pin}
                onChange={handleChange}
              />
            </Box>
            
            <TextField
              fullWidth
              label={t('form.notes')}
              name="notes"
              multiline
              rows={2}
              value={formData.notes || ''}
              onChange={handleChange}
            />
            
            <TextField
              fullWidth
              label={t('form.barcode')}
              name="barcode"
              value={formData.barcode || ''}
              onChange={handleChange}
            />
            
            <TextField
              fullWidth
              label={t('form.reference')}
              name="reference"
              value={formData.reference || ''}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('actions.cancel')}</Button>
          <Button type="submit" variant="contained">
            {coupon && coupon.id ? t('actions.update') : t('actions.add')}
          </Button>
        </DialogActions>
      </form>
      
      <BarcodeScanner
        open={scannerOpen}
        onClose={toggleScanner}
        onScanSuccess={handleScanSuccess}
      />
    </Dialog>
  );
};

export default AddCouponForm; 