'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../pages/Merchant.module.css';
import { generateQRCode } from '../modules/qrGenerator.js';
import { convertToCrypto } from '../modules/priceFetcher.js';
import { Wallets, currencies } from './types';
import { validateAddress } from '../components/validateAddress'; // ایمپورت تابع جدید

interface InvoiceCreatorProps {
  wallets: Wallets;
  setError: (error: string | null) => void;
  setResult: (result: {
    amountUSD: string;
    amountCrypto: string;
    token: string;
    network: string;
    invoiceId: string;
    qrCode: string;
    recipient: string;
  } | null) => void;
  result: {
    amountUSD: string;
    amountCrypto: string;
    token: string;
    network: string;
    invoiceId: string;
    qrCode: string;
    recipient: string;
  } | null;
}

export default function InvoiceCreator({ wallets, setError, setResult, result }: InvoiceCreatorProps) {
  const [formData, setFormData] = useState({ amountUSD: '', token: 'USDT', network: 'ethereum' });
  const [amountError, setAmountError] = useState<string | null>(null);

  const validateAmount = (value: string): boolean => {
    if (!value.trim()) {
      setAmountError('Amount cannot be empty');
      return false;
    }
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      setAmountError('Please enter a valid number');
      return false;
    }
    if (amount <= 0) {
      setAmountError('Amount must be greater than 0');
      return false;
    }
    if (amount > 5000000) {
      setAmountError('Amount cannot exceed 5,000,000 USD');
      return false;
    }
    const decimals = value.split('.')[1]?.length || 0;
    if (decimals > 2) {
      setAmountError('Amount can have up to 2 decimal places');
      return false;
    }
    setAmountError(null);
    return true;
  };

  const handleAmountChange = (value: string) => {
    setFormData({ ...formData, amountUSD: value });
    validateAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { amountUSD, token, network } = formData;
      if (!validateAmount(amountUSD)) {
        setError(amountError);
        return;
      }
      const recipient = wallets[network as keyof Wallets];
      // اعتبارسنجی آدرس کیف پول
      const { isValid, error } = validateAddress(network as keyof Wallets, recipient);
      if (!isValid) {
        setError(error || `Invalid wallet address for ${network}`);
        return;
      }
      const amountCrypto = await convertToCrypto(amountUSD, token);
      if (!amountCrypto || isNaN(amountCrypto) || amountCrypto <= 0) {
        setError('Error calculating cryptocurrency amount');
        return;
      }
      const invoiceId = Math.random().toString(36).slice(2, 10);
      const qrCode = await generateQRCode({ amount: amountCrypto.toString(), recipient, invoiceId, network, token });

      setResult({ amountUSD, amountCrypto: amountCrypto.toString(), token, network, invoiceId, qrCode, recipient });
      setError(null);
    } catch (err) {
      setError('Error generating QR code: ' + (err as Error).message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.formSection}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label className={styles.formLabel}>Amount (USD):</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="5000000"
              value={formData.amountUSD}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={`${styles.amountInput} ${amountError ? styles.inputError : ''}`}
              placeholder="Enter amount in USD"
              required
            />
            {amountError && <p className={styles.errorMessage}>{amountError}</p>}
          </div>
          <div>
            <label className={styles.formLabel}>Currency:</label>
            <select
              value={`${formData.token}-${formData.network}`}
              onChange={(e) => {
                const [token, network] = e.target.value.split('-');
                setFormData({ ...formData, token, network });
              }}
              className={styles.currencySelect}
            >
              {currencies.map((c, i) => (
                <option key={i} value={`${c.token}-${c.network}`}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={!!amountError} className={styles.submitButton}>
            Generate QR Code
          </button>
        </div>
      </form>

      {result && (
        <section className={styles.resultSection}>
          <h3 className={styles.resultTitle}>Payment Request</h3>
          <p className={styles.resultText}>Amount: {result.amountUSD} USD = {result.amountCrypto} {result.token}</p>
          <p className={styles.resultText}>Network: {result.network}</p>
          <p className={styles.resultText}>Recipient: {result.recipient}</p>
          <p className={styles.resultText}>Invoice ID: {result.invoiceId}</p>
          <Image src={result.qrCode} alt="QR Code" width={200} height={200} className={styles.qrCodeImage} />
        </section>
      )}
    </>
  );
}