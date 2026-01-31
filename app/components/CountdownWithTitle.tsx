'use client';

import { useEffect, useState } from 'react';
import TimeUnit from './TimeUnit';
import styles from './TitleYear.module.css';

interface CountdownWithTitleProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownWithTitle({ days, hours, minutes, seconds }: CountdownWithTitleProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentYear(new Date().getFullYear());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-12">
      {/* Countdown Section - Directly sized small, no transform scaling */}
      <div className="flex flex-row gap-10 sm:gap-12 md:gap-20 justify-center">
        <TimeUnit 
          value={days} 
          label="DAYS" 
          numberClassName="text-3xl sm:text-4xl md:text-5xl"
          labelClassName="text-[10px] sm:text-xs font-bold tracking-[1em]"
          containerClassName="w-[50px] sm:w-[70px]"
        />
        <TimeUnit 
          value={hours} 
          label="HOURS" 
          numberClassName="text-3xl sm:text-4xl md:text-5xl"
          labelClassName="text-[10px] sm:text-xs font-bold tracking-[1em]"
          containerClassName="w-[50px] sm:w-[70px]"
        />
        <TimeUnit 
          value={minutes} 
          label="MINUTES" 
          numberClassName="text-3xl sm:text-4xl md:text-5xl"
          labelClassName="text-[10px] sm:text-xs font-bold tracking-[1em]"
          containerClassName="w-[50px] sm:w-[70px]"
        />
        <TimeUnit 
          value={seconds} 
          label="SECONDS" 
          numberClassName="text-3xl sm:text-4xl md:text-5xl"
          labelClassName="text-[10px] sm:text-xs font-bold tracking-[1em]"
          containerClassName="w-[50px] sm:w-[70px]"
        />
      </div>

      {/* Title Year Section */}
      <div className={styles.titleContainerRelative}>
        <h1 className={`${styles.title} font-tilt-neon`}>
          <span className={styles.neonText}>GAMING</span>
          <span className={styles.neonText}>NOVEMBER</span>
          <span className={styles.year}>{currentYear}</span>
        </h1>
      </div>
    </div>
  );
}
