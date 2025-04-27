// components/types.ts

export interface Wallets {
  ethereum: string;
  bsc: string;
  tron: string;
  solana: string;
  bitcoin: string;
}
export interface EventData {
  token: string;
  amount: string;
  from: string;
  to: string;
  invoiceId?: string;
  txHash: string;
  network: string;
}

export interface SearchResult {
  token: string;
  amount: string;
  from: string;
  to: string;
  invoiceId?: string;
  txHash: string;
  network: string;
}

export const currencies = [
  { token: 'ETH', network: 'ethereum', name: 'Ethereum (ETH)' },
  { token: 'BTC', network: 'bitcoin', name: 'Bitcoin (BTC)' },
  { token: 'SOL', network: 'solana', name: 'Solana (SOL)' },
  { token: 'BNB', network: 'bsc', name: 'Binance Coin (BNB)' },
  { token: 'BUSD', network: 'bsc', name: 'Binance USD (BUSD)' },
  { token: 'USDT', network: 'ethereum', name: 'Tether (USDT - Ethereum)' },
  { token: 'USDT', network: 'tron', name: 'Tether (USDT - Tron)' },
  { token: 'USDC', network: 'ethereum', name: 'USD Coin (USDC - Ethereum)' },
  { token: 'USDC', network: 'solana', name: 'USD Coin (USDC - Solana)' },
  { token: 'DAI', network: 'ethereum', name: 'Dai (DAI)' },
  { token: 'LINK', network: 'ethereum', name: 'Chainlink (LINK)' },
  { token: 'CAKE', network: 'bsc', name: 'PancakeSwap (CAKE)' },
  { token: 'TWT', network: 'bsc', name: 'Trust Wallet Token (TWT)' },
  { token: 'ALICE', network: 'bsc', name: 'My Neighbor Alice (ALICE)' },
  { token: 'BAND', network: 'ethereum', name: 'Band Protocol (BAND)' },
  { token: 'TRX', network: 'tron', name: 'Tron (TRX)' },
  { token: 'BTT', network: 'tron', name: 'BitTorrent (BTT)' },
  { token: 'JST', network: 'tron', name: 'JUST (JST)' },
  { token: 'SUN', network: 'tron', name: 'Sun Token (SUN)' },
  { token: 'RAY', network: 'solana', name: 'Raydium (RAY)' },
  { token: 'SRM', network: 'solana', name: 'Serum (SRM)' },
  { token: 'ORCA', network: 'solana', name: 'Orca (ORCA)' },
] as const;

export type SupportedCurrency = typeof currencies[number];
