import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Merchant.module.css';
import { listenToEvents } from '../modules/eventListener';
import { searchTransaction } from '../modules/transactionSearcher.js';
import { EventData, SearchResult, Wallets } from '../types';

interface TransactionTrackerProps {
  wallets: Wallets;
  network: string;
  setError: (error: string | null) => void;
}

export default function TransactionTracker({ wallets, network, setError }: TransactionTrackerProps) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchInvoiceId, setSearchInvoiceId] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setErrorState] = useState<string | null>(null); // اینجا state برای error ایجاد می‌کنیم
  const eventListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (eventListenerRef.current) {
      eventListenerRef.current();
      eventListenerRef.current = null;
    }

    const onEvent = (event: EventData) => {
      setEvents((prev) => {
        const e = [...prev, { ...event, timestamp: Date.now() }];
        return e.slice(-10);
      });
    };

    try {
      const cleanup = listenToEvents(wallets, onEvent);
      eventListenerRef.current = cleanup;
    } catch (err) {
      setErrorState('Failed to initialize event listener: ' + (err as Error).message); // استفاده از setErrorState
    }

    return () => {
      if (eventListenerRef.current) {
        eventListenerRef.current();
        eventListenerRef.current = null;
      }
    };
  }, [wallets, setError]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!searchInvoiceId) {
        setErrorState('Please enter an invoice ID'); // استفاده از setErrorState
        return;
      }
      const merchantAddress =
        (wallets as any)[network as keyof Wallets] || wallets.ethereum || wallets.bsc || '';
      const tx = await searchTransaction(searchInvoiceId, merchantAddress, network);
      setSearchResult(tx);
      setErrorState(null); // تنظیم خطا به null
    } catch (err) {
      setErrorState('Error searching for transaction: ' + (err as Error).message); // استفاده از setErrorState
      setSearchResult(null);
    }
  };

  return (
    <>
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
                  Transaction:{' '}
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

        {/* نمایش خطا در صورت وجود */}
        {error && <p className={styles.searchError}>{error}</p>}

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
              Transaction:{' '}
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
    </>
  );
}
