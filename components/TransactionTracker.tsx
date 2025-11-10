import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Merchant.module.css';
import { listenToEvents } from '../modules/eventListener';
import { searchTransaction } from '../modules/transactionSearcher';
import { EventData, SearchResult, Wallets } from '../types';

interface TransactionTrackerProps {
  wallets: Wallets;
  network: keyof Wallets | string;
  setError: (error: string | null) => void;
}

export default function TransactionTracker({
  wallets,
  network,
  setError,
}: TransactionTrackerProps) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchInvoiceId, setSearchInvoiceId] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setErrorState] = useState<string | null>(null);
  const eventListenerRef = useRef<(() => void) | null>(null);

  // ---- Event listener ----
  useEffect(() => {
    if (eventListenerRef.current) {
      eventListenerRef.current();
      eventListenerRef.current = null;
    }

    const onEvent = (event: EventData) => {
      setEvents((prev) => {
        const updated = [...prev, { ...event, timestamp: Date.now() }];
        return updated.slice(-10); // فقط ۱۰ تراکنش اخیر
      });
    };

    try {
      const cleanup = listenToEvents(wallets, onEvent);
      eventListenerRef.current = cleanup;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : 'Unknown error';
      setErrorState('Failed to initialize event listener: ' + message);
    }

    return () => {
      if (eventListenerRef.current) {
        eventListenerRef.current();
        eventListenerRef.current = null;
      }
    };
  }, [wallets, setError]);

  // ---- Search handler ----
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!searchInvoiceId.trim()) {
        setErrorState('Please enter an invoice ID');
        return;
      }

      const networkKey = network as keyof Wallets;
      const merchantAddress =
        wallets[networkKey] ||
        wallets.ethereum ||
        wallets.bsc ||
        wallets.tron ||
        wallets.solana ||
        '';

      if (!merchantAddress) {
        setErrorState('No wallet address found for this network.');
        return;
      }

      const tx = await searchTransaction(searchInvoiceId, merchantAddress, network);
      setSearchResult(tx);
      setErrorState(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : 'Unknown error';
      setErrorState('Error searching for transaction: ' + message);
      setSearchResult(null);
    }
  };

  // ---- Helper for explorer URL ----
  const getExplorerUrl = (networkName: string, txHash: string): string => {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io/tx/',
      bsc: 'https://bscscan.com/tx/',
      tron: 'https://tronscan.org/#/transaction/',
      solana: 'https://solscan.io/tx/',
      bitcoin: 'https://www.blockchain.com/btc/tx/',
    };
    return (explorers[networkName] || explorers.bitcoin) + txHash;
  };

  return (
    <>
      {/* ---- Event Log Section ---- */}
      <section className={styles.eventLogSection}>
        <h3 className={styles.eventLogTitle}>Transaction Event Log</h3>
        {events.length === 0 ? (
          <p>No transactions detected yet.</p>
        ) : (
          <ul className={styles.eventList}>
            {events.map((ev) => (
              <li key={ev.txHash} className={styles.eventItem}>
                <p>Token: {ev.token}</p>
                <p>
                  Amount: {ev.amount} {ev.token}
                </p>
                <p>From: {ev.from}</p>
                <p>To: {ev.to}</p>
                <p>Invoice ID: {ev.invoiceId || 'Unknown'}</p>
                <p>Network: {ev.network}</p>
                <p>
                  Transaction:{' '}
                  <a
                    href={getExplorerUrl(ev.network, ev.txHash)}
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

      {/* ---- Search Section ---- */}
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
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>

        {error && <p className={styles.searchError}>{error}</p>}

        {searchResult && (
          <div className={styles.searchResultSection}>
            <h4 className={styles.searchResultTitle}>Transaction Found</h4>
            <p>Token: {searchResult.token}</p>
            <p>
              Amount: {searchResult.amount} {searchResult.token}
            </p>
            <p>From: {searchResult.from}</p>
            <p>To: {searchResult.to}</p>
            <p>Invoice ID: {searchResult.invoiceId || 'Unknown'}</p>
            <p>Network: {searchResult.network}</p>
            <p>
              Transaction:{' '}
              <a
                href={getExplorerUrl(searchResult.network, searchResult.txHash)}
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
