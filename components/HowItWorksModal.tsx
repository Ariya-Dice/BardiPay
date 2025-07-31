"use client";

import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import styles from '../styles/Home.module.css';

export default function HowItWorksModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* How It Works Button */}
      <div className={styles.howItWorksContainer}>
        <button
          onClick={openModal}
          className={styles.button}
        >
          How It Works?
        </button>
      </div>

      {/* Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                    How DayPay Works
                  </Dialog.Title>
                  <div className="mt-4 text-gray-600">
                    {/* === تغییر ۳: پاراگراف اول با تأکید بر عدم ذخیره داده === */}
                    <p className="mb-4">
                      <strong>DayPay</strong> is a truly decentralized payment tool that enables secure and anonymous transactions. It runs <strong>entirely in your browser</strong> and never stores your data on any server. We don't know who you are, and we don't track your payments. Your privacy is guaranteed.
                    </p>

                    <h4 className="text-lg font-semibold mt-6">For Sellers</h4>
                    <ul className="list-disc pl-5 mb-4">
                      <li>Enter your wallet address for one of 5 supported networks (Bitcoin, Ethereum, BSC, Solana, Tron).</li>
                      <li>Set the product price in fiat (e.g., USD, EUR) and add optional details like invoice number or store name.</li>
                      <li>DayPay fetches real-time crypto prices via CoinGecko API and generates a QR code with payment details.</li>
                      <li>Coming soon: Convert buyer payments to stablecoins (e.g., USDT) to protect against price volatility, with a small 0.5% fee.</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-6">For Buyers</h4>
                    <ul className="list-disc pl-5 mb-4">
                      <li>Scan the seller’s QR code using the DayPay buyer panel.</li>
                      <li>Connect your wallet (e.g., MetaMask, Trust Wallet) via WalletConnect in just 4 clicks.</li>
                      <li>DayPay automatically configures the correct network if needed, processes your payment, and confirms it on-chain.</li>
                      <li>Wallet connection disconnects after 5 minutes or payment completion for enhanced security.</li>
                    </ul>

                    {/* === تغییر ۴: بخش "چرا DayPay" با تأکید بر مزایای کلیدی === */}
                    <h4 className="text-lg font-semibold mt-6">Why Choose DayPay?</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li><strong>True Anonymity:</strong> No sign-up, no KYC, no accounts. We never ask for your data.</li>
                        <li><strong>Server-less by Design:</strong> Everything happens locally on your device. We don't have servers that store your transaction history.</li>
                        <li><strong>Complete Control:</strong> As a non-custodial tool, your funds go directly from wallet to wallet. You always control your keys.</li>
                        <li><strong>Unmatched Simplicity:</strong> A clean, fast interface designed to get the job done without any hassle.</li>
                    </ul>

                    <h4 className="text-lg font-semibold mt-6">Get Started</h4>
                    <p>
                      <strong>Sellers:</strong> Open the seller panel, input your wallet address and price, and share the generated QR code.<br />
                      <strong>Buyers:</strong> Open the buyer panel, scan the QR code, connect your wallet, and confirm the payment.<br />
                      {/* === تغییر ۵: جمله پایانی قدرتمندتر === */}
                      Start using DayPay today for truly private and censorship-resistant crypto payments!
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#2563eb] border border-transparent rounded-md hover:bg-[#1d4ed8]"
                      onClick={closeModal}
                    >
                      Got It!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}