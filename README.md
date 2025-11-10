# 💸 DayPay – Serverless Crypto Payment Gateway

[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

No sign-up. No middlemen. Just wallet-to-wallet.

—

## ✨ Private & Anonymous Crypto Payments

Accept or make crypto payments with zero tracking. No sign-up, no accounts. Just a simple tool for direct, peer-to-peer transactions.

- Try for Free: [Getting Started](#-getting-started)
- Go Pro: [Pricing](#-pricing)
- Live Demo: `https://your-demo-url.com` (replace with your deployment URL)

—

## 🔎 How DayPay Works

DayPay is a truly decentralized payment tool that enables secure and anonymous transactions. It runs entirely in your browser and never stores your data on any server. We don't know who you are, and we don't track your payments. Your privacy is guaranteed.

### For Sellers
- Enter your wallet address for one of 5 supported networks (Bitcoin, Ethereum, BSC, Solana, Tron).
- Set the product price in fiat (e.g., USD, EUR) and add optional details like invoice number or store name.
- DayPay fetches real-time crypto prices via CoinGecko API and generates a QR code with payment details.
- Coming soon: Convert buyer payments to stablecoins (e.g., USDT) to protect against price volatility, with a small 0.5% fee.

### For Buyers
- Scan the seller’s QR code using the DayPay buyer panel.
- Connect your wallet (e.g., MetaMask, Trust Wallet) via WalletConnect in just 4 clicks.
- DayPay automatically configures the correct network if needed, processes your payment, and confirms it on-chain.
- Wallet connection disconnects after 5 minutes or payment completion for enhanced security.

—

## 🧩 Why Choose DayPay?

- True Anonymity: No sign-up, no KYC, no accounts. We never ask for your data.
- Server-less by Design: Everything happens locally on your device. We don't have servers that store your transaction history.
- Complete Control: As a non-custodial tool, your funds go directly from wallet to wallet. You always control your keys.
- Unmatched Simplicity: A clean, fast interface designed to get the job done without any hassle.

—

## ⚡ Built for Privacy and Speed

- No Sign-Up Required
- 100% Serverless
- Multi-Chain Support (Bitcoin, Ethereum, BSC, Solana, Tron)
- PWA Installable
- Real-Time QR Generation
- White-label Ready
- Live Demo (try in your browser – no account required)

—

## 💳 Pricing

Simple and fair pricing for every type of user.

| Plan | Price | Includes |
|---|---:|---|
| Free | $0 | Unlimited QR payments; No sign-up needed; Supports ETH, BSC, TRON; PWA ready; Self-hosted (Vercel ready) |
| Pro | $500 | Everything in Free; One-time payment links; Password-protected requests; Downloadable invoices (PDF); Basic branding options; Invoice customization; 5 years of support and updates; Future features for 5 years |
| White-label | Custom | Everything in Pro; Custom domain + branding; Deployment support; Priority email support; Integration API access |

—

## 🥊 How We Compare

| Feature | DayPay | NOWPayments | BTCPay |
|---|:---:|:---:|:---:|
| No Sign-up | ✓ | ✗ | ✓ |
| One-time Links | ✓ | ✗ | ✗ |
| Password-protected Requests | ✓ | ✗ | ✗ |
| Open Source | ✓ | ✗ | ✓ |
| Crypto-only Payments | ✓ | ✓ | ✓ |
| Free to Use | ✓ | ✗ | ✓ |
| PWA Installable | ✓ | ✗ | ✗ |
| Self-hosted Option | ✓ | ✗ | ✓ |
| Multi-chain Support | ✓ | ✓ | ✗ |

—

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Next.js + TypeScript |
| Web3 (EVM) | ethers.js + WalletConnect/MetaMask |
| Web3 (Solana) | @solana/web3.js + @solana/spl-token + Phantom |
| Web3 (Tron) | TronWeb + TronLink |
| Pricing | CoinGecko API |
| Hosting | Vercel (serverless) |

—

## 🛠 Getting Started

```bash
git clone https://github.com/your-org/daypay.git
cd daypay
npm install
npm run dev
# Visit http://localhost:3000
```

Configuration notes:
- Replace any placeholder RPC endpoints/keys (e.g., Alchemy) in `modules/eventListener.ts` and EVM providers.
- For production, set your demo URL in this README and deploy to Vercel.

—

## 🔍 Implementation Highlights

- Seller workflow: `pages/merchant.tsx` with `components/WalletManager.tsx`, `components/InvoiceCreator.tsx`, `modules/qrGenerator.js`, `modules/priceFetcher.js`.
- Buyer workflow: `pages/buyer.tsx` with `components/QRScanner.tsx` and `modules/walletConnection.js`.
- EVM transactions: `modules/transactionCreator.js` (native coins + ERC‑20s via `ethers`).
- Live tracking: `components/TransactionTracker.tsx` using `modules/eventListener.ts` (ETH/USDT and SOL examples) and `modules/transactionSearcher.js` (last ~1000 blocks for EVM).
- Address validation: `components/validateAddress.ts` for BTC/ETH/BSC/TRON/SOL.

—

## 📣 Live Demo

Try DayPay in your browser – no sign-up, no back-end, just crypto.

- Local: `http://localhost:3000`
- Production: `https://your-demo-url.com` (replace after deployment)

—

## 📄 License

This project is licensed under the MIT License – see the LICENSE file for details.

## 💬 Contact

- Email: abdollahiyansaeed@gmail.com
- GitHub: github.com/Ariya-Dice
