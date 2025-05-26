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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unityInstance, setUnityInstance] = useState<any>(null);
  const [memoryWarning, setMemoryWarning] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

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

    // Also log to console
    console.log(`[UnityWrapper] ${message}`);
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

  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    if (!container) return;

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
            display: none;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
          }
          #unity-logo {
            width: 154px;
            height: 130px;
            background: url('${buildUrl}/../TemplateData/unity-logo-dark.png') no-repeat center;
            margin: 0 auto;
          }
          #unity-progress-bar-empty {
            width: 141px;
            height: 18px;
            margin: 10px auto;
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

        // Load Unity loader
        const script = document.createElement('script');
        script.src = `${buildUrl}/ProductionGz.loader.js`;
        script.async = true;

        script.onload = () => {
          persistentLog('Unity loader script loaded');
          
          const config = {
            dataUrl: `${buildUrl}/ProductionGz.data.gz`,
            frameworkUrl: `${buildUrl}/ProductionGz.framework.js.gz`,
            codeUrl: `${buildUrl}/ProductionGz.wasm.gz`,
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
            },
          };

          // Create Unity instance with optimized settings
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
          persistentLog(`Attempted to load from: ${buildUrl}/ProductionGz.loader.js`, 'error');
          setError('Failed to load game files. Please try reloading.');
          setIsLoading(false);
        };

        // Add error handling for file loading
        const checkFileExists = async (url: string) => {
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
              persistentLog(`File not found: ${url}`, 'error');
              return false;
            }
            return true;
          } catch (e) {
            persistentLog(`Error checking file ${url}: ${e}`, 'error');
            return false;
          }
        };

        // Check if all required files exist
        const checkFiles = async () => {
          const files = [
            `${buildUrl}/ProductionGz.loader.js`,
            `${buildUrl}/ProductionGz.data.gz`,
            `${buildUrl}/ProductionGz.framework.js.gz`,
            `${buildUrl}/ProductionGz.wasm.gz`
          ];

          for (const file of files) {
            const exists = await checkFileExists(file);
            if (!exists) {
              persistentLog(`Required file missing: ${file}`, 'error');
              setError(`Failed to load game files. Missing: ${file.split('/').pop()}`);
              setIsLoading(false);
              return false;
            }
          }
          return true;
        };

        // Check files before loading
        checkFiles().then(exists => {
          if (exists) {
            document.body.appendChild(script);
          }
        });

        // Add memory monitoring
        const memoryInterval = setInterval(() => {
          try {
            if (window.performance && (window.performance as any).memory) {
              const memory = (window.performance as any).memory;
              const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
              const totalMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
              persistentLog(`Memory usage: ${usedMB}MB / ${totalMB}MB`, usedMB > totalMB * 0.8 ? 'warning' : 'info');
              
              if (usedMB > totalMB * 0.8) {
                persistentLog('Warning: High memory usage detected', 'warning');
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
        }, 5000);

        return () => {
          isMounted = false;
          clearInterval(memoryInterval);
          window.removeEventListener('error', handleGlobalError);
          window.removeEventListener('unhandledrejection', handleUnhandledRejection);
          if (unityInstance) {
            unityInstance.Quit();
          }
          if (container) {
            container.innerHTML = '';
          }
          style.remove();
        };
      } catch (e: any) {
        persistentLog(`Error in Unity initialization: ${e.message}`, 'error');
        setError(`Failed to initialize game: ${e.message}`);
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
    setIsLoading(true);
    if (unityInstance) {
      unityInstance.Quit();
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  return (
    <div className="relative">
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
      <h1 className="text-6xl font-monoton text-[#ff8a2c] text-center mb-4 glow-effect tracking-wider">WARMUP GAME</h1>
      {!showGame ? (
        <div className="flex items-center justify-center min-h-[540px] bg-gray-900">
          <button
            onClick={() => setShowGame(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Load Game
          </button>
        </div>
      ) : (
        <div className="relative">
          <div ref={containerRef} className="unity-container" />
          <div className="bg-gray-800 p-2 flex justify-end">
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