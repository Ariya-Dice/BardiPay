import { ethers } from 'ethers';

const tokenAddresses = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT در Ethereum
  bsc: '0x55d398326f99059fF775485246999027B3197955', // USDT در BSC
};

const providerUrls = {
  ethereum: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY', // Alchemy HTTP
  bsc: 'https://bsc-dataseed.binance.org/', // نود عمومی BSC
};

export const searchTransaction = async (invoiceId, merchantAddress, network) => {
  const provider = new ethers.providers.JsonRpcProvider(providerUrls[network]);
  const tokenAddress = tokenAddresses[network];

  // سرچ برای USDT
  if (tokenAddress) {
    const contract = new ethers.Contract(
      tokenAddress,
      ['event Transfer(address indexed from, address indexed to, uint256 value)'],
      provider
    );

    const filter = contract.filters.Transfer(null, merchantAddress);
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 1000);
    const events = await contract.queryFilter(filter, fromBlock, latestBlock);
    for (const event of events) {
      const tx = await provider.getTransaction(event.transactionHash);
      let txInvoiceId = null;
      try {
        txInvoiceId = tx.data !== '0x' ? ethers.utils.toUtf8String(tx.data) : null;
      } catch (error) {
        console.warn('Failed to decode tx data:', error);
      }
      if (txInvoiceId === invoiceId) {
        return {
          token: 'USDT',
          amount: ethers.utils.formatUnits(event.args.value, 6),
          from: event.args.from,
          to: event.args.to,
          invoiceId,
          txHash: event.transactionHash,
          network,
        };
      }
    }
  }

  // سرچ برای ETH/BNB
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latestBlock - 1000);
  for (let i = fromBlock; i <= latestBlock; i++) {
    const block = await provider.getBlockWithTransactions(i);
    for (const tx of block.transactions) {
      if (
        tx.to &&
        tx.to.toLowerCase() === merchantAddress.toLowerCase() &&
        tx.data !== '0x'
      ) {
        let txInvoiceId = null;
        try {
          txInvoiceId = ethers.utils.toUtf8String(tx.data);
        } catch (error) {
          console.warn('Failed to decode tx data:', error);
        }
        if (txInvoiceId === invoiceId) {
          return {
            token: network === 'ethereum' ? 'ETH' : 'BNB',
            amount: ethers.utils.formatEther(tx.value),
            from: tx.from,
            to: tx.to,
            invoiceId,
            txHash: tx.hash,
            network,
          };
        }
      }
    }
  }

  throw new Error('Transaction not found');
};