'use client';

import React, { useState, useCallback } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createTransaction } from './transactionCreator';
import dynamic from 'next/dynamic';
import styles from '../pages/Buyer.module.css';

const TronWeb = dynamic(() => import('tronweb'), { ssr: false });

const WalletConnection = ({ paymentInfo }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const projectDetails = {
    projectId: '675ca087a0677efd93064248799db0d1',
    name: 'simple crypto payment sysytem',
    description: 'simple crypto payment sysytem',
    link: 'https://aapay.vercel.app/',
  };

  const handleError = (error) => {
    let errorMessage = 'Error processing transaction';
    if (error.code === 4001) {
      errorMessage = 'You rejected the connection request.';
    } else if (error.code === -32002) {
      errorMessage = 'A connection request is already pending.';
    } else if (error.message.includes('No provider found')) {
      errorMessage = 'No wallet detected. Please install a compatible wallet like MetaMask or Trust Wallet.';
    } else if (error.message.includes('Insufficient funds')) {
      errorMessage = 'Insufficient funds in your account. Please top up your account.';
    } else if (error.message.includes('Insufficient token balance')) {
      errorMessage = 'Insufficient token balance. Please top up your token balance.';
    } else if (error.message.includes('You rejected the transaction')) {
      errorMessage = 'You rejected the transaction.';
    } else if (error.message.includes('Failed to estimate gas')) {
      errorMessage = 'Failed to estimate gas. Please try again or check your wallet.';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = `Incorrect network. Please switch to ${paymentInfo?.network === 'bsc' ? 'BSC' : 'Ethereum'}.`;
    } else if (error.message.includes('MetaMask not found')) {
      errorMessage = 'Wallet not found. Please install MetaMask.';
    } else if (error.message.includes('Invalid recipient address')) {
      errorMessage = 'Invalid recipient address.';
    } else if (error.message.includes('Invalid amount')) {
      errorMessage = 'Invalid amount entered.';
    } else if (error.message.includes('not supported')) {
      errorMessage = `Network or token not supported: ${error.message}`;
    } else if (error.message.includes('TronLink')) {
      errorMessage = 'Please install TronLink to proceed.';
    } else if (error.message.includes('Phantom')) {
      errorMessage = 'Please install Phantom to proceed.';
    } else {
      errorMessage = `Unexpected error: ${error.message}`;
    }
    setError(errorMessage);
    console.error('Error:', error);
    return errorMessage;
  };

  const switchNetwork = async (provider, chainId) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        const networks = {
          1: {
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY'],
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
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [networks[chainId]],
        });
      } else {
        throw error;
      }
    }
  };

  const connectTronWallet = async () => {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
      const tronWeb = window.tronWeb;
      const account = tronWeb.defaultAddress.base58;
      return { tronWeb, account };
    } else {
      throw new Error('Please install TronLink.');
    }
  };

  const sendTronTransaction = async (tronWeb, recipient, amount, token, contractAddress) => {
    try {
      if (token === 'TRX') {
        const tx = await tronWeb.transactionBuilder.sendTrx(recipient, tronWeb.toSun(amount));
        const signedTx = await tronWeb.trx.sign(tx);
        const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
        return receipt.txid;
      } else if (contractAddress) {
        const contract = await tronWeb.contract().at(contractAddress);
        const tx = await contract.transfer(recipient, amount).send();
        return tx;
      } else {
        throw new Error('Contract address for TRC-20 token not provided.');
      }
    } catch (error) {
      throw new Error(`Error sending Tron transaction: ${error.message}`);
    }
  };

  const connectSolanaWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      await window.solana.connect();
      const account = window.solana.publicKey.toString();
      return { solana: window.solana, account };
    } else {
      throw new Error('Please install Phantom.');
    }
  };

  const sendSolanaTransaction = async (solana, recipient, amount, token, contractAddress) => {
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
      const fromPubkey = new PublicKey(solana.publicKey);
      const toPubkey = new PublicKey(recipient);

      if (token === 'SOL') {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: amount * LAMPORTS_PER_SOL,
          })
        );
        const signature = await solana.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
        return signature;
      } else if (contractAddress) {
        const mintPubkey = new PublicKey(contractAddress);
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromPubkey, mintPubkey, fromPubkey);
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromPubkey, mintPubkey, toPubkey);
        const transaction = new Transaction().add(
          createTransferInstruction(fromTokenAccount.address, toTokenAccount.address, fromPubkey, amount * 1e9, [], TOKEN_PROGRAM_ID)
        );
        const signature = await solana.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
        return signature;
      } else {
        throw new Error('Contract address for SPL token not provided.');
      }
    } catch (error) {
      throw new Error(`Error sending Solana transaction: ${error.message}`);
    }
  };

  const connectWallet = useCallback(async () => {
    if (!paymentInfo) {
      setError('Payment information not provided. Please scan a valid QR code.');
      return;
    }

    setError(null);
    setTxStatus(null);
    setIsLoading(true);

    try {
      const { network, chainId, amount, recipient, token, invoiceId, contractAddress } = paymentInfo;

      if (network === 'bitcoin') {
        setTxStatus(`Please send ${amount} BTC to address ${recipient}. Invoice ID: ${invoiceId}`);
        return;
      } else if (network === 'ethereum' || network === 'bsc') {
        const provider = await detectEthereumProvider();
        if (provider && provider.isMetaMask) {
          console.log('MetaMask detected');
          const ethersProvider = new ethers.providers.Web3Provider(provider);
          const currentNetwork = await ethersProvider.getNetwork();
          if (currentNetwork.chainId !== chainId) {
            await switchNetwork(provider, chainId);
          }
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          const signer = ethersProvider.getSigner();
          setAccount(accounts[0]);
          const result = await createTransaction(signer, paymentInfo);
          setTxStatus(`Transaction successful: ${result.transactionHash}`);
        } else {
          console.log('Using WalletConnect');
          const wcProvider = await EthereumProvider.init({
            projectId: projectDetails.projectId,
            chains: [chainId],
            showQrModal: true,
            methods: ['eth_sendTransaction', 'personal_sign'],
            events: ['chainChanged', 'accountsChanged'],
            metadata: {
              name: projectDetails.name,
              description: projectDetails.description,
              url: projectDetails.link,
              icons: ['https://www.lottoariya.xyz/favicon.ico'],
            },
          });

          await wcProvider.connect();
          console.log('WalletConnect connected');
          const ethersProvider = new ethers.providers.Web3Provider(wcProvider);
          const signer = ethersProvider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          const result = await createTransaction(signer, paymentInfo);
          setTxStatus(`Transaction successful: ${result.transactionHash}`);
        }
      } else if (network === 'tron') {
        const { tronWeb, account } = await connectTronWallet();
        setAccount(account);
        const txId = await sendTronTransaction(tronWeb, recipient, amount, token, contractAddress);
        setTxStatus(`Transaction successful: ${txId}`);
      } else if (network === 'solana') {
        const { solana, account } = await connectSolanaWallet();
        setAccount(account);
        const signature = await sendSolanaTransaction(solana, recipient, amount, token, contractAddress);
        setTxStatus(`Transaction successful: ${signature}`);
      } else {
        throw new Error('Network not supported.');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [paymentInfo]);

  return (
    <div className={styles.walletContainer}>
      <button 
        onClick={connectWallet} 
        className={styles.connectButton}
        disabled={isLoading}
      >
        {isLoading ? (
          'We Working On It...'
        ) : account ? (
          `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
        ) : (
          'Please Connect Wallet and Pay'
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