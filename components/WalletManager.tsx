'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import styles from '../styles/Merchant.module.css';
import { Wallets } from './types';
import { validateAddress } from '../components/validateAddress';

interface WalletManagerProps {
  wallets: Wallets;
  onWalletChange: (network: keyof Wallets, address: string) => void;
}

const NETWORKS: (keyof Wallets)[] = ['ethereum', 'bsc', 'tron', 'solana', 'bitcoin'];

export default function WalletManager({ wallets, onWalletChange }: WalletManagerProps) {
  const [localWallets, setLocalWallets] = useState<Wallets>(wallets);
  const [errors, setErrors] = useState<Partial<Record<keyof Wallets, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Wallets, boolean>>>({});
  const [rotation, setRotation] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('merchantWallets');
      if (saved) {
        const parsed = JSON.parse(saved);
        const validWallets: Wallets = { ...wallets, ...parsed };
        setLocalWallets(validWallets);
        Object.entries(validWallets).forEach(([network, address]) => {
          if (address) onWalletChange(network as keyof Wallets, address as string);
        });
      }
    } catch (error) {
      console.error('Failed to load wallets from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (containerRef.current?.matches(':hover')) {
        setRotation((prev) => prev + e.deltaY * 0.5);
      }
    };
    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('merchantWallets', JSON.stringify(localWallets));
    } catch (error) {
      console.error('Failed to save wallets to localStorage:', error);
    }
  }, [localWallets]);

  const handleChange = (network: keyof Wallets, address: string) => {
    setLocalWallets((prev) => ({ ...prev, [network]: address }));
    setTouched((prev) => ({ ...prev, [network]: true }));

    if (address.trim()) {
      const { isValid, error } = validateAddress(network, address);
      setErrors((prev) => ({ ...prev, [network]: isValid ? undefined : error || `Invalid ${network} address` }));
      if (isValid) onWalletChange(network, address);
    } else {
      setErrors((prev) => ({ ...prev, [network]: undefined }));
      onWalletChange(network, address);
    }
  };

  const handleBlur = (network: keyof Wallets, address: string) => {
    if (touched[network] && address.trim()) {
      const { isValid, error } = validateAddress(network, address);
      setErrors((prev) => ({ ...prev, [network]: isValid ? undefined : error || `Invalid ${network} address` }));
    }
  };

  const cardElements = useMemo(() => {
    const radius = 200;
    const angleStep = (2 * Math.PI) / NETWORKS.length;

    return NETWORKS.map((network, index) => {
      const angle = index * angleStep + (rotation * Math.PI) / 180;
      const x = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);
      const opacity = 0.7 + 0.3 * Math.cos(angle);

      return (
        <div
          key={network}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '300px',
            padding: '20px',
            transform: `translate3d(-50%, -50%, ${z}px) translateX(${x}px)`,
            background: `rgba(30, 30, 40, ${opacity})`,
            opacity,
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <label className={styles.walletLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image
              src={`/${network}.png`}
              alt={`${network} icon`}
              width={24}
              height={24}
              onError={(e) => {
                e.currentTarget.src = '/fallback.png';
              }}
            />
            <span className={styles.walletNetworkName}>
              {network.charAt(0).toUpperCase() + network.slice(1)} Address:
            </span>
          </label>
          <input
            type="text"
            placeholder={`Enter ${network} address...`}
            value={localWallets[network] || ''}
            onChange={(e) => handleChange(network, e.target.value)}
            onBlur={(e) => handleBlur(network, e.target.value)}
            className={`${styles.walletInput} ${touched[network] && errors[network] ? styles.inputError : ''}`}
            style={{ width: '100%' }}
          />
          {touched[network] && errors[network] && (
            <p className={styles.errorMessage}>{errors[network]}</p>
          )}
        </div>
      );
    });
  }, [rotation, localWallets, touched, errors]);

  return (
    <section className={styles.walletSection}>
      <h2 className={styles.walletSectionTitle}>Wallet Addresses</h2>
      <div
        ref={containerRef}
        style={{
          perspective: '1000px',
          height: '400px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            height: '100%',
            width: '100%',
            position: 'relative',
            transition: 'transform 0.1s linear',
          }}
        >
          {cardElements}
        </div>
      </div>
    </section>
  );
}
