'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './UnityWrapper.module.css';

// Global instance tracker
let globalUnityInstance: any = null;
let globalAudioContext: AudioContext | null = null;

// Add type declaration for window.createUnityInstance
declare global {
  interface Window {
    createUnityInstance: (
      canvas: HTMLElement,
      config: {
        dataUrl: string;
        frameworkUrl: string;
        codeUrl: string;
        streamingAssetsUrl: string;
        companyName: string;
        productName: string;
        productVersion: string;
        showBanner?: (msg: string, type: string) => void;
        onProgress: (progress: number) => void;
      }
    ) => Promise<any>;
  }
}

interface UnityWrapperProps {
  buildUrl: string;
  gameName: string;
  gameVersion: string;
  gameCompany: string;
}

const globalInstanceTracker = {
  instance: null as any,
  script: null as HTMLScriptElement | null,
  audioContext: null as AudioContext | null,
};

export default function UnityWrapper({
  buildUrl,
  gameName,
  gameVersion,
  gameCompany,
}: UnityWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUnity = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Clean up any existing Unity instance
        if (globalInstanceTracker.instance) {
          try {
            await globalInstanceTracker.instance.Quit();
          } catch (e) {
            console.warn('Error during Unity instance cleanup:', e);
          }
          globalInstanceTracker.instance = null;
        }

        // Clean up audio context
        if (globalInstanceTracker.audioContext) {
          try {
            await globalInstanceTracker.audioContext.close();
          } catch (e) {
            console.warn('Error during audio context cleanup:', e);
          }
          globalInstanceTracker.audioContext = null;
        }

        // Remove existing script if it exists
        if (globalInstanceTracker.script) {
          document.head.removeChild(globalInstanceTracker.script);
          globalInstanceTracker.script = null;
        }

        // Get canvas element
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('Canvas element not found');
        }
        canvas.id = 'unity-canvas';

        // Show loading bar
        if (loadingBarRef.current) {
          loadingBarRef.current.style.display = 'block';
        }

        // Create new audio context
        globalInstanceTracker.audioContext = new AudioContext();

        // Load Unity script
        const script = document.createElement('script');
        script.src = `${buildUrl}/Build/ProductionBr.loader.js`;
        script.async = true;
        
        // Wait for script to load
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Unity script'));
          document.head.appendChild(script);
          globalInstanceTracker.script = script;
        });

        // Create Unity instance
        const instance = await window.createUnityInstance(canvas, {
          dataUrl: `${buildUrl}/Build/ProductionBr.data.br`,
          frameworkUrl: `${buildUrl}/Build/ProductionBr.framework.js.br`,
          codeUrl: `${buildUrl}/Build/ProductionBr.wasm.br`,
          streamingAssetsUrl: `${buildUrl}/StreamingAssets`,
          companyName: gameCompany,
          productName: gameName,
          productVersion: gameVersion,
          showBanner: (msg: string, type: string) => {
            console.log(`Unity ${type}: ${msg}`);
          },
          onProgress: (progress: number) => {
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${100 * progress}%`;
            }
          }
        });

        globalInstanceTracker.instance = instance;
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Unity:', error);
        setError(error instanceof Error ? error.message : 'Failed to load Unity');
        setIsLoading(false);
      }
    };

    loadUnity();

    return () => {
      // Cleanup on unmount
      if (globalInstanceTracker.instance) {
        try {
          globalInstanceTracker.instance.Quit();
        } catch (e) {
          console.warn('Error during Unity instance cleanup:', e);
        }
        globalInstanceTracker.instance = null;
      }
      if (globalInstanceTracker.audioContext) {
        try {
          globalInstanceTracker.audioContext.close();
        } catch (e) {
          console.warn('Error during audio context cleanup:', e);
        }
        globalInstanceTracker.audioContext = null;
      }
      if (globalInstanceTracker.script) {
        document.head.removeChild(globalInstanceTracker.script);
        globalInstanceTracker.script = null;
      }
    };
  }, [buildUrl, gameName, gameVersion, gameCompany]);

  return (
    <div className={styles.container} ref={containerRef}>
      <canvas ref={canvasRef} className={styles.canvas} width={960} height={600} tabIndex={-1} />
      {isLoading && (
        <div ref={loadingBarRef} className={styles.loadingBar}>
          <div className={styles.logo} />
          <div className={styles.progressBarEmpty}>
            <div ref={progressBarRef} className={styles.progressBarFull} />
          </div>
        </div>
      )}
      {error && (
        <div className={styles.error}>
          <p>Error loading game: {error}</p>
          <p>Please make sure the Unity build files are in the correct location.</p>
        </div>
      )}
    </div>
  );
} 