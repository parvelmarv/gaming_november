'use client';

import { useEffect, useRef, useState } from 'react';
import { downloadGameFile } from '@/lib/gameStorage';

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
  const [memoryWarning, setMemoryWarning] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentGameVersion, setCurrentGameVersion] = useState<number>(0);
  const [isVersionChecked, setIsVersionChecked] = useState(false);

  // Persistent logging function
  const persistentLog = (message: string, type: 'info' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = { timestamp, message, type };
    
    // Update state
    setLogs(prev => [...prev, logEntry].slice(-100)); // Keep last 100 logs
    
    // Store in localStorage
    try {
      const storedLogs = localStorage.getItem('unity_logs');
      const allLogs = storedLogs ? JSON.parse(storedLogs) : [];
      allLogs.push(logEntry);
      // Keep only last 1000 logs in localStorage
      localStorage.setItem('unity_logs', JSON.stringify(allLogs.slice(-1000)));
    } catch (e) {
      console.error('Failed to store log:', e);
    }

    // Log everything to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[UnityWrapper] ${message}`);
    } else if (type === 'error' || type === 'warning') {
      console.log(`[UnityWrapper] ${message}`);
    }
  };

  // Load stored logs on mount
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('unity_logs');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs).slice(-100));
      }
    } catch (e) {
      console.error('Failed to load stored logs:', e);
    }
  }, []);

  // Check game version
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('/game-version.json');
        const data = await response.json();
        const storedVersion = localStorage.getItem('gameVersion');
        
        // Always set the current version
        setCurrentGameVersion(data.version);
        
        if (!storedVersion || parseInt(storedVersion) < data.version) {
          // Clear Unity cache
          if (unityInstance) {
            unityInstance.Quit();
            setUnityInstance(null);
          }
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
          // Store new version
          localStorage.setItem('gameVersion', data.version.toString());
          persistentLog(`Game version updated to ${data.version}`);
        }
      } catch (e) {
        persistentLog(`Error checking game version: ${e}`, 'error');
      } finally {
        setIsVersionChecked(true);
      }
    };

    checkVersion();
  }, []);

  // Only load Unity after version check
  useEffect(() => {
    if (!isVersionChecked || !showGame) return;
    
    let isMounted = true;
    const container = containerRef.current;
    if (!container) return;

    persistentLog('Unity effect triggered', 'info');

    // Add global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      persistentLog(`Global error: ${event.message}`, 'error');
      setError(`Game error: ${event.message}`);
      event.preventDefault();
    };

    // Add unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      persistentLog(`Unhandled promise rejection: ${event.reason}`, 'error');
      setError(`Game error: ${event.reason}`);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    const loadUnity = async () => {
      try {
        // Use API routes to serve files with proper headers
        const loaderUrl = '/api/game-files/Production.loader.js';
        const dataUrl = '/api/game-files/Production.data';
        const frameworkUrl = '/api/game-files/Production.framework.js';
        const wasmUrl = '/api/game-files/Production.wasm';

        // Clear any existing Unity instance
        if (unityInstance) {
          unityInstance.Quit();
          setUnityInstance(null);
        }

        // Clear container
        container.innerHTML = '';
        
        persistentLog('Starting Unity initialization');
        
        // Create Unity container structure
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

        // Add Unity styles
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
          @keyframes typing {
            from { width: 0 }
            to { width: 100% }
          }
          @keyframes blink {
            50% { border-color: transparent }
          }
          .typewriter {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            animation: 
              typing 1.5s steps(10, end),
              blink .75s step-end infinite;
            border-right: 3px solid white;
          }
          .fps-counter {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
          }
        `;
        document.head.appendChild(style);

        // Load Unity loader
        const script = document.createElement('script');
        script.src = loaderUrl;
        persistentLog(`Attempting to load Unity from R2`, 'info');
        script.async = true;

        script.onload = () => {
          persistentLog('Unity loader script loaded');
          
          const config = {
            dataUrl: dataUrl,
            frameworkUrl: frameworkUrl,
            codeUrl: wasmUrl,
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
              const progressBar = document.querySelector('#unity-progress-bar-full');
              if (progressBar instanceof HTMLElement) {
                progressBar.style.width = `${100 * progress}%`;
              }
            }
          };

          (window as any).createUnityInstance(document.querySelector('#unity-canvas'), config, (progress: number) => {
            const percent = Math.round(100 * progress);
            persistentLog(`Loading progress: ${percent}%`);
            const progressBar = document.querySelector('#unity-progress-bar-full');
            if (progressBar instanceof HTMLElement) {
              progressBar.style.width = `${100 * progress}%`;
            }
          }).then((instance: any) => {
            if (!isMounted) return;
            
            persistentLog('Unity instance created successfully');
            setUnityInstance(instance);
            setIsLoading(false);

            // Hide loading bar when Unity is ready
            const loadingBar = document.querySelector('#unity-loading-bar');
            if (loadingBar instanceof HTMLElement) {
              loadingBar.style.display = 'none';
            }

            // Optimize canvas for better performance
            const unityCanvas = document.querySelector('#unity-canvas') as HTMLCanvasElement;
            if (unityCanvas) {
              // Enable hardware acceleration
              unityCanvas.style.transform = 'translateZ(0)';
              unityCanvas.style.backfaceVisibility = 'hidden';
              unityCanvas.style.perspective = '1000px';
              unityCanvas.style.willChange = 'transform';
              
              // Optimize for touch devices
              unityCanvas.style.touchAction = 'none';
              
              // Set canvas to high priority
              unityCanvas.style.pointerEvents = 'auto';

              // Add WebGL context error handling
              unityCanvas.addEventListener('webglcontextlost', (e) => {
                persistentLog('WebGL context lost - attempting to restore', 'warning');
                e.preventDefault();
                // Attempt to restore context
                setTimeout(() => {
                  if (unityCanvas.getContext('webgl2')) {
                    persistentLog('WebGL context restored successfully');
                  } else {
                    persistentLog('Failed to restore WebGL context', 'error');
                    setError('Graphics context lost. Please reload the game.');
                  }
                }, 1000);
              }, false);
            }

            // Monitor scene loading
            instance.Module.onRuntimeInitialized = () => {
              persistentLog('Unity runtime initialized');
              
              // Set Unity to run at maximum frame rate
              instance.SetFullscreen(0);
              instance.SetQualityLevel(5); // Highest quality level
              
              // Monitor scene loading
              const originalLoadScene = instance.Module.SceneManager.LoadScene;
              instance.Module.SceneManager.LoadScene = function(sceneName: string) {
                persistentLog(`Attempting to load scene: ${sceneName}`);
                try {
                  const result = originalLoadScene.call(this, sceneName);
                  persistentLog(`Scene load started: ${sceneName}`);
                  return result;
                } catch (e: any) {
                  persistentLog(`Error loading scene ${sceneName}: ${e.message}`, 'error');
                  setError(`Failed to load level: ${e.message}`);
                  throw e;
                }
              };
            };

          }).catch((message: string) => {
            if (!isMounted) return;
            persistentLog(`Error creating Unity instance: ${message}`, 'error');
            setError(`Failed to load game: ${message}`);
            setIsLoading(false);
          });
        };

        script.onerror = (error) => {
          if (!isMounted) return;
          persistentLog(`Error loading script: ${error}`, 'error');
          persistentLog(`Attempted to load from: ${buildUrl}/ProductionBr.loader.js`, 'error');
          setError('Failed to load game files. Please try reloading.');
          setIsLoading(false);
        };

        document.body.appendChild(script);

        // Add memory monitoring
        const memoryInterval = setInterval(() => {
          try {
            if (window.performance && (window.performance as any).memory) {
              const memory = (window.performance as any).memory;
              const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
              const totalMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
              
              // Only log if memory usage is high
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
        }, 10000); // Check every 10 seconds instead of 5

        return () => {
          isMounted = false;
          clearInterval(memoryInterval);
          window.removeEventListener('error', handleGlobalError);
          window.removeEventListener('unhandledrejection', handleUnhandledRejection);
          if (unityInstance) {
            try {
              unityInstance.Quit();
              setUnityInstance(null);
            } catch (e) {
              persistentLog(`Error during Unity cleanup: ${e}`, 'error');
            }
          }
          if (container) {
            container.innerHTML = '';
          }
          style.remove();
          // Clean up blob URLs
          URL.revokeObjectURL(loaderUrl);
          URL.revokeObjectURL(dataUrl);
          URL.revokeObjectURL(frameworkUrl);
          URL.revokeObjectURL(wasmUrl);
        };
      } catch (error) {
        persistentLog(`Error loading Unity: ${error}`, 'error');
        setError('Failed to load game files');
        setIsLoading(false);
      }
    };

    if (showGame) {
      loadUnity();
    }

    return () => {
      if (unityInstance) {
        unityInstance.Quit();
      }
    };
  }, [buildUrl, width, height, gameName, gameVersion, gameCompany, showGame]);

  const reloadGame = () => {
    setError(null);
    setMemoryWarning(false);
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
    <div className="relative bg-transparent">
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
      {memoryWarning && !error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg z-10">
          High memory usage detected. Consider reloading the game.
        </div>
      )}
      {!showGame ? (
        <div className="flex items-center justify-center min-h-[540px] bg-transparent">
          <button
            onClick={() => {
              persistentLog('Start button clicked', 'info');
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
          <div className="bg-gray-800 p-2 flex justify-end absolute bottom-0 left-0 right-0">
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
              className="text-white hover:text-[#ff8a2c] transition-colors"
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