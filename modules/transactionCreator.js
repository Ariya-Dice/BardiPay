import { ethers } from 'ethers';

export const createTransaction = async (signer, paymentInfo) => {
  const { recipient, amount, token, network } = paymentInfo;

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
    // Initial validation
    if (!ethers.utils.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount entered');
    }

    const nativeTokens = ['ETH', 'BNB'];
    const isNativeToken = nativeTokens.includes(token);

    // Handle native tokens (ETH/BNB)
    if (isNativeToken) {
      const value = ethers.utils.parseEther(amount.toString());

      // Check balance
      const balance = await signer.getBalance();
      if (balance.lt(value)) {
        throw new Error('Insufficient funds');
      }

      // Estimate gas with 20% buffer
      try {
        const gasEstimate = await signer.estimateGas({
          to: recipient,
          value,
        });

        const tx = await signer.sendTransaction({
          to: recipient,
          value,
          gasLimit: gasEstimate.mul(120).div(100),
        });

        return tx.wait();
      } catch (gasError) {
        if (gasError.code === 'INSUFFICIENT_FUNDS' || gasError.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas');
        }
        if (gasError.code === 'ACTION_REJECTED') {
          throw new Error('You rejected the transaction');
        }
        throw new Error('Failed to estimate gas');
      }
    }

    // Handle ERC20 tokens
    const tokenConfig = tokenConfigs[network]?.[token];
    if (!tokenConfig) {
      throw new Error(`${token} is not supported on ${network} network`);
    }

    const contract = new ethers.Contract(
      tokenConfig.address,
      ['function transfer(address,uint256)', 'function balanceOf(address)'],
      signer
    );

    // Check token balance
    const decimals = tokenConfig.decimals;
    const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
    const balance = await contract.balanceOf(await signer.getAddress());

    if (balance.lt(parsedAmount)) {
      throw new Error('Insufficient token balance');
    }

    // Estimate gas with 20% buffer
    try {
      const gasEstimate = await contract.estimateGas.transfer(recipient, parsedAmount);

      const tx = await contract.transfer(recipient, parsedAmount, {
        gasLimit: gasEstimate.mul(120).div(100),
      });

      return tx.wait();
    } catch (gasError) {
      if (gasError.code === 'INSUFFICIENT_FUNDS' || gasError.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds for gas');
      }
      if (gasError.code === 'ACTION_REJECTED') {
        throw new Error('You rejected the transaction');
      }
      throw new Error('Failed to estimate gas for token transfer');
    }
  } catch (error) {
    throw error; // Pass the error as-is to WalletConnection for handling
  }
};