import { ethers } from 'ethers';
import { w3cwebsocket } from 'websocket';
import { Wallets, EventData } from '../types';

const tokenAddresses = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
};

const providerUrls = {
  ethereum: 'wss://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE',
  solana: 'wss://api.mainnet-beta.solana.com',
};

export const listenToEvents = (
  wallets: Wallets,
  callback: (data: EventData) => void
) => {
  const cleanups: (() => void)[] = [];

  const networks = ['ethereum', 'solana'];

  networks.forEach((network) => {
    if (!wallets[network as keyof Wallets]?.trim()) return;

    if (network === 'ethereum') {
      const provider = new ethers.providers.WebSocketProvider(providerUrls.ethereum);
      const tokenAddress = tokenAddresses.ethereum;
      const walletAddress = wallets.ethereum!.toLowerCase();

      const contract = new ethers.Contract(
        tokenAddress,
        ['event Transfer(address indexed from, address indexed to, uint256 value)'],
        provider
      );

      const handleTransfer = (
        from: string,
        to: string,
        value: ethers.BigNumber,
        event: ethers.Event
      ) => {
        if (to.toLowerCase() === walletAddress) {
          const amount = ethers.utils.formatUnits(value, 6);
          callback({
            token: 'USDT',
            amount,
            from,
            to,
            invoiceId: null,
            txHash: event.transactionHash,
            network,
            timestamp: Date.now(), // استفاده از زمان به میلی‌ثانیه
          });
        }
      };

      contract.on('Transfer', handleTransfer);
      cleanups.push(() => contract.off('Transfer', handleTransfer));

      const handleBlock = async (blockNumber: number) => {
        try {
          const block = await provider.getBlockWithTransactions(blockNumber);
          for (const tx of block.transactions) {
            if (
              tx.to?.toLowerCase() === walletAddress &&
              tx.value.gt(0)
            ) {
              const amount = ethers.utils.formatEther(tx.value);
              const invoiceId = tx.data !== '0x' ? ethers.utils.toUtf8String(tx.data) : null;
              callback({
                token: 'ETH',
                amount,
                from: tx.from,
                to: tx.to!,
                invoiceId,
                txHash: tx.hash,
                network,
                timestamp: Date.now(), // استفاده از زمان به میلی‌ثانیه
              });
            }
          }
        } catch (error) {
          console.error(`Error processing Ethereum block ${blockNumber}:`, error);
        }
      };

      provider.on('block', handleBlock);
      cleanups.push(() => {
        provider.off('block', handleBlock);
        provider.destroy();
      });
    }

    else if (network === 'solana') {
      const ws = new w3cwebsocket(providerUrls.solana);

      const subscription = {
        jsonrpc: '2.0',
        id: 1,
        method: 'accountSubscribe',
        params: [wallets.solana, { commitment: 'confirmed', encoding: 'base64' }],
      };

      ws.onopen = () => {
        ws.send(JSON.stringify(subscription));
      };

      ws.onmessage = async (message) => {
        try {
          const data = JSON.parse(message.data.toString());
          if (data.method === 'accountNotification') {
            const sig = data.params.result?.context?.slot;
            if (!sig) return;

            const response = await fetch(`https://api.mainnet-beta.solana.com`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getConfirmedTransaction',
                params: [sig],
              }),
            });

            const tx = await response.json();
            const amount = tx.result?.meta?.postBalances?.[0] / 1e9;

            callback({
              token: 'SOL',
              amount: amount?.toString() ?? '0',
              from: tx.result.transaction.message.accountKeys[0].pubkey,
              to: wallets.solana!,
              invoiceId: null,
              txHash: sig,
              network,
              timestamp: Date.now(), // استفاده از زمان به میلی‌ثانیه
            });
          }
        } catch (error) {
          console.error('Error processing Solana transaction:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Solana WebSocket error:', error);
      };

      cleanups.push(() => {
        ws.close();
      });
    }
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
};