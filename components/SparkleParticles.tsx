'use client';

import { useEffect, useState } from 'react';
import styles from './SparkleParticles.module.css'; // مطمئن شوید مسیر فایل درست است

type Particle = {
  id: number;
  animation: string;
  startX: number;
  size: number;
  blur: number;
};

const SparkleParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticle = (): Particle => {
      const fallDuration = Math.random() * 10 + 7; // مدت زمان سقوط بین ۷ تا ۱۷ ثانیه
      const fallDelay = Math.random() * 1; // تاخیر اولیه برای شروع سقوط

      // انیمیشن پایه سقوط برای تمام ذرات
      // از نام انیمیشن در فایل CSS ماژولار استفاده می‌کنیم
      let animationString = `${styles.fall} ${fallDuration}s linear ${fallDelay}s infinite`;

      // حدود ۳۰ درصد ذرات افکت سوسو زدن خواهند داشت
      if (Math.random() < 0.3) {
        const twinkleDuration = Math.random() * 3 + 1; // سرعت سوسو زدن بین ۱ تا ۴ ثانیه
        const twinkleDelay = Math.random() * 5; // تاخیر برای شروع سوسو زدن
        
        // اضافه کردن انیمیشن دوم (twinkle) به رشته انیمیشن
        animationString += `, ${styles.twinkle} ${twinkleDuration}s ease-in-out ${twinkleDelay}s infinite`;
      }

      return {
        id: Math.random(),
        startX: Math.random() * 100,
        size: Math.random() * 4 + 1,
        blur: Math.random() * 2.5,
        animation: animationString,
      };
    };

    // ایجاد ۱۵۰ ذره در اولین رندر
    setParticles(Array.from({ length: 150 }, generateParticle));
  }, []); // آرایه خالی به این معناست که این افکت تنها یک بار پس از مونت شدن کامپوننت اجرا می‌شود

  return (
    <div className={styles.particleContainer}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.sparkleParticle}
          style={
            {
              '--start-x': `${p.startX}vw`,
              '--size': `${p.size}px`,
              '--blur': `${p.blur}px`,
              animation: p.animation,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default SparkleParticles;