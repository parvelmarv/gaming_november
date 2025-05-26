'use client';

import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import styles from './styles.module.css';

const UnityWrapper = dynamic(() => import('../components/UnityWrapper'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingText}>Loading game...</div>
    </div>
  ),
});

export default function WarmupPage() {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.gameContainer}>
          <div className={styles.gameWrapper}>
            <UnityWrapper 
              buildUrl="/games/RolloRocket/Build"
              gameName="RolloRocket"
              gameVersion="1.0.0"
              gameCompany="DefaultCompany"
            />
          </div>
        </div>
      </main>
    </div>
  );
} 