'use client';

import { useState, useCallback } from 'react';
import styles from '../styles/Merchant.module.css';
import SparkleParticles from '../components/SparkleParticles';
import WalletManager from '../components/WalletManager';
import InvoiceCreator from '../components/InvoiceCreator';
import TransactionTracker from '../components/TransactionTracker';
import { Wallets } from '../components/types';
import { useEffect } from 'react';

export default function Merchant() {
  const [wallets, setWallets] = useState<Wallets>({
    ethereum: '',
    bsc: '',
    tron: '',
    solana: '',
    bitcoin: '',
  });
  const [result, setResult] = useState<{
    amountUSD: string;
    amountCrypto: string;
    token: string;
    network: string;
    invoiceId: string;
    qrCodeData: string;
    recipient: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('merchantWallets');
      if (saved) {
        const parsed = JSON.parse(saved) as Wallets;
        setWallets(prev => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.error('Failed to load wallets from localStorage:', err);
      setError('Failed to load wallets from localStorage.');
    }
  }, []);

  const handleWalletChange = useCallback((network: keyof Wallets, address: string) => {
    const updated = { ...wallets };

    if (network === 'ethereum' || network === 'bsc') {
      updated['ethereum'] = address;
      updated['bsc'] = address;
    } else {
      updated[network] = address;
    }

    setWallets(updated);

    try {
      localStorage.setItem('merchantWallets', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save wallets to localStorage:', err);
      setError('Failed to save wallets to localStorage.');
    }
  }, [wallets]);

  return (
    <div className={styles.container}>
      <SparkleParticles />
      <div className={styles.content}>
        <h1 className={styles.title}>Merchant Dashboard</h1>
        <WalletManager wallets={wallets} onWalletChange={handleWalletChange} />
        <InvoiceCreator wallets={wallets} setError={setError} setResult={setResult} result={result} />
        <TransactionTracker
          wallets={wallets}
          network={result?.network || 'ethereum'}
          setError={setError}
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
}
