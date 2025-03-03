import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';
import { QrReader } from 'react-qr-reader';

const BarcodeScanner = ({ open, onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data) {
      try {
        // Try to parse the QR code data as JSON
        // Replace single quotes with double quotes for proper JSON parsing
        const formattedData = data.replace(/'/g, '"');
        const parsedData = JSON.parse(formattedData);
        
        // Validate that we have the required fields
        if (!parsedData.retailer || !parsedData.initialValue || !parsedData.expirationDate) {
          setError('Invalid QR code format: missing required fields');
          return;
        }
        
        // Pass the parsed data to the parent component
        onScanSuccess(parsedData);
        
        // Close the dialog
        onClose();
      } catch (err) {
        setError('Invalid QR code format: could not parse data');
      }
    }
  };

  const handleError = (err) => {
    setError(`Error accessing camera: ${err}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan Coupon</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            Position the QR code within the scanner frame to automatically capture coupon details.
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
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            QR codes should contain coupon details in JSON format including retailer, value, and expiration date.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner;