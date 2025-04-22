// pages/merchant.tsx
'use client';

import { useState, useEffect } from 'react';
import { generateQRCode } from '../modules/qrGenerator';
import { listenToEvents } from '../modules/eventListener';
import { searchTransaction } from '../modules/transactionSearcher';
import { convertToCrypto } from '../modules/priceFetcher';
import styles from './Merchant.module.css';
import SparkleParticles from '../components/SparkleParticles';
import Image from 'next/image';

// Interface for incoming blockchain events
interface EventData {
  token: string;
  amount: string;
  from: string;
  to: string;
  invoiceId: string | null;
  txHash: string;
  network: string;
  timestamp: number;
}

// Interface for search results
interface SearchResult {
  token: string;
  amount: string;
  from: string;
  to: string;
  invoiceId: string | null;
  txHash: string;
  network: string;
}

// Wallet addresses by network
interface Wallets {
  ethereum: string;
  bsc: string;
  tron: string;
  solana: string;
  bitcoin: string;
}

// Supported currencies for invoice
const currencies = [
  { name: 'ETH (Ethereum)', network: 'ethereum', token: 'ETH' },
  { name: 'USDT (Ethereum)', network: 'ethereum', token: 'USDT' },
  { name: 'BNB (BSC)', network: 'bsc', token: 'BNB' },
  { name: 'TRX (Tron)', network: 'tron', token: 'TRX' },
  { name: 'SOL (Solana)', network: 'solana', token: 'SOL' },
  { name: 'BTC (Bitcoin)', network: 'bitcoin', token: 'BTC' },
];

export default function Merchant() {
  const [formData, setFormData] = useState({ amountUSD: '', token: 'USDT', network: 'ethereum' });
  const [wallets, setWallets] = useState<Wallets>({
    ethereum: '',
    bsc: '',
    tron: '',
    solana: '',
    bitcoin: '',
  });
  const [result, setResult] = useState<{
    amountUSD: string;
    amountCrypto: string;
    token: string;
    network: string;
    invoiceId: string;
    qrCode: string;
    recipient: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchInvoiceId, setSearchInvoiceId] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  // Load saved wallet addresses on mount
  useEffect(() => {
    const saved = localStorage.getItem('merchantWallets');
    if (saved) setWallets(JSON.parse(saved));
  }, []);

  // Persist wallet changes
  const handleWalletChange = (network: keyof Wallets, address: string) => {
    const updated = { ...wallets, [network]: address };
    setWallets(updated);
    localStorage.setItem('merchantWallets', JSON.stringify(updated));
  };

  // Subscribe to blockchain event stream
  useEffect(() => {
    const onEvent = (event: EventData) => {
      setEvents((prev) => {
        const e = [...prev, { ...event, timestamp: Date.now() }];
        return e.slice(-10);
      });
    };
    listenToEvents(wallets, onEvent);
  }, [wallets]);

  // Generate payment QR on form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { amountUSD, token, network } = formData;
      if (!amountUSD || isNaN(parseFloat(amountUSD)) || parseFloat(amountUSD) <= 0) {
        setError('Please enter a valid USD amount');
        return;
      }
      const recipient = wallets[network as keyof Wallets];
      if (!recipient) {
        setError(`Please enter a wallet address for ${network}`);
        return;
      }
      const amountCrypto = await convertToCrypto(amountUSD, token);
      if (!amountCrypto || isNaN(amountCrypto) || amountCrypto <= 0) {
        setError('Error calculating cryptocurrency amount');
        return;
      }
      const invoiceId = Math.random().toString(36).slice(2, 10);
      const qrCode = await generateQRCode({ amount: amountCrypto.toString(), recipient, invoiceId, network, token });

      setResult({ amountUSD, amountCrypto: amountCrypto.toString(), token, network, invoiceId, qrCode, recipient });
      setError(null);
    } catch (err) {
      setError('Error generating QR code: ' + (err as Error).message);
    }
  };

  // Search transaction by invoice ID
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!searchInvoiceId) {
        setError('Please enter an invoice ID');
        return;
      }
      const tx = await searchTransaction(searchInvoiceId, wallets, formData.network);
      setSearchResult(tx);
      setError(null);
    } catch (err) {
      setError('Error searching for transaction: ' + (err as Error).message);
      setSearchResult(null);
    }
  };

  return (
    <div className={styles.container}>
      <SparkleParticles />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 className={styles.title}>Merchant Dashboard</h1>

        {/* Wallet Addresses */}
        <section className={styles.walletSection}>
          <h2 className={styles.walletSectionTitle}>Wallet Addresses</h2>
          {(['ethereum','bsc','tron','solana','bitcoin'] as (keyof Wallets)[]).map((network) => (
            <div key={network} className={styles.walletInputContainer}>
              <label className={styles.walletLabel}>
                <Image
                  src={`/${network}.png`}
                  alt={`${network} icon`}
                  width={24}
                  height={24}
                />
                <span className={styles.walletNetworkName}>
                  {network.charAt(0).toUpperCase() + network.slice(1)} Address:
                </span>
              </label>
              <input
                type="text"
                placeholder={`${network} address...`}
                value={wallets[network]}
                onChange={(e) => handleWalletChange(network, e.target.value)}
                className={styles.walletInput}
              />
            </div>
          ))}
        </section>

        {/* Invoice Creation Form */}
        <form onSubmit={handleSubmit} className={styles.formSection}>
          <div>
            <label className={styles.formLabel}>Amount (USD):</label>
            <input
              type="number"
              step="0.01"
              value={formData.amountUSD}
              onChange={(e) => setFormData({ ...formData, amountUSD: e.target.value })}
              className={styles.amountInput}
              required
            />
          </div>
          <div>
            <label className={styles.formLabel}>Currency:</label>
            <select
              value={`${formData.token}-${formData.network}`}
              onChange={(e) => {
                const [token, network] = e.target.value.split('-');
                setFormData({ ...formData, token, network });
              }}
              className={styles.currencySelect}
            >
              {currencies.map((c, i) => (
                <option key={i} value={`${c.token}-${c.network}`}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.submitButton}>Generate QR Code</button>
        </form>

        {/* QR Code Display */}
        {result && (
          <section className={styles.resultSection}>
            <h3 className={styles.resultTitle}>Payment Request</h3>
            <p className={styles.resultText}>Amount: {result.amountUSD} USD = {result.amountCrypto} {result.token}</p>
            <p className={styles.resultText}>Network: {result.network}</p>
            <p className={styles.resultText}>Recipient: {result.recipient}</p>
            <p className={styles.resultText}>Invoice ID: {result.invoiceId}</p>
            <Image src={result.qrCode} alt="QR Code" width={200} height={200} className={styles.qrCodeImage} />
          </section>
        )}

        {/* Transaction Event Log */}
        <section className={styles.eventLogSection}>
          <h3 className={styles.eventLogTitle}>Transaction Event Log</h3>
          {events.length === 0 ? (
            <p>No transactions detected yet.</p>
          ) : (
            <ul className={styles.eventList}>
              {events.map((ev) => (
                <li key={ev.txHash} className={styles.eventItem}>
                  <p>Token: {ev.token}</p>
                  <p>Amount: {ev.amount} {ev.token}</p>
                  <p>From: {ev.from}</p>
                  <p>To: {ev.to}</p>
                  <p>Invoice ID: {ev.invoiceId || 'Unknown'}</p>
                  <p>Network: {ev.network}</p>
                  <p>
                    Transaction: {' '}
                    <a
                      href={`https://${
                        ev.network === 'ethereum' ? 'etherscan.io' :
                        ev.network === 'bsc' ? 'bscscan.com' :
                        ev.network === 'tron' ? 'tronscan.org' :
                        ev.network === 'solana' ? 'solscan.io' :
                        'blockchain.com/btc'
                      }/tx/${ev.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.eventLink}
                    >
                      {ev.txHash.slice(0, 6)}...
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Invoice Search */}
        <section className={styles.searchSection}>
          <h3 className={styles.searchTitle}>Search Invoice</h3>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchInvoiceId}
              onChange={(e) => setSearchInvoiceId(e.target.value)}
              placeholder="Enter Invoice ID"
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>Search</button>
          </form>
          {searchResult && (
            <div className={styles.searchResultSection}>
              <h4 className={styles.searchResultTitle}>Transaction Found</h4>
              <p>Token: {searchResult.token}</p>
              <p>Amount: {searchResult.amount} {searchResult.token}</p>
              <p>From: {searchResult.from}</p>
              <p>To: {searchResult.to}</p>
              <p>Invoice ID: {searchResult.invoiceId || 'Unknown'}</p>
              <p>Network: {searchResult.network}</p>
              <p>
                Transaction: {' '}
                <a
                  href={`https://${
                    searchResult.network === 'ethereum' ? 'etherscan.io' :
                    searchResult.network === 'bsc' ? 'bscscan.com' :
                    searchResult.network === 'tron' ? 'tronscan.org' :
                    searchResult.network === 'solana' ? 'solscan.io' :
                    'blockchain.com/btc'
                  }/tx/${searchResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.eventLink}
                >
                  {searchResult.txHash.slice(0, 6)}...
                </a>
              </p>
            </div>
          )}
        </section>

        {/* Display errors */}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
}
