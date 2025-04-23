// types.ts
export interface EventData {
  token: string;
  amount: string;
  from: string;
  to: string;
  invoiceId: string | null;
  txHash: string;
  network: string;
  timestamp: number;
}

export interface SearchResult {
  token: string;
  amount: string;
  from: string;
  to: string;
  invoiceId: string | null;
  txHash: string;
  network: string;
}

export interface Wallets {
  ethereum: string;
  bsc: string;
  tron: string;
  solana: string;
  bitcoin: string;
}

export const currencies = [
  { name: 'ETH (Ethereum)', network: 'ethereum', token: 'ETH' },
  { name: 'USDT (Ethereum)', network: 'ethereum', token: 'USDT' },
  { name: 'BNB (BSC)', network: 'bsc', token: 'BNB' },
  { name: 'TRX (Tron)', network: 'tron', token: 'TRX' },
  { name: 'SOL (Solana)', network: 'solana', token: 'SOL' },
  { name: 'BTC (Bitcoin)', network: 'bitcoin', token: 'BTC' },
];