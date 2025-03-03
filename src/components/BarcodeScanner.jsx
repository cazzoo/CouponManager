import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';
import { QrReader } from 'react-qr-reader';
import { useLanguage } from '../services/LanguageContext';

const BarcodeScanner = ({ open, onClose, onScanSuccess }) => {
  const { t } = useLanguage();
  const [error, setError] = useState(null);

  const handleScan = (result) => {
    if (result) {
      // For the latest react-qr-reader, result might be in a different format
      const data = result?.text || result;
      
      if (data) {
        try {
          // Try to parse the QR code data as JSON
          // Replace single quotes with double quotes for proper JSON parsing
          const formattedData = data.replace(/'/g, '"');
          
          try {
            // Try to parse as JSON first
            const parsedData = JSON.parse(formattedData);
            
            // Validate that we have the required fields
            if (!parsedData.retailer || !parsedData.initialValue) {
              setError('Invalid QR code format: missing required fields');
              return;
            }
            
            // Pass the parsed data to the parent component
            onScanSuccess(parsedData);
          } catch (jsonErr) {
            // If not valid JSON, just pass the raw string (might be a barcode)
            onScanSuccess(data);
          }
          
          // Close the dialog
          onClose();
        } catch (err) {
          setError('Invalid code format: could not process data');
        }
      }
    }
  };

  const handleError = (err) => {
    setError(`${t('error_accessing_camera')}: ${err}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('scan_barcode')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            Position the barcode within the scanner frame to automatically capture coupon details.
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
              facingMode="environment"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner;