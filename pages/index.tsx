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
        <h1 className={styles.title}>Welcome to Crypto Payment Platform</h1>
        <p className={styles.description}>
          Our platform allows seamless cryptocurrency payments. Choose whether you are a buyer making a payment or a seller generating payment requests.
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