// components/WalletManager.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from '../pages/Merchant.module.css';
import { Wallets } from './types';
import { validateAddress } from '../components/validateAddress';

interface WalletManagerProps {
  wallets: Wallets;
  onWalletChange: (network: keyof Wallets, address: string) => void;
}

export default function WalletManager({ wallets, onWalletChange }: WalletManagerProps) {
  const [localWallets, setLocalWallets] = useState<Wallets>(wallets);
  const [errors, setErrors] = useState<Partial<Record<keyof Wallets, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Wallets, boolean>>>({});

  // اصلاح وابستگی‌های useEffect
  useEffect(() => {
    const saved = localStorage.getItem('merchantWallets');
    if (saved) {
      const parsed = JSON.parse(saved);
      setLocalWallets(parsed);
      Object.entries(parsed).forEach(([network, address]) => {
        onWalletChange(network as keyof Wallets, address as string);
      });
    }
  }, [onWalletChange]); // افزودن وابستگی

  // استفاده از useCallback برای بهینه‌سازی
  const handleChange = useCallback(
    (network: keyof Wallets, address: string) => {
      setLocalWallets((prev) => ({ ...prev, [network]: address }));
      setTouched((prev) => ({ ...prev, [network]: true }));

      if (address.trim()) {
        const { isValid, error } = validateAddress(network, address);
        setErrors((prev) => ({ ...prev, [network]: isValid ? undefined : error }));
      } else {
        setErrors((prev) => ({ ...prev, [network]: undefined }));
      }
      onWalletChange(network, address);
    },
    [onWalletChange]
  );

  const handleBlur = useCallback(
    (network: keyof Wallets, address: string) => {
      if (touched[network] && address.trim()) {
        const { isValid, error } = validateAddress(network, address);
        setErrors((prev) => ({ ...prev, [network]: isValid ? undefined : error }));
      }
    },
    [touched]
  );

  return (
    <section className={styles.walletSection}>
      <h2 className={styles.walletSectionTitle}>Wallet Addresses</h2>
      {(['ethereum', 'bsc', 'tron', 'solana', 'bitcoin'] as (keyof Wallets)[]).map((network) => (
        <div key={network} className={styles.walletInputContainer}>
          <label className={styles.walletLabel}>
            <Image
              src={`/${network}.png`}
              alt={`${network} icon`}
              width={24}
              height={24}
            />
            <span className={styles.walletNetworkName}>
              {network.charAt(0).toUpperCase() + network.slice(1)} Address:
            </span>
          </label>
          <input
            type="text"
            placeholder={`${network} address...`}
            value={localWallets[network]}
            onChange={(e) => handleChange(network, e.target.value)}
            onBlur={(e) => handleBlur(network, e.target.value)}
            className={`${styles.walletInput} ${touched[network] && errors[network] ? styles.inputError : ''}`}
          />
          {touched[network] && errors[network] && (
            <p className={styles.errorMessage}>{errors[network]}</p>
          )}
        </div>
      ))}
    </section>
  );
}