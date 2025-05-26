'use client';

import { useEffect, useState } from "react";
import styles from "./TitleYear.module.css";

export default function TitleYear() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentYear(new Date().getFullYear());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.titleContainer}>
      <h1 className={`${styles.title} font-tilt-neon`}>
        <span className={styles.neonText}>GAMING</span>
        <span className={styles.neonText}>NOVEMBER</span>
        <span className={styles.year}>{currentYear}</span>
      </h1>
    </div>
  );
} 