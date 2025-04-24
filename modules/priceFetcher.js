import axios from 'axios';

export async function fetchPrice(currency) {
  const currencyMap = {
    eth: 'ethereum',
    btc: 'bitcoin',
    sol: 'solana',
    bnb: 'binancecoin',
    busd: 'binance-usd',
    usdt: 'tether', // USDT on Ethereum and Tron
    usdc: 'usd-coin', // USDC on Ethereum and Solana
    dai: 'dai',
    link: 'chainlink',
    cake: 'pancakeswap-token',
    twt: 'trust-wallet-token',
    alice: 'my-neighbor-alice',
    band: 'band-protocol',
    trx: 'tron',
    btt: 'bittorrent',
    jst: 'just',
    sun: 'sun-token',
    ray: 'raydium',
    srm: 'serum',
    orca: 'orca',
  };

  const coinId = currencyMap[currency.toLowerCase()];
  if (!coinId) throw new Error(`Currency ${currency} is not supported`);

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
  try {
    const response = await axios.get(url);
    return response.data[coinId].usd;
  } catch (error) {
    throw new Error(`Failed to fetch price for ${currency}: ${error.message}`);
  }
}

export async function convertToCrypto(amountUSD, currency) {
  if (!amountUSD || isNaN(amountUSD)) throw new Error('Invalid USD amount');
  const price = await fetchPrice(currency);
  const amountCryptoRaw = parseFloat(amountUSD) / price;
  // محدود کردن به 5 رقم اعشار و حذف صفرهای اضافی
  const amountCrypto = parseFloat(amountCryptoRaw.toFixed(5)).toString();
  return amountCrypto;
}