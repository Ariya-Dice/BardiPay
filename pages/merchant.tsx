// pages/merchant.tsx
'use client';

import { useState } from 'react';
import styles from './Merchant.module.css';
import SparkleParticles from '../components/SparkleParticles';
import WalletManager from '../components/WalletManager';
import InvoiceCreator from '../components/InvoiceCreator';
import TransactionTracker from '../components/TransactionTracker';
import { Wallets } from '../components/types'; // اصلاح مسیر به ../components/types

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
    qrCode: string;
    recipient: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Persist wallet changes
  const handleWalletChange = (network: keyof Wallets, address: string) => {
    const updated = { ...wallets, [network]: address };
    setWallets(updated);
    localStorage.setItem('merchantWallets', JSON.stringify(updated));
  };

  return (
    <div className={styles.container}>
      <SparkleParticles />
      <div className={styles.content}>
        <h1 className={styles.title}>Merchant Dashboard</h1>
        <WalletManager wallets={wallets} onWalletChange={handleWalletChange} />
        <InvoiceCreator wallets={wallets} setError={setError} setResult={setResult} result={result} />
        <TransactionTracker wallets={wallets} network={result?.network || 'ethereum'} setError={setError} />
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
}