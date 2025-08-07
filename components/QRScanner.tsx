// components/QRScanner.tsx
'use client';

import React, { useState, useEffect, useId } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { PaymentInfo } from '../pages/buyer';

export interface QRScannerProps {
  // IMPORTANT: This function should be wrapped in `useCallback` in the parent component
  // to prevent the scanner from re-initializing on every parent render.
  onScanComplete: (data: PaymentInfo) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanComplete }) => {
  const [error, setError] = useState<string | null>(null);
  // Generate a unique ID for the scanner element to avoid conflicts
  const qrReaderId = useId();

  useEffect(() => {
    const qrScanner = new Html5QrcodeScanner(
      qrReaderId, // Use the unique ID here
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false // verbose mode
    );

    const handleSuccess = (decodedText: string) => {
      try {
        const paymentInfo: PaymentInfo = JSON.parse(decodedText);
        // Clear any previous errors on successful scan
        setError(null);
        onScanComplete(paymentInfo);
      } catch (e) {
        setError('Error: Scanned QR Code has invalid data format.');
      }
    };

    const handleError = (errorMessage: string) => {
      // We can ignore some common, non-critical errors if needed
      // For now, we'll just log them without setting a visible error state
      console.warn('QR Scanner Error:', errorMessage);
    };

    // Start rendering the scanner
    qrScanner.render(handleSuccess, handleError);

    // Cleanup function to clear the scanner when the component unmounts
    return () => {
      // It's important to check if the scanner is still active before clearing
      if (qrScanner && qrScanner.getState() !== 2 /* SCANNING_STATE.NOT_STARTED */) {
          qrScanner.clear().catch((e) => console.error('Failed to clear QR Scanner', e));
      }
    };
  }, [onScanComplete, qrReaderId]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      margin: '0 auto',
    }}>
      <div
        id={qrReaderId} // And also use the unique ID here
        style={{
          width: '100%',
          maxWidth: '400px',
          border: '2px solid #ccc',
          borderRadius: '8px',
          padding: '10px',
        }}
      />
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};