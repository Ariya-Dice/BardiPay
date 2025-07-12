// utils/validateAddress.ts
import { Wallets } from '../components/types';

export const validateAddress = (network: keyof Wallets, address: string): { isValid: boolean; error?: string } => {
  if (!address.trim()) {
    return { isValid: false, error: `${network} address cannot be empty` };
  }

  switch (network) {
    case 'ethereum':
    case 'bsc': {
      const ethRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethRegex.test(address)) {
        return { isValid: false, error: `Invalid ${network} address. Must be 42 characters starting with 0x` };
      }
      break;
    }
    case 'tron': {
      const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
      if (!tronRegex.test(address)) {
        return { isValid: false, error: `Invalid Tron address. Must be 34 characters starting with T` };
      }
      break;
    }
    case 'solana': {
      const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!solanaRegex.test(address)) {
        return { isValid: false, error: `Invalid Solana address. Must be 32-44 characters (Base58)` };
      }
      break;
    }
    case 'bitcoin': {
      const bitcoinRegex = /^(1|3)[1-9A-HJ-NP-Za-km-z]{25,34}$|^bc1[0-9A-Za-z]{39,59}$/;
      if (!bitcoinRegex.test(address)) {
        return {
          isValid: false,
          error: `Invalid Bitcoin address. Must be 26-35 (legacy) or 42-62 (Bech32) characters`,
        };
      }
      break;
    }
    default:
      return { isValid: false, error: `Unknown network: ${network}` };
  }

  return { isValid: true };
};