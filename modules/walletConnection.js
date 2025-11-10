'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferCheckedInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createTransaction } from '../modules/transactionCreator'; // Assuming this module handles EVM transactions
import dynamic from 'next/dynamic';
import styles from '../styles/Buyer.module.css'; // Correct path to styles

// Dynamically import TronWeb, only on client-side
// Removed unused TronWeb dynamic import; using window.tronWeb from TronLink

// Define network configurations for easy management
const EVM_NETWORKS = {
  1: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    rpcUrls: [
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://cloudflare-eth.com',
    ],
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://etherscan.io'],
  },
  56: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain Mainnet',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    blockExplorerUrls: ['https://bscscan.com'],
  },
};

const WalletConnection = ({ paymentInfo }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wcProvider, setWcProvider] = useState(null);
  const idleTimeoutRef = useRef(null); // Use useRef for mutable values that don't trigger re-renders
  const IDLE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Project details for WalletConnect
  const projectDetails = {
    projectId: '675ca087a0677efd93064248799db0d1',
    name: 'Simple Crypto Payment System',
    description: 'Simple Crypto Payment System',
    link: 'https://aapay.vercel.app/',
    icons: ['https://www.lottoariya.xyz/favicon.ico'], // Ensure this URL is valid
  };

  /**
   * Handles and formats error messages for user display.
   * @param {Error} error The error object.
   * @returns {string} The formatted error message.
   */
  const handleError = useCallback((error) => {
    let errorMessage = 'Error processing transaction.';
    if (error.code === 4001) {
      errorMessage = 'You rejected the connection request.';
    } else if (error.code === -32002) {
      errorMessage = 'A connection request is already pending.';
    } else if (error.message?.includes('No provider found')) {
      errorMessage = 'No wallet detected. Please install a compatible wallet like MetaMask or Trust Wallet.';
    } else if (error.message?.includes('insufficient funds') || error.message?.includes('Insufficient funds')) {
      errorMessage = 'Insufficient funds in your account. Please top up your account.';
    } else if (error.message?.includes('Insufficient token balance')) {
      errorMessage = 'Insufficient token balance. Please top up your token balance.';
    } else if (error.message?.includes('User rejected the request') || error.message?.includes('You rejected the transaction')) {
      errorMessage = 'You rejected the transaction.';
    } else if (error.message?.includes('Failed to estimate gas')) {
      errorMessage = 'Failed to estimate gas. Please try again or check your wallet.';
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Incorrect network')) {
      errorMessage = `Incorrect network. Please switch to ${paymentInfo?.network === 'bsc' ? 'BSC' : 'Ethereum'}.`;
    } else if (error.message?.includes('MetaMask not found')) {
      errorMessage = 'Wallet not found. Please install MetaMask.';
    } else if (error.message?.includes('invalid address')) { // More general check for invalid addresses
      errorMessage = 'Invalid recipient address.';
    } else if (error.message?.includes('Invalid amount')) {
      errorMessage = 'Invalid amount entered.';
    } else if (error.message?.includes('not supported')) {
      errorMessage = `Network or token not supported: ${error.message}`;
    } else if (error.message?.includes('TronLink')) {
      errorMessage = 'Please install TronLink to proceed.';
    } else if (error.message?.includes('Phantom')) {
      errorMessage = 'Please install Phantom to proceed.';
    } else {
      errorMessage = `An unexpected error occurred: ${error.message || error}`;
    }
    setError(errorMessage);
    console.error('WalletConnection Error:', error);
    return errorMessage;
  }, [paymentInfo]);

  /**
   * Switches the Ethereum-compatible wallet's network.
   * @param {Object} provider The Ethereum provider (e.g., MetaMask provider).
   * @param {number} chainId The ID of the chain to switch to.
   */
  const switchNetwork = async (provider, chainId) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EVM_NETWORKS[chainId].chainId }],
      });
    } catch (error) {
      if (error.code === 4902) { // Chain not added
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [EVM_NETWORKS[chainId]],
        });
      } else {
        throw error;
      }
    }
  };

  /**
   * Connects to the TronLink wallet.
   * @returns {Promise<{tronWeb: Object, account: string}>} TronWeb instance and account address.
   * @throws {Error} If TronLink is not installed.
   */
  const connectTronWallet = async () => {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
      const tronWeb = window.tronWeb;
      const account = tronWeb.defaultAddress.base58;
      return { tronWeb, account };
    } else {
      throw new Error('Please install TronLink.');
    }
  };

  /**
   * Sends a Tron (TRX or TRC-20) transaction.
   * @param {Object} tronWeb The TronWeb instance.
   * @param {string} recipient The recipient address.
   * @param {string} amount The amount to send.
   * @param {string} token The token symbol (e.g., 'TRX', 'USDT').
   * @param {string} [contractAddress] The contract address for TRC-20 tokens.
   * @returns {Promise<string>} The transaction ID.
   * @throws {Error} If the transaction fails or contract address is missing for TRC-20.
   */
  const sendTronTransaction = async (tronWeb, recipient, amount, token, contractAddress) => {
    try {
      if (token === 'TRX') {
        const tx = await tronWeb.transactionBuilder.sendTrx(recipient, tronWeb.toSun(amount));
        const signedTx = await tronWeb.trx.sign(tx);
        const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
        return receipt.txid;
      } else if (contractAddress) {
        const contract = await tronWeb.contract().at(contractAddress);
        // Assuming the TRC-20 transfer function takes amount in its smallest unit (e.g., 6 decimals for USDT)
        // You might need to adjust 'amount' based on token decimals here if 'amount' is human-readable.
        // For simplicity, assuming 'amount' is already in smallest unit if passed directly to contract.transfer
        const txId = await contract.transfer(recipient, amount).send();
        return txId;
      } else {
        throw new Error('Contract address for TRC-20 token not provided.');
      }
    } catch (error) {
      throw new Error(`Error sending Tron transaction: ${error.message}`);
    }
  };

  /**
   * Connects to the Solana Phantom wallet.
   * @returns {Promise<{solana: Object, account: string}>} Solana provider and account address.
   * @throws {Error} If Phantom is not installed.
   */
  const connectSolanaWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      // Connect to Phantom wallet
      const resp = await window.solana.connect();
      const account = resp.publicKey.toString();
      return { solana: window.solana, account };
    } else {
      throw new Error('Please install Phantom.');
    }
  };

  /**
   * Sends a Solana (SOL or SPL) transaction.
   * @param {Object} solana The Solana provider.
   * @param {string} recipient The recipient public key string.
   * @param {number} amount The amount to send (human-readable).
   * @param {string} token The token symbol (e.g., 'SOL', 'USDC').
   * @param {string} [contractAddress] The mint address for SPL tokens.
   * @param {number} [decimals] The decimals of the SPL token (important for correct amount calculation).
   * @returns {Promise<string>} The transaction signature.
   * @throws {Error} If the transaction fails or contract address is missing for SPL token.
   */
  const sendSolanaTransaction = async (solana, recipient, amount, token, contractAddress, decimals = 9) => { // Default to 9 decimals for common SPL tokens like USDC, USDT
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed'); // Use a reliable RPC endpoint
      const fromPubkey = new PublicKey(solana.publicKey);
      const toPubkey = new PublicKey(recipient);

      if (token === 'SOL') {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: Math.round(Number(amount) * LAMPORTS_PER_SOL), // Ensure amount is integer lamports
          })
        );
        const signature = await solana.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature.signature, 'confirmed'); // Confirm the transaction
        return signature.signature;
      } else if (contractAddress) {
        const mintPubkey = new PublicKey(contractAddress);
        // Get or create associated token accounts
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          fromPubkey,
          mintPubkey,
          fromPubkey
        );
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          fromPubkey, // Payer for creating ATA if needed
          mintPubkey,
          toPubkey
        );

        const transaction = new Transaction().add(
          createTransferCheckedInstruction(
            fromTokenAccount.address,
            mintPubkey,
            toTokenAccount.address,
            fromPubkey, // Owner of the source token account
            BigInt(Math.round(Number(amount) * Math.pow(10, decimals))), // Amount in smallest units
            decimals,
            TOKEN_PROGRAM_ID
          )
        );

        const signature = await solana.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature.signature, 'confirmed'); // Confirm the transaction
        return signature.signature;
      } else {
        throw new Error('Contract address for SPL token not provided.');
      }
    } catch (error) {
      throw new Error(`Error sending Solana transaction: ${error.message}`);
    }
  };

  /**
   * Disconnects the currently connected wallet.
   */
  const disconnectWallet = useCallback(async () => {
    try {
      // WalletConnect disconnect
      if (wcProvider?.disconnect) {
        await wcProvider.disconnect();
        // WalletConnect v2 handles session storage internally
      }
      // MetaMask/Ethereum provider cleanup
      if (window.ethereum) {
        // No explicit disconnect for MetaMask, just remove listeners
        // If using EIP-1193 provider, usually connection is persistent until user disconnects from wallet UI
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
      // Phantom disconnect
      if (window.solana?.isPhantom) {
        await window.solana.disconnect();
      }
      // TronLink has no explicit disconnect via API
      
      setWcProvider(null);
      setAccount(null);
      setError("Wallet disconnected successfully.");
      clearIdleTimer();
    } catch (error) {
      handleError(error);
    }
  }, [wcProvider, handleError]);

  // Event handlers for MetaMask (if applicable)
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      // MetaMask locked or the user disconnected all accounts
      disconnectWallet();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      startIdleTimer(); // Reset timer on account change
    }
  }, [account, disconnectWallet]);

  const handleChainChanged = useCallback((chainId) => {
    // Reload if chain changes, or prompt user to switch back if necessary
    console.log(`Chain changed to ${parseInt(chainId, 16)}`);
    // Optionally, could prompt user to switch back to required network if current network is wrong
    // For now, let's keep it simple: if chain changes, assume user might need to reconnect
    setAccount(null); // Clear account to force re-connection
    setTxStatus(null);
    setError('Network changed. Please reconnect if needed.');
    clearIdleTimer();
  }, [disconnectWallet]);

  /**
   * Starts the inactivity timer to disconnect the wallet.
   */
  const startIdleTimer = useCallback(() => {
    clearIdleTimer();
    const timeoutId = setTimeout(() => {
      disconnectWallet();
      setError("Wallet disconnected due to 5 minutes of inactivity.");
    }, IDLE_TIME);
    idleTimeoutRef.current = timeoutId;
  }, [disconnectWallet]);

  /**
   * Clears the inactivity timer.
   */
  const clearIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, [startIdleTimer]);

  // Refined approach for event listeners for idle timer:
  const idleTimerResetHandler = useCallback(() => {
    startIdleTimer(); // Simply restart the timer on user activity
  }, [startIdleTimer]);

  useEffect(() => {
    // Add global event listeners when component mounts or timer is active
    window.addEventListener("click", idleTimerResetHandler, { passive: true });
    window.addEventListener("mousemove", idleTimerResetHandler, { passive: true });
    window.addEventListener("keypress", idleTimerResetHandler, { passive: true });

    return () => {
      // Clean up global event listeners when component unmounts
      window.removeEventListener("click", idleTimerResetHandler);
      window.removeEventListener("mousemove", idleTimerResetHandler);
      window.removeEventListener("keypress", idleTimerResetHandler);
      clearIdleTimer(); // Also clear the timer on unmount
    };
  }, [idleTimerResetHandler, clearIdleTimer]);


  const connectWallet = useCallback(async () => {
    if (!paymentInfo) {
      setError('Payment information not provided. Please scan a valid QR code.');
      return;
    }

    setError(null);
    setTxStatus(null);
    setIsLoading(true);

    try {
      const { network, chainId, amount, recipient, token, invoiceId, contractAddress, tokenDecimals } = paymentInfo; // Add tokenDecimals

      // Handle Bitcoin separately as it's not a direct wallet connection/transaction in this context
      if (network === 'bitcoin') {
        setTxStatus(`Please send ${amount} BTC to address ${recipient}. Invoice ID: ${invoiceId}`);
        setIsLoading(false);
        return;
      }

      // Handle EVM-compatible chains (Ethereum, BSC)
      if (network === 'ethereum' || network === 'bsc') {
        let provider;
        let signer;
        let currentAccount;

        // Try MetaMask first
        const metamaskProvider = await detectEthereumProvider();
        if (metamaskProvider && metamaskProvider.isMetaMask) {
          console.log('MetaMask detected.');
          provider = metamaskProvider;
          // Set up listeners for MetaMask
          if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
          }
          await provider.request({ method: 'eth_requestAccounts' }); // Request accounts first
          const ethersProvider = new ethers.providers.Web3Provider(provider);
          const currentNetwork = await ethersProvider.getNetwork();
          if (currentNetwork.chainId !== chainId) {
            await switchNetwork(provider, chainId);
          }
          signer = ethersProvider.getSigner();
          currentAccount = await signer.getAddress();
        } else {
          // Fallback to WalletConnect if MetaMask is not detected or not preferred
          console.log('MetaMask not found, falling back to WalletConnect.');
          const wcInitOptions = {
            projectId: projectDetails.projectId,
            chains: [chainId],
            showQrModal: true,
            methods: ['eth_sendTransaction', 'personal_sign'],
            events: ['chainChanged', 'accountsChanged'],
            metadata: {
              name: projectDetails.name,
              description: projectDetails.description,
              url: projectDetails.link,
              icons: projectDetails.icons,
            },
          };
          const walletConnectProvider = await EthereumProvider.init(wcInitOptions);

          await walletConnectProvider.connect();
          console.log('WalletConnect connected.');
          provider = walletConnectProvider;
          setWcProvider(walletConnectProvider); // Store for disconnect
          const ethersProvider = new ethers.providers.Web3Provider(provider);
          signer = ethersProvider.getSigner();
          currentAccount = await signer.getAddress();
        }

        setAccount(currentAccount);
        startIdleTimer();
        const result = await createTransaction(signer, paymentInfo); // Assuming createTransaction handles token vs native coin based on paymentInfo
        setTxStatus(`Transaction successful: ${result.transactionHash}`);
        await disconnectWallet(); // Disconnect wallet after successful transaction
      }
      // Handle Tron
      else if (network === 'tron') {
        const { tronWeb, account: tronAccount } = await connectTronWallet();
        setAccount(tronAccount);
        startIdleTimer();
        const txId = await sendTronTransaction(tronWeb, recipient, amount, token, contractAddress);
        setTxStatus(`Transaction successful: ${txId}`);
        await disconnectWallet(); // Disconnect wallet after successful transaction
      }
      // Handle Solana
      else if (network === 'solana') {
        const { solana, account: solanaAccount } = await connectSolanaWallet();
        setAccount(solanaAccount);
        startIdleTimer();
        // Pass tokenDecimals to sendSolanaTransaction if available from paymentInfo
        const signature = await sendSolanaTransaction(solana, recipient, amount, token, contractAddress, tokenDecimals);
        setTxStatus(`Transaction successful: ${signature}`);
        await disconnectWallet(); // Disconnect wallet after successful transaction
      } else {
        throw new Error('Network not supported.');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [paymentInfo, handleError, switchNetwork, connectTronWallet, sendTronTransaction, connectSolanaWallet, sendSolanaTransaction, disconnectWallet, handleAccountsChanged, handleChainChanged, startIdleTimer]);


  return (
    <div className={styles.walletContainer}>
      <button
        onClick={connectWallet}
        className={styles.connectButton}
        disabled={isLoading}
      >
        {isLoading ? (
          'Processing...' // More professional loading text
        ) : account ? (
          `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
        ) : (
          'Connect Wallet and Pay'
        )}
      </button>

      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}

      {error && <p className={styles.errorMessage}>{error}</p>}
      {txStatus && <p className={styles.successMessage}>{txStatus}</p>}
    </div>
  );
};

export default WalletConnection;