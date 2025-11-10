'use client';

import { useState } from 'react';
import CoinIcons from './CoinIcons';
import { Wallets } from './types';
import { validateAddress } from '../components/validateAddress';
import styles from '../styles/WalletManager.module.css';

interface WalletManagerProps {
  wallets: Wallets;
  onWalletChange: (network: keyof Wallets, address: string) => void;
}

const networkDisplayNames: Record<keyof Wallets, string> = {
  ethereum: 'Ethereum',
  bsc: 'BSC',
  tron: 'Tron',
  solana: 'Solana',
  bitcoin: 'Bitcoin',
};

export default function WalletManager({ wallets, onWalletChange }: WalletManagerProps) {
  const [inputAddress, setInputAddress] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(e.target.value);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const value = inputAddress.trim();
    if (!value) {
      setValidationError('Wallet address cannot be empty.');
      return;
    }

    let detectedNetwork: keyof Wallets | null = null;
    let validationSuccess = false;

    for (const networkKey of Object.keys(wallets) as Array<keyof Wallets>) {
      const validationResult = validateAddress(networkKey, value);
      if (validationResult.isValid) {
        detectedNetwork = networkKey;
        validationSuccess = true;
        break;
      }
    }

    if (validationSuccess && detectedNetwork) {
      onWalletChange(detectedNetwork, value);
      if (detectedNetwork === 'ethereum') {
        onWalletChange('bsc', value);
      }
      setInputAddress('');
    } else {
      setValidationError('Invalid address format or unsupported network.');
    }
  };

  const handleRemove = (network: keyof Wallets) => {
    onWalletChange(network, '');
  };

  return (
    <div className={styles.walletManagerContainer}>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputWithButtonContainer}>
          <input
            type="text"
            placeholder="Enter wallet address..."
            value={inputAddress}
            onChange={handleChange}
            className={styles.inputField}
          />
          <button type="submit" className={styles.addButton}>Add</button>
        </div>
      </form>

      {validationError && <p className={styles.errorMessage}>{validationError}</p>}

      <CoinIcons wallets={wallets} />

      {Object.keys(wallets).some(key => wallets[key as keyof Wallets]) && (
        <div className={styles.savedWalletsSection}>
          <h4 className={styles.savedWalletsTitle}>Saved Wallets:</h4>
          <div className={styles.savedWalletsList}>
            {Object.entries(wallets).map(([coin, addr]) =>
              addr ? (
                <div key={coin} className={styles.walletItem}>
                  <strong className={styles.walletNetworkName}>
                    {networkDisplayNames[coin as keyof Wallets] || coin}:
                  </strong>
                  {addr}
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemove(coin as keyof Wallets)}
                    aria-label={`Remove ${coin} wallet`}
                  >
                    ×
                  </button>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
