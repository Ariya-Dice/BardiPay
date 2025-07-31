"use client";

import SparkleParticles from '../components/SparkleParticles';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import Image from 'next/image';
import HowItWorksModal from '../components/HowItWorksModal';

export default function Home() {
  return (
    <div className={styles.container}>
      <SparkleParticles />
      <div className={styles.innerContainer}>
        {/* === تغییر ۱: تیتر جذاب‌تر و گویاتر === */}
        <h1 className={styles.title}>Private & Anonymous Crypto Payments</h1>
        
        {/* === تغییر ۲: توضیحات شفاف در مورد حریم خصوصی === */}
        <p className={styles.description}>
          Accept or make crypto payments with zero tracking. No sign-up, no accounts. Just a simple tool for direct, peer-to-peer transactions.
        </p>
        
        <HowItWorksModal />
        <div className={styles.buttonContainer}>
          <Link href="/buyer">
            <button className={styles.button}>
              <Image
                src="/buyer.png"
                alt="Buyer Icon"
                width={64}
                height={64}
                className={styles.buttonIcon}
              />
              I’m Buyer
            </button>
          </Link>
          <Link href="/merchant">
            <button className={styles.button}>
              <Image
                src="/seller.png"
                alt="Seller Icon"
                width={64}
                height={64}
                className={styles.buttonIcon}
              />
              I’m Seller
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}