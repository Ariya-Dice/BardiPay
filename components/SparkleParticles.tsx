'use client';

import { useEffect, useState } from 'react';
import styles from './SparkleParticles.module.css';

const SparkleParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticle = () => ({
      id: Math.random(),
      startX: Math.random() * 100, // موقعیت اولیه X
      startY: Math.random() * 100, // موقعیت اولیه Y
      size: Math.random() * 3 + 2, // اندازه بین 2 تا 5 پیکسل
      moveX: (Math.random() - 0.5) * 2, // حرکت افقی تصادفی
      moveY: (Math.random() - 0.5) * 2, // حرکت عمودی تصادفی
      animationDelay: Math.random() * 5, // تاخیر انیمیشن
      animationDuration: Math.random() * 10 + 5, // مدت زمان انیمیشن
      blur: Math.random() * 3 // میزان محو شدگی
    });

    setParticles(Array.from({ length: 100 }, generateParticle));
  }, []);

  return (
    <div className={styles.particleContainer}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.sparkleParticle}
          style={{
            '--start-x': `${particle.startX}vw`,
            '--start-y': `${particle.startY}vh`,
            '--move-x': `${particle.moveX}vw`,
            '--move-y': `${particle.moveY}vh`,
            '--size': `${particle.size}px`,
            '--blur': `${particle.blur}px`,
            animation: `${styles.float} ${particle.animationDuration}s ease-in-out infinite alternate`,
            animationDelay: `${particle.animationDelay}s`
          }}
        />
      ))}
    </div>
  );
};

export default SparkleParticles;