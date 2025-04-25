// pages/buyer.tsx
'use client';

import { useState, Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { QRScanner } from '../components/QRScanner';
import SparkleParticles from '../components/SparkleParticles';
import styles from '../styles/Buyer.module.css';

export interface PaymentInfo {
  amount: string;
  token: string;
  network: string;
  recipient: string;
  invoiceId: string;
}

const WalletConnection = dynamic<{ paymentInfo: PaymentInfo }>(
  () => import('../modules/walletConnection'),
  {
    ssr: false,
    loading: () => <p>Loading wallet connection...</p>,
  }
);

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className={styles.errorMessage}>
          Error: {this.state.errorMessage}
        </p>
      );
    }

    return this.props.children;
  }
}

export default function Buyer() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  return (
    <div className={styles.container}>
      <SparkleParticles />
      <h1 className={styles.title}>Customer Payment</h1>

      <QRScanner onScanComplete={setPaymentInfo} />

      {paymentInfo && (
        <div className={styles.paymentDetails}>
          <h3>Payment Details</h3>
          <p>
            Amount: {paymentInfo.amount} {paymentInfo.token}
          </p>
          <p>Network: {paymentInfo.network}</p>
          <p>Recipient: {paymentInfo.recipient}</p>
          <p>Invoice ID: {paymentInfo.invoiceId}</p>
        </div>
      )}

      {paymentInfo && (
        <ErrorBoundary>
          <WalletConnection paymentInfo={paymentInfo} />
        </ErrorBoundary>
      )}
    </div>
  );
}