'use client';

import { useEffect, useRef, useState } from 'react';

interface UnityWrapperProps {
  buildUrl: string;
  width?: number;
  height?: number;
  gameName?: string;
  gameVersion?: string;
  gameCompany?: string;
}

export default function UnityWrapper({ 
  buildUrl, 
  width = 960, 
  height = 540,
  gameName = "RolloRocket",
  gameVersion = "1.0.0",
  gameCompany = "DefaultCompany"
}: UnityWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unityInstance, setUnityInstance] = useState<any>(null);
  const [showGame, setShowGame] = useState(false);
  const [isVersionChecked, setIsVersionChecked] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('/game-version.json');
        const data = await response.json();
        const storedVersion = localStorage.getItem('gameVersion');
        
        if (!storedVersion || parseInt(storedVersion) < data.version) {
          if (unityInstance) {
            unityInstance.Quit();
            setUnityInstance(null);
          }
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
          localStorage.setItem('gameVersion', data.version.toString());
        }
      } catch (e) {
        console.error('Error checking game version:', e);
      } finally {
        setIsVersionChecked(true);
      }
    };

    checkVersion();
  }, []);

  useEffect(() => {
    if (!isVersionChecked || !showGame) return;
    
    let isMounted = true;
    const container = containerRef.current;
    if (!container) return;

    const loadUnity = async () => {
      try {
        const loaderUrl = '/api/game-files/Production.loader.js';
        const dataUrl = '/api/game-files/Production.data';
        const frameworkUrl = '/api/game-files/Production.framework.js';
        const wasmUrl = '/api/game-files/Production.wasm';

        if (unityInstance) {
          unityInstance.Quit();
          setUnityInstance(null);
        }

        container.innerHTML = '';
        
        container.innerHTML = `
          <div id="unity-container" class="unity-desktop">
            <canvas id="unity-canvas" width="${width}" height="${height}" tabindex="-1"></canvas>
            <div id="unity-loading-bar">
              <div id="unity-logo"></div>
              <div id="unity-progress-bar-empty">
                <div id="unity-progress-bar-full"></div>
              </div>
            </div>
            <div id="unity-warning"></div>
          </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
          #unity-container {
            width: 100%;
            height: 100%;
            margin: auto;
            position: relative;
            overflow: hidden;
            background: #231F20;
          }
          #unity-canvas {
            width: 100%;
            height: 100%;
            background: #231F20;
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000;
            will-change: transform;
            object-fit: contain;
            outline: none;
            border: none;
          }
          #unity-loading-bar {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
          }
          #unity-logo {
            width: 154px;
            height: 130px;
            background: url('${buildUrl}/../TemplateData/unity-logo-dark.png') no-repeat center;
            margin-bottom: 20px;
          }
          #unity-progress-bar-empty {
            width: 141px;
            height: 18px;
            background: url('${buildUrl}/../TemplateData/progress-bar-empty-dark.png') no-repeat center;
          }
          #unity-progress-bar-full {
            width: 0%;
            height: 18px;
            background: url('${buildUrl}/../TemplateData/progress-bar-full-dark.png') no-repeat center;
          }
          #unity-warning {
            position: absolute;
            left: 50%;
            top: 5%;
            transform: translate(-50%);
            background: white;
            padding: 10px;
            display: none;
          }
          @media (max-width: 960px) {
            #unity-container {
              width: 100%;
              height: 100vh;
            }
            #unity-canvas {
              width: 100%;
              height: 100%;
            }
          }
          @media (min-width: 961px) {
            #unity-container {
              width: 960px;
              height: 600px;
            }
            #unity-canvas {
              width: 960px;
              height: 600px;
            }
          }
          :fullscreen #unity-container {
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          :fullscreen #unity-canvas {
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        `;
        document.head.appendChild(style);

        const script = document.createElement('script');
        script.src = loaderUrl;
        script.async = true;

        script.onload = () => {
          const config = {
            dataUrl: dataUrl,
            frameworkUrl: frameworkUrl,
            codeUrl: wasmUrl,
            streamingAssetsUrl: "StreamingAssets",
            companyName: gameCompany,
            productName: gameName,
            productVersion: gameVersion,
            showBanner: (msg: string, type: string) => {
              if (type === 'error') setError(msg);
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
            onProgress: (progress: number) => {
              const progressBar = document.querySelector('#unity-progress-bar-full');
              if (progressBar instanceof HTMLElement) {
                progressBar.style.width = `${100 * progress}%`;
              }
            }
          };

          (window as any).createUnityInstance(document.querySelector('#unity-canvas'), config).then((instance: any) => {
            if (!isMounted) return;
            
            setUnityInstance(instance);
            setIsLoading(false);

            const loadingBar = document.querySelector('#unity-loading-bar');
            if (loadingBar instanceof HTMLElement) {
              loadingBar.style.display = 'none';
            }

            const unityCanvas = document.querySelector('#unity-canvas') as HTMLCanvasElement;
            if (unityCanvas) {
              unityCanvas.style.pointerEvents = 'auto';
            }
          }).catch((message: string) => {
            if (!isMounted) return;
            console.error(message);
            setError(`Failed to load game: ${message}`);
            setIsLoading(false);
          });
        };

        script.onerror = () => {
          if (!isMounted) return;
          setError('Failed to load game files. Please try reloading.');
          setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
          isMounted = false;
          if (unityInstance) {
            try {
              unityInstance.Quit();
              setUnityInstance(null);
            } catch (e) {
              console.error(e);
            }
          }
          if (container) {
            container.innerHTML = '';
          }
          style.remove();
          URL.revokeObjectURL(loaderUrl);
          URL.revokeObjectURL(dataUrl);
          URL.revokeObjectURL(frameworkUrl);
          URL.revokeObjectURL(wasmUrl);
        };
      } catch (error) {
        console.error(error);
        setError('Failed to load game files');
        setIsLoading(false);
      }
    };

    loadUnity();

    return () => {
      if (unityInstance) {
        unityInstance.Quit();
      }
    };
  }, [buildUrl, width, height, gameName, gameVersion, gameCompany, showGame]);

  const reloadGame = () => {
    setError(null);
    setIsLoading(false);
    setShowGame(false);
    if (unityInstance) {
      unityInstance.Quit();
      setUnityInstance(null);
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  return (
    <div className="relative bg-transparent group">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="bg-red-500 text-white p-6 rounded-lg text-center">
            <p className="mb-4">{error}</p>
            <button
              onClick={reloadGame}
              className="bg-white text-red-500 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Reload Game
            </button>
          </div>
        </div>
      )}
      {!showGame ? (
        <div className="flex items-center justify-center min-h-[540px] bg-transparent">
          <button
            onClick={() => {
              if (!isLoading) {
                setShowGame(true);
                setIsLoading(true);
              }
            }}
            disabled={isLoading}
            className={`bg-[#ff8a2c] text-white px-8 py-4 rounded-lg transition-all transform font-press-start text-lg tracking-wider border-2 border-[#ff9a3c] [text-shadow:_2px_2px_0_rgb(0_0_0_/_40%)] ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#ff7a1c] hover:scale-105 shadow-[0_4px_0_#ff6a1c] hover:shadow-[0_6px_0_#ff6a1c] hover:-translate-y-1'
            }`}
          >
            {isLoading ? 'LOADING...' : 'START GAME'}
          </button>
        </div>
      ) : (
        <div className="relative">
          <div ref={containerRef} className="unity-container" />
          <div className="flex justify-end absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 pointer-events-none">
            <button
              onClick={() => {
                const container = containerRef.current;
                if (!container) return;
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  container.requestFullscreen();
                }
              }}
              className="text-white/50 hover:text-white hover:scale-110 transition-all pointer-events-auto bg-black/50 p-2 rounded-lg backdrop-blur-sm"
              aria-label="Toggle fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
