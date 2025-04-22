import { ethers } from 'ethers';
import { w3cwebsocket } from 'websocket';

const tokenAddresses = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
};

const providerUrls = {
  ethereum: 'wss://eth-mainnet.g.alchemy.com/v2/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjUzMWY3NzA4LTkyYzQtNGI0MS05OGY0LThlYWM1Y2Q1M2Q0NyIsIm9yZ0lkIjoiNDQzMDAzIiwidXNlcklkIjoiNDU1NzkxIiwidHlwZUlkIjoiYjhiMWVjZGItZjBhZS00NzY1LWEyOGUtNDQ2NTczYzk4N2JhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDUyMTk3MDMsImV4cCI6NDkwMDk3OTcwM30.LXiCxsal1LRZHucUrGPWFG5Sztp6kB-uJZMgizgiyP4', // Replace with your Alchemy API key
  solana: 'wss://api.mainnet-beta.solana.com',
};

export const listenToEvents = (wallets, callback) => {
  const networks = ['ethereum', 'solana'];

  networks.forEach((network) => {
    if (!wallets[network] || wallets[network].trim() === '') return;

    if (network === 'ethereum') {
      const provider = new ethers.providers.WebSocketProvider(providerUrls[network]);
      const tokenAddress = tokenAddresses[network];

      if (tokenAddress) {
        const contract = new ethers.Contract(
          tokenAddress,
          ['event Transfer(address indexed from, address indexed to, uint256 value)'],
          provider
        );

        contract.on('Transfer', (from, to, value, event) => {
          if (to.toLowerCase() === wallets.ethereum.toLowerCase()) {
            const amount = ethers.utils.formatUnits(value, 6);
            callback({
              token: 'USDT',
              amount,
              from,
              to,
              invoiceId: null,
              txHash: event.transactionHash,
              network,
            });
          }
        });
      }

      provider.on('block', async (blockNumber) => {
        try {
          const block = await provider.getBlock(blockNumber, true);
          block.transactions.forEach(async (txHash) => {
            const tx = await provider.getTransaction(txHash);
            if (
              tx.to &&
              tx.to.toLowerCase() === wallets.ethereum.toLowerCase() &&
              tx.value > 0
            ) {
              const amount = ethers.utils.formatEther(tx.value);
              const invoiceId = tx.data !== '0x' ? ethers.utils.toUtf8String(tx.data) : null;
              callback({
                token: 'ETH',
                amount,
                from: tx.from,
                to: tx.to,
                invoiceId,
                txHash,
                network,
              });
            }
          });
        } catch (error) {
          console.error(`Error processing Ethereum block ${blockNumber}:`, error);
        }
      });
    } else if (network === 'solana') {
      const ws = new w3cwebsocket(providerUrls.solana);
      ws.onopen = () => {
        const subscription = {
          jsonrpc: '2.0',
          id: 1,
          method: 'accountSubscribe',
          params: [wallets.solana, { commitment: 'confirmed', encoding: 'base64' }],
        };
        ws.send(JSON.stringify(subscription));
      };
      ws.onmessage = async (message) => {
        try {
          const data = JSON.parse(message.data);
          if (data.method === 'accountNotification') {
            const tx = await fetch(`https://api.mainnet-beta.solana.com`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getConfirmedTransaction',
                params: [data.params.result.signature],
              }),
            }).then((res) => res.json());
            const amount = tx.result.transaction.message.instructions[0].parsed.info.lamports / 1e9;
            callback({
              token: 'SOL',
              amount: amount.toString(),
              from: tx.result.transaction.message.accountKeys[0].pubkey,
              to: wallets.solana,
              invoiceId: null,
              txHash: data.params.result.signature,
              network,
            });
          }
        } catch (error) {
          console.error('Error processing Solana transaction:', error);
        }
      };
      ws.onerror = (error) => {
        console.error('Solana WebSocket error:', error);
      };
    }
  });
};