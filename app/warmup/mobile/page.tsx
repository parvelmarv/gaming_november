'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from '../styles.module.css';
import { useOrientation } from '../../hooks/useOrientation';

// Dynamically import UnityWrapper to avoid SSR issues
const UnityWrapper = dynamic(() => import('../../components/UnityWrapper'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingText}>Loading game...</div>
    </div>
  ),
});

export default function MobileWarmupPage() {
  const router = useRouter();
  const { lockOrientation } = useOrientation();

  // Redirect to desktop version if not on mobile
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      router.replace('/warmup');
    }
  }, [router]);

  // Lock orientation to landscape when component mounts
  useEffect(() => {
    lockOrientation('landscape');
  }, [lockOrientation]);

  return (
    <div className={styles.container}>
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