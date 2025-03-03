import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Autocomplete } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import BarcodeScanner from './BarcodeScanner';

const AddCouponForm = ({ open, onClose, onAddCoupon, onUpdateCoupon, coupon, coupons = [] }) => {
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
    
    if (name === 'currentValue') {
      // Ensure currentValue doesn't exceed initialValue
      const initialVal = parseFloat(formData.initialValue);
      const currentVal = parseFloat(value);
      
      if (!isNaN(initialVal) && !isNaN(currentVal) && currentVal > initialVal) {
        // If currentValue exceeds initialValue, set it to initialValue
        setFormData(prev => ({
          ...prev,
          currentValue: String(initialVal)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          currentValue: String(value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'initialValue' ? String(value) : value
      }));

      // When adding a new coupon and initialValue changes, update currentValue to match
      if (!coupon && name === 'initialValue') {
        setFormData(prev => ({
          ...prev,
          currentValue: String(value)
        }));
      }
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      expirationDate: date
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.retailer || !formData.initialValue || !formData.currentValue || !formData.expirationDate) {
      return;
    }
    if (coupon) {
      onUpdateCoupon({ ...formData, id: coupon.id });
    } else {
      onAddCoupon(formData);
    }
    setFormData({
      retailer: '',
      initialValue: '',
      currentValue: '',
      expirationDate: null,
      activationCode: '',
      pin: ''
    });
  };

  const handleScanSuccess = (scannedData) => {
    // Update form with scanned data
    setFormData(prev => ({
      ...prev,
      retailer: scannedData.retailer || prev.retailer,
      initialValue: scannedData.initialValue || prev.initialValue,
      currentValue: scannedData.initialValue || prev.currentValue, // Set current value to initial value for new coupons
      expirationDate: scannedData.expirationDate ? new Date(scannedData.expirationDate) : prev.expirationDate,
      activationCode: scannedData.activationCode || prev.activationCode,
      pin: scannedData.pin || prev.pin
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{coupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Autocomplete
          freeSolo
          options={retailerOptions}
          value={formData.retailer}
          onChange={(event, newValue) => {
            setFormData(prev => ({
              ...prev,
              retailer: newValue || ''
            }));
          }}
          onInputChange={(event, newInputValue) => {
            setFormData(prev => ({
              ...prev,
              retailer: newInputValue || ''
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              label="Retailer"
              name="retailer"
              placeholder="Type or select a retailer"
            />
          )}
        />
        <TextField
          required
          label="Initial Value"
          name="initialValue"
          type="number"
          value={formData.initialValue}
          onChange={handleChange}
          InputProps={{
            startAdornment: '$',
            readOnly: !!coupon // Make read-only if editing an existing coupon
          }}
          helperText={coupon ? "Initial value cannot be changed after creation" : ""}
        />
        <TextField
          required
          label="Current Value"
          name="currentValue"
          type="number"
          value={formData.currentValue}
          onChange={handleChange}
          InputProps={{
            startAdornment: '$'
          }}
          helperText={`Current value cannot exceed initial value ($${formData.initialValue})`}
          error={parseFloat(formData.currentValue) > parseFloat(formData.initialValue)}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Expiration Date"
            value={formData.expirationDate}
            onChange={handleDateChange}
            slotProps={{ textField: { required: true } }}
          />
        </LocalizationProvider>
        <TextField
          label="Activation Code"
          name="activationCode"
          value={formData.activationCode}
          onChange={handleChange}
        />
        <TextField
          label="PIN"
          name="pin"
          value={formData.pin}
          onChange={handleChange}
        />
      </Box>
      </DialogContent>
      <DialogActions>
        {!coupon && (
          <Button 
            startIcon={<QrCodeScannerIcon />} 
            onClick={() => setScannerOpen(true)}
            color="secondary"
          >
            Scan QR Code
          </Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {coupon ? 'Update' : 'Add'} Coupon
        </Button>
      </DialogActions>
      
      {/* Barcode Scanner Dialog */}
      <BarcodeScanner 
        open={scannerOpen} 
        onClose={() => setScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />
    </Dialog>
  );
};

export default AddCouponForm;