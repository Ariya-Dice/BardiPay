import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Merchant.module.css';
import { listenToEvents } from '../modules/eventListener';
import { searchTransaction } from '../modules/transactionSearcher.js';
import { EventData, SearchResult, Wallets } from '../types';

interface TransactionTrackerProps {
  wallets: Wallets;
  network: string;
  // This function should be memoized with useCallback in the parent component
  setError: (error: string | null) => void;
}

export default function TransactionTracker({ wallets, network, setError }: TransactionTrackerProps) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchInvoiceId, setSearchInvoiceId] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const eventListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up the previous listener if it exists
    if (eventListenerRef.current) {
      eventListenerRef.current();
      eventListenerRef.current = null;
    }

    const onEvent = (event: EventData) => {
      setEvents((prev) => {
        // Create a new array with the new event and keep the last 10 items
        const newEvents = [...prev, { ...event, timestamp: Date.now() }];
        return newEvents.slice(-10);
      });
    };

    try {
      // Set up the new event listener and store its cleanup function
      const cleanup = listenToEvents(wallets, onEvent);
      eventListenerRef.current = cleanup;
    } catch (err) {
      // Report initialization errors to the parent component
      setError('Failed to initialize event listener: ' + (err as Error).message);
    }

    // Return the cleanup function to be called on component unmount or when dependencies change
    return () => {
      if (eventListenerRef.current) {
        eventListenerRef.current();
        eventListenerRef.current = null;
      }
    };
    // It's important that the parent component wraps the `setError` function in `useCallback`
    // to prevent this effect from re-running unnecessarily on every parent render.
  }, [wallets, network, setError]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInvoiceId) {
      setError('Please enter an invoice ID');
      return;
    }

    setIsSearching(true);
    setError(null); // Clear previous errors before a new search
    setSearchResult(null); // Clear previous results

    try {
      const tx = await searchTransaction(searchInvoiceId, wallets, network);
      setSearchResult(tx);
      setSearchInvoiceId(''); // Clear input on successful search
    } catch (err) {
      // Report search errors to the parent component
      setError('Error searching for transaction: ' + (err as Error).message);
      setSearchResult(null);
    } finally {
      // Ensure loading state is turned off regardless of success or failure
      setIsSearching(false);
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
              // Using a more unique key by combining txHash and timestamp
              <li key={`${ev.txHash}-${ev.timestamp}`} className={styles.eventItem}>
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
            disabled={isSearching}
          />
          <button type="submit" className={styles.searchButton} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Error display is now handled by the parent component, 
          which receives the error message via the `setError` prop.
        */}

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