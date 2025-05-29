'use client';

import { useEffect, useState } from 'react';
import { useOrientation } from '../hooks/useOrientation';
import Navbar from '../components/Navbar';
import dynamic from 'next/dynamic';
import styles from './styles.module.css';

// Dynamically import UnityWrapper to avoid SSR issues
const UnityWrapper = dynamic(() => import('../components/UnityWrapper'), {
  ssr: false
});

export default function WarmupPage() {
  const { lockOrientation } = useOrientation();
  const [isLandscape, setIsLandscape] = useState(false);


  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode);

      if (isLandscapeMode) {
        try {
          lockOrientation('landscape');
        } catch (error) {
          console.error('Error locking orientation:', error);
        }
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [lockOrientation]);

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        {isLandscape ? (
          <div className={styles.gameContainer}>
            <div className={styles.gameWrapper}>
              <UnityWrapper 
                buildUrl="/games/RolloRocket"
                gameName="RolloRocket"
                gameVersion="1.0.0"
                gameCompany="DefaultCompany"
              />
            </div>
          </div>
        ) : (
          <div className={styles.portraitMessage}>
            <div className={styles.rotateIcon}>⟳</div>
            <p>Please rotate your device to landscape mode</p>
          </div>
        )}
      </div>
    </div>
  );
} 