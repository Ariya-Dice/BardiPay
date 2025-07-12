// components/QRScanner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { PaymentInfo } from '../pages/buyer'; // ایمپورت اینترفیس PaymentInfo

export interface QRScannerProps {
  onScanComplete: (data: PaymentInfo) => void; // اصلاح نوع داده
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanComplete }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qrScanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    qrScanner.render(
      (data) => {
        try {
          const paymentInfo: PaymentInfo = JSON.parse(data); // افزودن نوع صریح
          onScanComplete(paymentInfo);
        } catch {
          setError('Error processing QR Code');
        }
      },
      (err) => {
        setError('Error scanning QR Code: ' + err);
      }
    );

    return () => {
      qrScanner.clear().catch((e) => console.warn('Failed to clear QR Scanner', e));
    };
  }, [onScanComplete]);

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
        id="qr-reader"
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