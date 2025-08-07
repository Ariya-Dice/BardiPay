// components/InvoiceCreator.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Merchant.module.css';
import { generateQRCode } from '../modules/qrGenerator';
import { convertToCrypto } from '../modules/priceFetcher';
import { Wallets, currencies } from './types';
import { validateAddress } from '../components/validateAddress';

// --- Helper functions moved outside the component ---
// They don't depend on component state, so they don't need to be recreated on every render.

const validateAmount = (value: string): { isValid: boolean; error: string | null } => {
  if (!value.trim()) return { isValid: false, error: 'Amount cannot be empty' };
  const amount = parseFloat(value);
  if (isNaN(amount)) return { isValid: false, error: 'Please enter a valid number' };
  if (amount <= 0) return { isValid: false, error: 'Amount must be greater than 0' };
  if (amount > 5_000_000) return { isValid: false, error: 'Amount cannot exceed 5,000,000 USD' };
  const decimals = value.split('.')[1]?.length || 0;
  if (decimals > 2) return { isValid: false, error: 'Amount can have up to 2 decimal places' };
  return { isValid: true, error: null };
};

const formatToFiveDecimals = (value: string | number): string => {
  const numberValue = parseFloat(value.toString());
  if (isNaN(numberValue)) return '0';
  // Use toFixed(5) and then remove trailing zeros and the decimal point if it's the last character
  return numberValue.toFixed(5).replace(/\.?0+$/, '');
};

const validateCryptoAmount = (amountCrypto: string, token: string): { isValid: boolean; error: string | null } => {
    const decimals = amountCrypto.split('.')[1]?.length || 0;
    if (decimals > 5) {
        return { isValid: false, error: `Amount in ${token} exceeds 5 decimal places` };
    }
    const amount = parseFloat(amountCrypto);
    if (amount <= 0 || isNaN(amount)) {
        return { isValid: false, error: `Invalid cryptocurrency amount for ${token}` };
    }
    return { isValid: true, error: null };
};

// --- Component Interface ---

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

// --- The React Component ---

export default function InvoiceCreator({ wallets, setError, setResult, result }: InvoiceCreatorProps) {
  const [formData, setFormData] = useState({ amountUSD: '', token: 'USDT', network: 'ethereum' });
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleAmountChange = (value: string) => {
    setFormData({ ...formData, amountUSD: value });
    const { error } = validateAmount(value);
    setAmountError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { isValid, error: amountValidationError } = validateAmount(formData.amountUSD);
    if (!isValid) {
      setError(amountValidationError);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { amountUSD, token, network } = formData;
      const recipient = wallets[network as keyof Wallets];

      const { isValid: isAddressValid, error: addressError } = validateAddress(network as keyof Wallets, recipient);
      if (!isAddressValid) {
        setError(addressError || `Invalid wallet address for ${network}`);
        return;
      }

      const amountCryptoRaw = await convertToCrypto(amountUSD, token);
      if (!amountCryptoRaw || isNaN(parseFloat(amountCryptoRaw))) {
        setError('Error calculating cryptocurrency amount');
        return;
      }
      
      const amountCrypto = formatToFiveDecimals(amountCryptoRaw);
      const { isValid: isCryptoAmountValid, error: cryptoAmountError } = validateCryptoAmount(amountCrypto, token);
      if (!isCryptoAmountValid) {
          setError(cryptoAmountError);
          return;
      }
      
      // Use a secure and standard way to generate a unique ID
      const invoiceId = crypto.randomUUID();

      const qrCode = await generateQRCode({
        amount: amountCrypto,
        recipient,
        invoiceId,
        network,
        token,
      });

      setResult({
        amountUSD,
        amountCrypto,
        token,
        network,
        invoiceId,
        qrCode,
        recipient,
      });
    } catch (err) {
      setError('Error generating QR code: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
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
              disabled={isGenerating}
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
              disabled={isGenerating}
            >
              {currencies.map((c) => (
                // Use a stable and unique key instead of the index
                <option key={`${c.token}-${c.network}`} value={`${c.token}-${c.network}`}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={!!amountError || isGenerating} className={styles.submitButton}>
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>
      </form>

      {result && (
        <section className={styles.resultSection}>
          <h3 className={styles.resultTitle}>Payment Request</h3>
          <p className={styles.resultText}>
            Amount: {result.amountUSD} USD = {result.amountCrypto} {result.token}
          </p>
          <p className={styles.resultText}>Network: {result.network}</p>
          <p className={styles.resultText}>Recipient: {result.recipient}</p>
          <p className={styles.resultText}>Invoice ID: {result.invoiceId}</p>
          <Image src={result.qrCode} alt="QR Code" width={200} height={200} className={styles.qrCodeImage} />
        </section>
      )}
    </>
  );
}