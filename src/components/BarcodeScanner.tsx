import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';
import { QrReader } from 'react-qr-reader';
import { useLanguage } from '../services/LanguageContext';
import { Coupon, CouponData } from '../types';

interface ScanResult {
  text?: string;
}

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (data: CouponData | string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ open, onClose, onScanSuccess }) => {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);

  const handleResult = (result: any, error: any) => {
    if (error) {
      setError(`${t('errors.error_accessing_camera')}: ${error.message || error}`);
      return;
    }
    
    if (result) {
      const data = result?.text;
      
      if (data) {
        try {
          // Try to parse the QR code data as JSON
          // Replace single quotes with double quotes for proper JSON parsing
          const formattedData = data.replace(/'/g, '"');
          
          try {
            // Try to parse as JSON first
            const parsedData = JSON.parse(formattedData) as CouponData;
            
            // Validate that we have the required fields
            if (!parsedData.retailer || !parsedData.initialValue) {
              setError(t('errors.invalid_qr_format'));
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
          setError(t('errors.invalid_qr_format'));
        }
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('actions.scan_barcode')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            {t('dialog.barcode_scanning_instruction')}
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleResult}
              scanDelay={300}
              videoStyle={{ width: '100%' }}
              videoId="qr-video"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner; 