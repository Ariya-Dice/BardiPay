import { ethers } from 'ethers';
import { w3cwebsocket } from 'websocket';
import { Wallets, EventData } from '../types';

const tokenAddresses = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
};

const providerUrls = {
  ethereum:
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ETHEREUM_WS_URL) ||
    'wss://eth-mainnet.g.alchemy.com/v2/demo',
};

export const listenToEvents = (
  wallets: Wallets,
  callback: (data: EventData) => void
) => {
  const cleanups: (() => void)[] = [];

  // Limit to Ethereum for reliability; Solana listener disabled until a robust impl is added
  const networks = ['ethereum'];

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

    // Solana listener is currently disabled
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
};