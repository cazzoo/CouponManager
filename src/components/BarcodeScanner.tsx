import React, { useState } from 'react';
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

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg" data-testid="dialog-title">
          {t('actions.scan_barcode')}
        </h3>
        
        <div className="py-4">
          <div className="flex flex-col items-center mt-2">
            {error && (
              <div className="alert alert-error mb-2 w-full" role="alert" data-testid="error-alert">
                <span>{error}</span>
              </div>
            )}
            
            <p className="text-sm text-base-content/70 mb-2 text-center" data-testid="scanning-instruction">
              {t('dialog.barcode_scanning_instruction')}
            </p>
            
            <div className="w-full max-w-md mx-auto">
              <QrReader
                constraints={{ facingMode: 'environment' }}
                onResult={handleResult}
                scanDelay={300}
                videoStyle={{ width: '100%' }}
                videoId="qr-video"
              />
            </div>
          </div>
        </div>
        
        <div className="modal-action">
          <button 
            className="btn btn-ghost" 
            onClick={onClose}
            data-testid="cancel-button"
          >
            {t('actions.cancel')}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default BarcodeScanner; 