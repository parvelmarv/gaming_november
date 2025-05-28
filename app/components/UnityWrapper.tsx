'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './UnityWrapper.module.css';
import { useFullscreen } from '../hooks/useFullscreen';
import { useOrientation } from '../hooks/useOrientation';

// Types
interface UnityConfig {
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  streamingAssetsUrl: string;
  companyName: string;
  productName: string;
  productVersion: string;
  showBanner: (msg: string, type: string) => void;
  devicePixelRatio: number;
  matchWebGLToCanvasSize: boolean;
  memorySize: number;
  webglContextAttributes: {
    preserveDrawingBuffer: boolean;
    powerPreference: string;
    failIfMajorPerformanceCaveat: boolean;
  };
  loadingScreen: {
    showLoadingScreen: boolean;
    loadingScreenBackgroundColor: string;
    loadingScreenProgressBarColor: string;
  };
  compatibilityCheck: (unityInstance: any, onsuccess: () => void, onerror: (error: string) => void) => void;
  onProgress: (progress: number) => void;
}

interface UnityWrapperProps {
  buildUrl: string;
  width?: number;
  height?: number;
  gameName?: string;
  gameVersion?: string;
  gameCompany?: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warning';
}

// Add new interface for device detection
interface DeviceInfo {
  isMobile: boolean;
  isLandscape: boolean;
}

// Add at the top with other interfaces
interface ScreenOrientationType extends ScreenOrientation {
  lock(orientation: 'landscape' | 'portrait'): Promise<void>;
  unlock(): Promise<void>;
}

// Separate utility functions for feature detection
const hasFullscreenSupport = (): boolean => {
  return !!(
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled ||
    (document as any).mozFullScreenEnabled ||
    (document as any).msFullscreenEnabled
  );
};

const hasOrientationLockSupport = (): boolean => {
  return !!(screen.orientation && 'lock' in screen.orientation);
};

// Components
const LoadingBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className={styles.loadingBar}>
    <div className={styles.logo} />
    <div className={styles.progressBarEmpty}>
      <div 
        className={styles.progressBarFull} 
        style={{ width: `${progress}%` }} 
      />
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ 
  error: string | null; 
  onReload: () => void 
}> = ({ error, onReload }) => (
  <div className={styles.errorOverlay}>
    <div className={styles.errorContent}>
      <p>{error}</p>
      <button onClick={onReload} className={styles.reloadButton}>
        Reload Game
      </button>
    </div>
  </div>
);

const MemoryWarning: React.FC = () => (
  <div className={styles.memoryWarning}>
    High memory usage detected. Consider reloading the game.
  </div>
);

const OrientationWarning: React.FC = () => (
  <div className={styles.orientationWarning}>
    Please rotate your device to landscape mode
  </div>
);

const FullscreenButton: React.FC<{ 
  containerRef: React.RefObject<HTMLDivElement> 
}> = ({ containerRef }) => {
  const { lockOrientation, unlockOrientation } = useOrientation();
  
  const logSizes = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const canvas = container.querySelector('canvas');
      const containerStyle = window.getComputedStyle(container);
      const canvasStyle = canvas ? window.getComputedStyle(canvas) : null;
      
      if (canvas) {
        // Keep minimal logging for debugging if needed
        console.log('Size changed:', {
          container: {
            width: container.offsetWidth,
            height: container.offsetHeight
          },
          canvas: {
            width: canvas.offsetWidth,
            height: canvas.offsetHeight
          }
        });
      }
    }
  }, [containerRef]);

  // Add resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      logSizes();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, logSizes]);

  // Add fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && containerRef.current) {
        try {
          unlockOrientation();
          containerRef.current.classList.remove(styles.fullscreenContainer);
          // Reset to original size
          containerRef.current.style.width = '960px';
          containerRef.current.style.height = '600px';
          
          // Force a reflow
          void containerRef.current.offsetHeight;
          
          logSizes();
        } catch (error) {
          console.error('Error exiting fullscreen:', error);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [containerRef, logSizes, unlockOrientation]);

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef, {
    onEnter: () => {
      try {
        lockOrientation('landscape');
        if (containerRef.current) {
          containerRef.current.classList.add(styles.fullscreenContainer);
          // Force the container to take full screen
          containerRef.current.style.width = '100vw';
          containerRef.current.style.height = '100vh';
          logSizes();
        }
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    },
    onExit: () => {
      // The actual exit handling is now done in the fullscreenchange event listener
    },
  });

  return (
    <button 
      onClick={toggleFullscreen}
      className={styles.fullscreenButton}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
    </button>
  );
};

