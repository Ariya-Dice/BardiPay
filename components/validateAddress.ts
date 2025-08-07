//validateAddress.ts

// Assuming 'Wallets' type is defined in a central types file
import { Wallets } from '../types';

/**
 * Validates a cryptocurrency address against a given network's format.
 * @param network The network to validate against (e.g., 'ethereum').
 * @param address The wallet address string.
 * @returns An object with validation status and an optional error message.
 */
export const validateAddress = (network: keyof Wallets, address: string): { isValid: boolean; error?: string } => {
  // Check if the address is empty or just whitespace
  if (!address.trim()) {
    return { isValid: false, error: `${network} address cannot be empty` };
  }

  switch (network) {
    case 'ethereum':
    case 'bsc': {
      // ETH and BSC addresses follow the same format
      const ethRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethRegex.test(address)) {
        return { isValid: false, error: `Invalid ${network} address. Must be a 42-character hex string starting with 0x.` };
      }
      break;
    }
    case 'tron': {
      const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
      if (!tronRegex.test(address)) {
        return { isValid: false, error: `Invalid Tron address. Must be 34 characters starting with 'T'.` };
      }
      break;
    }
    case 'solana': {
      // Solana addresses are Base58 encoded and typically 32-44 characters long
      const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!solanaRegex.test(address)) {
        return { isValid: false, error: `Invalid Solana address. Must be a 32-44 character Base58 string.` };
      }
      break;
    }
    case 'bitcoin': {
      // This regex checks for legacy (P2PKH, P2SH) and SegWit (Bech32) formats.
      // It's a structural check, not a full checksum validation.
      const bitcoinRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}$/i;
      if (!bitcoinRegex.test(address)) {
        return {
          isValid: false,
          error: `Invalid Bitcoin address format.`,
        };
      }
      break;
    }
    default:
      // Fallback for any unsupported network keys
      return { isValid: false, error: `Unknown network: ${network}` };
  }

  // If all checks pass
  return { isValid: true };
};