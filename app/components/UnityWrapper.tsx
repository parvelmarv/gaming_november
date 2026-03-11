'use client';

import React, { useEffect, useRef, useState } from 'react';

interface UnityWrapperProps {
  gameName?: string; // Name of the game (used for R2 path and display)
  r2GameName?: string; // Optional: different name in R2 bucket (defaults to gameName)
  iframeUrl?: string; // Alternative: URL to Unity build (if hosted elsewhere)
  width?: string;
  height?: string;
  gameVersion?: string;
  gameCompany?: string;
  buildUrl?: string; // Kept for compatibility but unused in this implementation
}

export default function UnityWrapper({ 
  gameName = "RolloRocket",
  r2GameName,
  iframeUrl,
  width = '100%',
  height = '100%', // Changed from 600px to 100% to fit container
  gameVersion = '1.0',
  gameCompany = 'DefaultCompany',
  buildUrl
}: UnityWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const unityInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const r2Name = r2GameName || gameName;

  // Fake loading progress animation
  useEffect(() => {
    if (!showGame || !isLoading) return;

    let animationFrame: number;
    let startTime = Date.now();
    const targetProgress = 0.9; // Get stuck at 90%
    const duration = 3000; // 3 seconds to reach 90%

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, targetProgress);
      
      setLoadingProgress(progress);

      if (progress < targetProgress) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [showGame, isLoading]);

  // Jump to 100% when loading is complete
  useEffect(() => {
    if (!isLoading && showGame) {
      setLoadingProgress(1);
    }
  }, [isLoading, showGame]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // If iframeUrl is provided, use simpler iframe approach
    if (iframeUrl) {
      setIsLoading(false);
      return;
    }

    if (!showGame) {
      setIsLoading(false);
      return;
    }

    // Load Unity WebGL build from R2 via API
    const loadUnity = async () => {
      if (!containerRef.current) return;

      let isMounted = true;

      try {
        // Create canvas and container structure
        const canvas = document.createElement('canvas');
        canvas.id = `unity-canvas-${Date.now()}`;
        canvas.width = 960;
        canvas.height = 600;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.background = '#231F20';
        canvas.tabIndex = -1;

        // Clear container and add canvas
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(canvas);

        // API routes for game files - using Production as the build name
        const buildName = 'Production';
        const loaderUrl = `/api/game-files/${buildName}.loader.js?gameName=${r2Name}`;
        const dataUrl = `/api/game-files/${buildName}.data?gameName=${r2Name}`;
        const frameworkUrl = `/api/game-files/${buildName}.framework.js?gameName=${r2Name}`;
        const wasmUrl = `/api/game-files/${buildName}.wasm?gameName=${r2Name}`;

        // Load Unity loader script
        const script = document.createElement('script');
        script.src = loaderUrl;
        script.async = true;
        scriptRef.current = script;
        
        script.onload = () => {
          if (!isMounted || !containerRef.current) return;

          // @ts-ignore - Unity global will be available after loader loads
          if (window.createUnityInstance) {
            const canvasElement = containerRef.current.querySelector('canvas');
            if (!canvasElement) {
              setError('Canvas element not found.');
              setIsLoading(false);
              return;
            }
            
            const config = {
              dataUrl: dataUrl,
              frameworkUrl: frameworkUrl,
              codeUrl: wasmUrl,
              streamingAssetsUrl: 'StreamingAssets',
              companyName: gameCompany,
              productName: gameName,
              productVersion: gameVersion,
              showBanner: (msg: string, type: string) => {
                if (type === 'error') {
                  setError(msg);
                  setIsLoading(false);
                }
              },
              devicePixelRatio: window.devicePixelRatio || 1,
              matchWebGLToCanvasSize: true,
              webglContextAttributes: {
                preserveDrawingBuffer: true,
                powerPreference: 'high-performance',
              },
            };

            // @ts-ignore
            window.createUnityInstance(canvasElement, config)
              .then((instance: any) => {
                if (!isMounted) return;
                unityInstanceRef.current = instance;
                setIsLoading(false);
              })
              .catch((err: Error) => {
                if (!isMounted) return;
                console.error('Unity instance creation failed:', err);
                setError('Failed to load game. Please check the R2 configuration.');
                setIsLoading(false);
              });
          }
        };

        script.onerror = () => {
          if (!isMounted) return;
          setError('Failed to load Unity game files from R2. Please check your configuration.');
          setIsLoading(false);
        };

        document.body.appendChild(script);

        // Cleanup
        return () => {
          isMounted = false;
          if (unityInstanceRef.current && typeof unityInstanceRef.current.Quit === 'function') {
            try {
              unityInstanceRef.current.Quit();
            } catch (e) {
              console.warn('Error quitting Unity instance:', e);
            }
          }
          
          if (scriptRef.current && scriptRef.current.parentNode) {
            scriptRef.current.parentNode.removeChild(scriptRef.current);
            scriptRef.current = null;
          }
        };
      } catch (err) {
        console.error('Error loading Unity game:', err);
        setError('Failed to initialize game.');
        setIsLoading(false);
      }
    };

    if (showGame) {
      loadUnity();
    }

    // Cleanup on unmount
    return () => {
      if (unityInstanceRef.current && typeof unityInstanceRef.current.Quit === 'function') {
        try {
          unityInstanceRef.current.Quit();
        } catch (e) {
          console.warn('Error quitting Unity instance:', e);
        }
      }
    };
  }, [showGame, gameName, r2Name, gameVersion, gameCompany, iframeUrl]);

  const reloadGame = () => {
    setError(null);
    setShowGame(false);
    if (unityInstanceRef.current) {
      try {
        unityInstanceRef.current.Quit();
      } catch (e) {
        console.warn('Error quitting Unity instance:', e);
      }
      unityInstanceRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    setTimeout(() => {
      setShowGame(true);
      setIsLoading(true);
    }, 100);
  };

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      gameContainerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="w-full h-full">
      <div 
        ref={gameContainerRef}
        className="relative bg-transparent rounded-lg overflow-hidden w-full h-full"
        style={{ 
          width, 
          height,
        }}
      >
        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            className="w-full h-full border-none"
            allow="fullscreen"
            title={gameName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Failed to load game iframe.');
              setIsLoading(false);
            }}
          />
        ) : !showGame ? (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent">
            <button
              onClick={() => {
                setShowGame(true);
                setIsLoading(true);
              }}
              disabled={isLoading}
              className={`
                relative
                bg-[#ff8a2c] 
                text-white 
                px-8 py-4 md:px-12 md:py-6 
                rounded-lg 
                transition-all 
                transform 
                text-lg md:text-2xl
                tracking-wider 
                border-4 
                border-[#ff6a1c]
                shadow-[0_8px_0_#ff5a0c]
                hover:shadow-[0_4px_0_#ff5a0c]
                hover:-translate-y-1
                active:translate-y-0
                active:shadow-[0_2px_0_#ff5a0c]
                font-press-start
                ${isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-[#ff7a1c] hover:scale-105'
                }
              `}
              style={{
                textShadow: '3px 3px 0px rgba(0,0,0,0.5), 6px 6px 0px rgba(0,0,0,0.3)',
              }}
            >
              {isLoading ? 'LOADING...' : 'START GAME'}
            </button>
          </div>
        ) : (
          <>
            <div ref={containerRef} className="w-full h-full" />
            {/* Game Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-700 px-4 py-2 flex items-center justify-end z-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white hover:scale-110 transition-all p-2 rounded-lg hover:bg-white/10"
                aria-label="Toggle fullscreen"
                title="Toggle fullscreen (ESC to exit)"
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
                  {isFullscreen ? (
                    <>
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                    </>
                  ) : (
                    <>
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </>
        )}
        
        {isLoading && showGame && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
            <div className="text-center mb-8">
              <p className="text-white text-xl mb-6 font-press-start tracking-widest" style={{
                textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
              }}>
                LOADING...
              </p>
              
              {/* Retro Loading Bar - Block Style (Battery Indicator) */}
              <div className="relative mx-auto" style={{ width: '80%', maxWidth: '400px', height: '40px' }}>
                {/* Outer border */}
                <div 
                  className="absolute inset-0 border-2 border-white"
                  style={{
                    imageRendering: 'pixelated' as any,
                  }}
                ></div>
                
                {/* Block container - fixed 20 blocks, light up from left to right */}
                <div className="absolute inset-0 flex" style={{ padding: '4px', gap: '2px' }}>
                  {Array.from({ length: 20 }, (_, i) => {
                    // Each block is 5% (100% / 20 = 5% per block)
                    // Block lights up when progress reaches its threshold
                    const blockThreshold = (i + 1) * 0.05;
                    const isLit = loadingProgress >= blockThreshold;
                    
                    return (
                      <div
                        key={i}
                        className="flex-1"
                        style={{
                          imageRendering: 'pixelated' as any,
                          backgroundColor: isLit ? 'white' : 'transparent',
                        }}
                      ></div>
                    );
                  })}
                </div>
              </div>
              
              <p className="text-white text-sm mt-4 font-press-start" style={{
                fontSize: '10px',
              }}>
                {Math.round(loadingProgress * 100)}%
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center text-white p-4">
              <p className="text-red-400 mb-4">⚠️ {error}</p>
              <button
                onClick={reloadGame}
                className="bg-white text-gray-900 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Reload Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
