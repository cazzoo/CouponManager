import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Autocomplete } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import BarcodeScanner from './BarcodeScanner';
import { useLanguage } from '../services/LanguageContext';

const AddCouponForm = ({ open, onClose, onAddCoupon, onUpdateCoupon, coupon, coupons = [] }) => {
  const { t } = useLanguage();
  // Extract unique retailer names for autocomplete suggestions
  const retailerOptions = coupons.length > 0 ? [...new Set(coupons.map(c => c.retailer))] : [];
  const initialFormState = {
    retailer: '',
    initialValue: '',
    currentValue: '',
    expirationDate: null,
    activationCode: '',
    pin: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData(coupon);
    } else {
      setFormData(initialFormState);
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRetailerChange = (event, newValue) => {
    setFormData({
      ...formData,
      retailer: newValue || ''
    });
  };

  const validateForm = () => {
    return formData.retailer && formData.initialValue && formData.currentValue;
  };

  const handleCouponData = () => {
    // If we are updating an existing coupon
    if (coupon && coupon.id) {
      onUpdateCoupon({
        ...formData,
        id: coupon.id
      });
    } else {
      // We are adding a new coupon
      onAddCoupon({
        ...formData,
        initialValue: formData.initialValue,
        currentValue: formData.currentValue || formData.initialValue
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      expirationDate: date
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    handleCouponData();
  };

  const toggleScanner = () => {
    setScannerOpen(!scannerOpen);
  };

  const handleScanSuccess = (scannedData) => {
    // Simple implementation - assuming scanned data is barcode
    // You may want more sophisticated parsing based on your barcode format
    const updatedFormData = {
      ...formData,
      activationCode: scannedData
    };
    setFormData(updatedFormData);
    setScannerOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {coupon ? t('edit') : t('add_coupon')}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Autocomplete
              freeSolo
              options={retailerOptions}
              value={formData.retailer}
              onChange={handleRetailerChange}
              onInputChange={(event, newInputValue) => {
                if (event) {
                  setFormData({
                    ...formData,
                    retailer: newInputValue
                  });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="normal"
                  required
                  fullWidth
                  id="retailer"
                  label={t('retailer')}
                  name="retailer"
                />
              )}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="initialValue"
              label={t('initial_value')}
              name="initialValue"
              value={formData.initialValue}
              onChange={handleChange}
              inputProps={{ inputMode: 'decimal' }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="currentValue"
              label={t('current_value')}
              name="currentValue"
              value={formData.currentValue || formData.initialValue}
              onChange={handleChange}
              inputProps={{ inputMode: 'decimal' }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t('expiration_date')}
                value={formData.expirationDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField {...params} margin="normal" fullWidth />
                )}
              />
            </LocalizationProvider>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                id="activationCode"
                label={t('activation_code')}
                name="activationCode"
                value={formData.activationCode}
                onChange={handleChange}
              />
              <Button 
                variant="outlined" 
                sx={{ mt: 1, minWidth: 'auto', height: 56 }}
                onClick={toggleScanner}
              >
                <QrCodeScannerIcon />
              </Button>
            </Box>
            <TextField
              margin="normal"
              fullWidth
              id="pin"
              label={t('pin')}
              name="pin"
              value={formData.pin}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            disabled={!validateForm()}
          >
            {coupon ? t('save') : t('add_coupon')}
          </Button>
        </DialogActions>
      </Dialog>
      <BarcodeScanner
        open={scannerOpen}
        onClose={toggleScanner}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
};

export default AddCouponForm;