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