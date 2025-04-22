import { ethers } from 'ethers';

export const createTransaction = async (signer, paymentInfo) => {
  const { recipient, amount, token, invoiceId, network } = paymentInfo;

  const tokenConfigs = {
    ethereum: {
      USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
      USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
      DAI: { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
      LINK: { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
    },
    bsc: {
      CAKE: { address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', decimals: 18 },
      TWT: { address: '0x4B0F1812e5Df2A09796481Ff14017e6005508003', decimals: 18 },
      ALICE: { address: '0xAC51066d7bEC65Dc4589368da368b212745d63E1', decimals: 6 },
      BAND: { address: '0xAD6cAEb32CD2c308980a548bD0Bc5AA4306c6c18', decimals: 18 },
    },
  };

  try {
    let tx;
    const nativeTokens = ['ETH', 'BNB'];

    if (nativeTokens.includes(token)) {
      // Convert amount to string to ensure compatibility with parseEther
      const amountStr = typeof amount === 'string' ? amount : amount.toString();

      // Validate amount
      if (!amountStr || isNaN(parseFloat(amountStr)) || parseFloat(amountStr) <= 0) {
        throw new Error('Invalid amount for native token transaction');
      }

      const data = ethers.hexlify(ethers.toUtf8Bytes(invoiceId || ''));
      tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amountStr),
        data,
      });
    } else {
      const tokenConfig = tokenConfigs[network]?.[token];
      if (!tokenConfig) {
        throw new Error(`${token} is not supported on ${network}`);
      }

      // Convert amount to string for parseUnits
      const amountStr = typeof amount === 'string' ? amount : amount.toString();

      // Validate amount
      if (!amountStr || isNaN(parseFloat(amountStr)) || parseFloat(amountStr) <= 0) {
        throw new Error('Invalid amount for token transaction');
      }

      const tokenContract = new ethers.Contract(
        tokenConfig.address,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        signer
      );
      tx = await tokenContract.transfer(recipient, ethers.parseUnits(amountStr, tokenConfig.decimals));
    }

    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error(`Failed to create transaction: ${error.message}`);
  }
};