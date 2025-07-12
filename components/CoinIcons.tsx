'use client';

import BitcoinIcon from './icons/Bitcoin';
import EthereumIcon from './icons/Ethereum';
import BSCIcon from './icons/BSC';
import TronIcon from './icons/Tron';
import SolanaIcon from './icons/Solana';
import { Wallets } from './types'; // نوع Wallets را وارد کنید

interface CoinIconsProps {
  wallets: Wallets; // تغییر نوع به Wallets
}

export default function CoinIcons({ wallets }: CoinIconsProps) {
  const icons = [
    { name: 'bitcoin', Component: BitcoinIcon },
    { name: 'ethereum', Component: EthereumIcon },
    { name: 'bsc', Component: BSCIcon },
    { name: 'tron', Component: TronIcon },
    { name: 'solana', Component: SolanaIcon },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px', gap: '1px' }}>
      {icons.map(({ name, Component }) => {
        const isActive = !!wallets[name as keyof Wallets]; // استفاده از type assertion
        return (
          <div key={name} style={{ textAlign: 'center', width: '90px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                margin: '0 auto',
                filter: isActive ? 'none' : 'grayscale(100%) opacity(0.5)',
                transition: 'filter 0.3s ease',
              }}
            >
              <Component active={isActive} />
            </div>
          </div>
        );
      })}
    </div>
  );
}