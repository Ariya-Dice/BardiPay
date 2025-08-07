# 💸 DayPay – Decentralized Serverless Payment Gateway for Hyperliquid

[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Hyperliquid-Hackathon-FF69B4.svg)](https://taikai.network)

**DayPay** is a decentralized, non-custodial, and serverless crypto payment gateway built on **Hyperliquid**. It enables users and merchants to receive payments in stablecoins with zero backend, minimal setup, and full self-sovereignty.

---

## 🚀 Why DayPay?

Most crypto payment solutions today either require centralized APIs, backend servers, or custodial wallets.

**DayPay** flips that model by:
- Removing the need for any backend
- Providing direct, secure, and permissionless payment infrastructure
- Empowering merchants with a plug-and-play payment button
- Built entirely on **Hyperliquid + HyperEVM**

---

## ✨ Key Features

- 🧩 **No Backend Required** – Works entirely client-side
- 🔐 **Non-Custodial** – Payments go directly to the merchant's wallet
- 💵 **Stablecoin Support** – Accept payments in USDC, USDT, or other Hyperliquid tokens
- ⚙️ **Customizable Payment Button** – Add a DayPay button to any site or dApp
- 📈 **Merchant Dashboard** – View payment history, totals, and status
- 📡 **Notifications** – Get notified when a payment is received (using Node Info API)
- 🗓️ **Optional Vesting** – Create recurring/subscription-based payment flows

---

## 🛠️ Built For

> **Hyperliquid Frontier Track** of Hyperliquid Community Hackathon  
> Also eligible for bounties:
> - HyperEVM Transaction Simulator – $30,000  
> - Token Vesting System – $5,000  
> - Notification System using Node Info API – $3,000  
> - Stablecoin Tracking Dashboard – $2,500  

---

## 🧱 Tech Stack

| Layer       | Tech                                      |
|-------------|-------------------------------------------|
| Smart Contract | Solidity (HyperEVM compatible)        |
| Frontend    | React + Next.js + TypeScript + Tailwind   |
| Web3        | ethers.js + viem + WalletConnect/MetaMask |
| Hosting     | Vercel (serverless)                       |
| Storage     | IPFS (optional for metadata)              |

---

## 📦 SDK Usage

```ts
import { DayPayButton } from 'daypay-sdk';

<DayPayButton
  amount="25"
  currency="USDC"
  recipient="0xMerchantAddress"
  onSuccess={() => alert("Payment successful!")}
  metadata={{ orderId: "ORD-1234" }}
/>
🔧 How to Run Locally
bash
Copy
Edit
git clone https://github.com/your-org/daypay.git
cd daypay

# Install dependencies
npm install

# Run development server
npm run dev
Visit http://localhost:3000

🔐 Smart Contract
Contract source is in /contracts/DayPay.sol.
Compiled and deployed using Foundry + HyperEVM CLI.

Functions:
pay(recipient, token, amount, metadata)

subscribe(recipient, token, amount, interval)

getPayments(address) – view past transactions

🖼️ Screenshots
Payment Button	Merchant Dashboard

📅 Hackathon Timeline
🛫 Kickoff: July 28

🛠️ Build Weeks: August 4 – August 22

📤 Submission Deadline: August 24

🏆 Winners Announced: September 5

💬 Contact & Support
Discord: @AriyaKhan

Email: abdollahiyansaeed@gmail.com

GitHub: github.com/Ariya-Dice

📄 License
This project is licensed under the MIT License – see the LICENSE file for details.

🙏 Acknowledgements
Hyperliquid Team

Hackathon Judges & Growth Partners

Open Source Contributors