// Main Component
export default function UnityWrapper({ 
  buildUrl, 
  width = 960, 
  height = 540,
  gameName = "RolloRocket",
  gameVersion = "1.0.0",
  gameCompany = "PInC"
}: UnityWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unityInstance, setUnityInstance] = useState<any>(null);
  const [memoryWarning, setMemoryWarning] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fontLoaded, setFontLoaded] = useState<boolean | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isLandscape: false
  });
  const { lockOrientation } = useOrientation();
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isLandscape = window.innerWidth > window.innerHeight;
      setDeviceInfo({ isMobile, isLandscape });
      
      // Show orientation warning on iOS in portrait mode
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      setShowOrientationWarning(isIOS && !isLandscape);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Prevent scrolling when game is loaded on mobile
  useEffect(() => {
    if (showGame && deviceInfo.isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [showGame, deviceInfo.isMobile]);

  // Font loading detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkFont = () => {
        const testElement = document.createElement('div');
        testElement.style.fontFamily = 'Lato, sans-serif';
        testElement.style.fontSize = '12px';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.textContent = 'Test';
        document.body.appendChild(testElement);

        const computedFont = window.getComputedStyle(testElement).fontFamily;
        const isLatoLoaded = computedFont.includes('Lato');

        // Get the actual rendered font metrics
        const metrics = {
          width: testElement.offsetWidth,
          height: testElement.offsetHeight,
          computedStyle: window.getComputedStyle(testElement)
        };

        // Only log if the font status has changed
        if (isLatoLoaded !== fontLoaded) {
          console.log('Font detection details:', {
            computedFont,
            isLatoLoaded,
            fallbackFont: !isLatoLoaded ? computedFont : null,
            metrics,
            fontFace: document.fonts.check('12px Lato'),
            allLoadedFonts: Array.from(document.fonts).map(font => font.family)
          });
        }

        setFontLoaded(isLatoLoaded);

        // Cleanup
        document.body.removeChild(testElement);
      };

      // Check immediately
      checkFont();

      // Check again after fonts are loaded
      document.fonts.ready.then(() => {
        console.log('Fonts loaded, checking again...');
        checkFont();
      });
    }
  }, []);

  // Persistent logging function
  const persistentLog = useCallback((message: string, type: 'info' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = { timestamp, message, type };
    
    setLogs(prev => [...prev, logEntry].slice(-100));
    
    if (type === 'error' || type === 'warning') {
      console.log(`[UnityWrapper] ${message}`);
    }
  }, []);

  // Memory monitoring
  useEffect(() => {
    if (!showGame) return;

    const memoryInterval = setInterval(() => {
      try {
        if (window.performance && (window.performance as any).memory) {
          const memory = (window.performance as any).memory;
          const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
          const totalMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
          
          if (usedMB > totalMB * 0.8) {
            persistentLog(`High memory usage: ${usedMB}MB / ${totalMB}MB`, 'warning');
            setMemoryWarning(true);
            if (usedMB > totalMB * 0.9) {
              persistentLog('Critical: Memory usage too high', 'error');
              setError('Game is using too much memory. Please reload the game.');
            }
          } else {
            setMemoryWarning(false);
          }
        }
      } catch (e) {
        persistentLog(`Error checking memory: ${e}`, 'error');
      }
    }, 10000);

    return () => clearInterval(memoryInterval);
  }, [showGame, persistentLog]);

  // Unity initialization
  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    if (!container || !showGame) return;

    const loadUnity = async () => {
      try {
        persistentLog('Starting Unity initialization');
        
        const config: UnityConfig = {
          dataUrl: `${buildUrl}/ProductionBr.data.br`,
          frameworkUrl: `${buildUrl}/ProductionBr.framework.js.br`,
          codeUrl: `${buildUrl}/ProductionBr.wasm.br`,
          streamingAssetsUrl: "StreamingAssets",
          companyName: gameCompany,
          productName: gameName,
          productVersion: gameVersion,
          showBanner: (msg: string, type: string) => {
            persistentLog(`Banner: ${msg} (${type})`, type === 'error' ? 'error' : 'info');
            if (type === 'error') {
              setError(msg);
            }
          },
          devicePixelRatio: window.devicePixelRatio || 1,
          matchWebGLToCanvasSize: true,
          memorySize: 512,
          webglContextAttributes: {
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: true,
          },
          loadingScreen: {
            showLoadingScreen: true,
            loadingScreenBackgroundColor: '#231F20',
            loadingScreenProgressBarColor: '#FFFFFF',
          },
          compatibilityCheck: (unityInstance: any, onsuccess: () => void, onerror: (error: string) => void) => {
            if (unityInstance.Module.WebGL.isWebGL2Available()) {
              onsuccess();
            } else {
              onerror('WebGL 2 is not available');
            }
          },
          onProgress: (progress: number) => {
            const percent = Math.round(100 * progress);
            persistentLog(`Loading progress: ${percent}%`);
            setLoadingProgress(percent);
          },
        };

        const script = document.createElement('script');
        script.src = `${buildUrl}/ProductionBr.loader.js`;
        script.async = true;

        script.onload = () => {
          if (!isMounted) return;
          persistentLog('Unity loader script loaded');

          (window as any).createUnityInstance(document.querySelector('#unity-canvas'), config)
            .then((instance: any) => {
              if (!isMounted) return;
              setUnityInstance(instance);
              setIsLoading(false);
              persistentLog('Unity instance created successfully');
            })
            .catch((message: string) => {
              if (!isMounted) return;
              persistentLog(`Error creating Unity instance: ${message}`, 'error');
              setError(`Failed to load game: ${message}`);
              setIsLoading(false);
            });
        };

        script.onerror = () => {
          if (!isMounted) return;
          persistentLog('Error loading Unity script', 'error');
          setError('Failed to load game files. Please try reloading.');
          setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
          isMounted = false;
          if (unityInstance) {
            unityInstance.Quit();
          }
          script.remove();
        };
      } catch (e: any) {
        persistentLog(`Error in Unity initialization: ${e.message}`, 'error');
        setError(`Failed to initialize game: ${e.message}`);
        setIsLoading(false);
      }
    };

    loadUnity();
  }, [buildUrl, gameName, gameVersion, gameCompany, showGame, persistentLog]);

  const reloadGame = useCallback(() => {
    setError(null);
    setMemoryWarning(false);
    setIsLoading(true);
    setLoadingProgress(0);
    if (unityInstance) {
      unityInstance.Quit();
    }
  }, [unityInstance]);

  return (
    <div className={styles.container}>
      {error && <ErrorDisplay error={error} onReload={reloadGame} />}
      {memoryWarning && !error && <MemoryWarning />}
      {showOrientationWarning && <OrientationWarning />}
      
      <h1 className={styles.title}>
        WARMUP GAME
      </h1>
      
      {!showGame ? (
        <div className={styles.loadButtonContainer}>
          <button
            onClick={async () => {
              setShowGame(true);
              // Only auto-fullscreen on mobile devices
              if (deviceInfo.isMobile) {
                try {
                  // Lock orientation first
                  await lockOrientation('landscape');
                  
                  // For iOS, we need to wait a bit longer
                  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                  const delay = isIOS ? 500 : 100;
                  
                  setTimeout(async () => {
                    if (containerRef.current) {
                      try {
                        // Try fullscreen
                        if (document.fullscreenEnabled) {
                          await containerRef.current.requestFullscreen();
                        } else if ((document as any).webkitFullscreenEnabled) {
                          await (containerRef.current as any).webkitRequestFullscreen();
                        } else if ((document as any).mozFullScreenEnabled) {
                          await (containerRef.current as any).mozRequestFullScreen();
                        } else if ((document as any).msFullscreenEnabled) {
                          await (containerRef.current as any).msRequestFullscreen();
                        }
                      } catch (error) {
                        console.error('Error entering fullscreen:', error);
                      }
                    }
                  }, delay);
                } catch (error) {
                  console.error('Error with orientation lock:', error);
                }
              }
            }}
            className={styles.loadButton}
          >
            Load Game
          </button>
        </div>
      ) : (
        <div className={styles.gameContainer}>
          <div ref={containerRef} className={styles.unityContainer}>
            <canvas 
              id="unity-canvas" 
              width={deviceInfo.isMobile ? window.innerWidth : width} 
              height={deviceInfo.isMobile ? window.innerHeight : height} 
              tabIndex={-1}
              style={{ outline: 'none' }}
            />
            {isLoading && <LoadingBar progress={loadingProgress} />}
          </div>
          <div className={styles.controls}>
            <FullscreenButton containerRef={containerRef} />
          </div>
        </div>
      )}
    </div>
  );
} 