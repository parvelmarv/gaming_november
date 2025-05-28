'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './styles.module.css';
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
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced device detection
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                            (window.navigator as any).standalone || 
                            document.referrer.includes('ios-app://');

    setIsIOS(isIOSDevice);
    setIsSafari(isSafariBrowser);
    setIsStandalone(isStandaloneMode);

    // Only show install prompt if not in standalone mode
    if (isIOSDevice && !isStandaloneMode) {
      setShowInstallPrompt(true);
    }
  }, []);

  // Handle Safari UI and viewport
  useEffect(() => {
    if (!isIOS) return;

    const handleViewport = () => {
      // Set viewport height for iOS
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      // Hide Safari UI
      if (containerRef.current) {
        containerRef.current.style.height = `${window.innerHeight}px`;
      }
    };

    // Initial setup
    handleViewport();

    // Handle resize and orientation changes
    window.addEventListener('resize', handleViewport);
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure proper orientation change
      setTimeout(handleViewport, 100);
    });

    // Prevent overscroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = '0';
    document.body.style.left = '0';

    return () => {
      window.removeEventListener('resize', handleViewport);
      window.removeEventListener('orientationchange', handleViewport);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.left = '';
    };
  }, [isIOS]);

  // Lock orientation to landscape
  useEffect(() => {
    if (isIOS) {
      lockOrientation('landscape').catch(console.error);
    }
  }, [isIOS, lockOrientation]);

  // Redirect to desktop version if not on mobile
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      router.replace('/warmup');
    }
  }, [router]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleFullscreenClick = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <>
      <div className={styles.container} ref={containerRef}>
        {showInstallPrompt && !isStandalone && (
          <div className={styles.installPrompt}>
            {isIOS ? (
              <div className={styles.iosInstallPrompt}>
                <h2>For the best experience:</h2>
                <ol>
                  <li>Tap the Share button <span className={styles.shareIcon}>⎋</span></li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
                <p className={styles.iosNote}>This will launch the game in fullscreen mode without browser controls</p>
              </div>
            ) : (
              <>
                <p>For the best experience, add this game to your home screen!</p>
                <button onClick={handleInstallClick}>Add to Home Screen</button>
                {!isFullscreen && (
                  <button onClick={handleFullscreenClick} className={styles.fullscreenButton}>
                    Enter Fullscreen
                  </button>
                )}
              </>
            )}
          </div>
        )}
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
    </>
  );
} 