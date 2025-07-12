'use client';

import { useEffect, useState } from 'react';
import styles from './SparkleParticles.module.css';

type Particle = {
  id: number;
  startX: number;
  startY: number;
  size: number;
  moveX: number;
  moveY: number;
  animationDelay: number;
  animationDuration: number;
  blur: number;
};

const SparkleParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticle = (): Particle => ({
      id: Math.random(),
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      size: Math.random() * 3 + 2,
      moveX: (Math.random() - 0.5) * 5,
      moveY: (Math.random() - 0.5) * 5,
      animationDelay: Math.random() * 1,
      animationDuration: Math.random() * 10 + 5,
      blur: Math.random() * 5
    });

    setParticles(Array.from({ length: 150 }, generateParticle));
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
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default SparkleParticles;
