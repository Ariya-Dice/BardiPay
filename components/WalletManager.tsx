'use client';

import { useState } from 'react';
import CoinIcons from './CoinIcons';
import { Wallets } from './types'; // مطمئن شو که type رو import کردی

interface WalletManagerProps {
  wallets: Wallets;
  onWalletChange: (network: keyof Wallets, address: string) => void;
}

export default function WalletManager({ wallets, onWalletChange }: WalletManagerProps) {
  const [inputAddress, setInputAddress] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const value = inputAddress.trim();
    if (!value) return;

    let detectedCoin: keyof Wallets | null = null;

    if (value.startsWith('1') || value.startsWith('3') || value.startsWith('bc1')) {
      detectedCoin = 'bitcoin';
    } else if (value.startsWith('0x') && value.length === 42) {
      detectedCoin = 'ethereum';
    } else if (value.startsWith('T')) {
      detectedCoin = 'tron';
    } else if (value.length === 44) {
      detectedCoin = 'solana';
    }

    if (detectedCoin) {
      onWalletChange(detectedCoin, value);
      // اگر ethereum باشد، bsc را هم ست کنیم
      if (detectedCoin === 'ethereum') {
        onWalletChange('bsc', value);
      }
      setInputAddress('');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter wallet address..."
          value={inputAddress}
          onChange={handleChange}
          style={{
            padding: '10px',
            width: '300px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            textAlign: 'center',
            marginBottom: '10px'
          }}
        />
        <button type="submit" style={{
          marginLeft: '10px',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          background: '#1a1a1a',
          color: 'white',
          cursor: 'pointer'
        }}>
          Add
        </button>
      </form>

      <CoinIcons wallets={wallets} />

      {Object.keys(wallets).some(key => wallets[key as keyof Wallets]) && (
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ color: '#fff', marginBottom: '10px' }}>Saved Wallets:</h4>
          <div style={{
            padding: '5px',
            display: 'inline-block',
            textAlign: 'left',
            maxWidth: '400px'
          }}>
            {Object.entries(wallets).map(([coin, addr]) => (
              addr ? (
                <div key={coin} style={{ marginBottom: '10px', fontSize: '0.6rem', color: 'red', wordBreak: 'break-word' }}>
                  <strong style={{ color: 'white' }}>{coin}:</strong> {addr}
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
