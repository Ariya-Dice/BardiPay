// components/WalletManager.tsx

'use client';

import { useState } from 'react';
import CoinIcons from './CoinIcons';
import { Wallets } from '../types'; // Corrected path
import { validateAddress } from '../components/validateAddress';
import styles from '../styles/WalletManager.module.css';

interface WalletManagerProps {
  wallets: Wallets;
  onWalletChange: (network: keyof Wallets, address: string) => void;
}

const networkDisplayNames: Record<keyof Wallets, string> = {
  ethereum: 'Ethereum',
  bsc: 'BSC (BNB Smart Chain)',
  tron: 'Tron',
  solana: 'Solana',
  bitcoin: 'Bitcoin',
};

// Define the order of networks for consistent processing
const supportedNetworks = Object.keys(networkDisplayNames) as Array<keyof Wallets>;

export default function WalletManager({ wallets, onWalletChange }: WalletManagerProps) {
  const [inputAddress, setInputAddress] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(e.target.value);
    // Clear previous error on new input
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const value = inputAddress.trim();
    if (!value) {
      setValidationError('Wallet address cannot be empty.');
      return;
    }

    // Special handling for EVM chains (ETH/BSC) since they share the same address format
    if (validateAddress('ethereum', value).isValid) {
      onWalletChange('ethereum', value);
      onWalletChange('bsc', value);
      setInputAddress('');
      return; // Address added, exit
    }

    // Check other networks
    for (const network of supportedNetworks) {
      // Skip EVM chains as they are already handled above
      if (network === 'ethereum' || network === 'bsc') {
        continue;
      }

      if (validateAddress(network, value).isValid) {
        onWalletChange(network, value);
        setInputAddress('');
        return; // Address added, exit
      }
    }

    // If no validation passed for any network
    setValidationError('Invalid address format or unsupported network.');
  };

  const handleRemove = (network: keyof Wallets) => {
    // Since ETH and BSC addresses are linked in our logic, removing one should remove both.
    if (network === 'ethereum' || network === 'bsc') {
      onWalletChange('ethereum', '');
      onWalletChange('bsc', '');
    } else {
      onWalletChange(network, '');
    }
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

      {/* Render the list of saved wallets */}
      {Object.values(wallets).some(address => !!address) && (
        <div className={styles.savedWalletsSection}>
          <h4 className={styles.savedWalletsTitle}>Saved Wallets:</h4>
          <div className={styles.savedWalletsList}>
            {supportedNetworks.map(coin => {
              const addr = wallets[coin];
              return addr ? (
                <div key={coin} className={styles.walletItem}>
                  <strong className={styles.walletNetworkName}>
                    {networkDisplayNames[coin] || coin}:
                  </strong>
                  <span className={styles.walletAddress}>{addr}</span>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemove(coin)}
                    aria-label={`Remove ${coin} wallet`}
                  >
                    &times;
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}