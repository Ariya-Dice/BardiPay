'use client';

import React, { useState, useCallback } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createTransaction } from './transactionCreator';
import dynamic from 'next/dynamic';

// Dynamically import tronweb to avoid SSR issues
const TronWeb = dynamic(() => import('tronweb'), { ssr: false });

const WalletConnection = ({ paymentInfo }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  const handleError = (error, customMessage = 'Error connecting to wallet') => {
    let errorMessage = customMessage;
    if (error.code === 4001) errorMessage = 'You rejected the connection request';
    else if (error.code === -32002) errorMessage = 'A connection request is already pending';
    else if (error.message?.includes('No provider found')) errorMessage = 'No wallet detected. Please install a compatible wallet.';
    else errorMessage = error.message || 'An unexpected error occurred';
    setError(errorMessage);
    console.error('Error:', { code: error.code, message: error.message, stack: error.stack });
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
      throw new Error('Please install TronLink and log in.');
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
      throw new Error('Please install Phantom and log in.');
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

    try {
      const { network, chainId, amount, recipient, token, invoiceId, contractAddress } = paymentInfo;

      if (network === 'bitcoin') {
        setTxStatus(
          `Please send ${amount} BTC to address ${recipient}. Invoice ID: ${invoiceId}`
        );
        return;
      } else if (network === 'ethereum' || network === 'bsc') {
        const provider = await detectEthereumProvider();
        if (!provider || !provider.isMetaMask) {
          throw new Error('MetaMask not detected. Please install MetaMask.');
        }

        const ethersProvider = new ethers.BrowserProvider(provider);

        if (chainId) {
          await switchNetwork(provider, chainId);
        }

        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        const signer = await ethersProvider.getSigner();
        setAccount(accounts[0]);

        const result = await createTransaction(signer, paymentInfo);
        setTxStatus(`Transaction successful: ${result.transactionHash}`);
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
      handleError(error, 'Error connecting or processing transaction');
    }
  }, [paymentInfo]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <button onClick={connectWallet} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        {account
          ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
          : 'Connect Wallet'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {txStatus && <p style={{ color: 'green', marginTop: '10px' }}>{txStatus}</p>}
    </div>
  );
};

export default WalletConnection;