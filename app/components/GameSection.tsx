'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useOrientation } from '../hooks/useOrientation';

const UnityWrapper = dynamic(() => import('./UnityWrapper'), {
  ssr: false
});

export default function GameSection() {
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
    <section id="game-section" className="h-screen w-full flex flex-col items-center justify-center relative px-6 py-20 snap-start snap-always">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-monoton text-[#ff8a2c] text-center glow-effect tracking-wider mb-12 z-10">
        ROLLO ROCKET
      </h1>

      <div className="w-full max-w-6xl aspect-video relative bg-black rounded-xl p-4 shadow-[0_0_40px_rgba(255,41,117,0.2)] border border-[#ff2975]/30 backdrop-blur-xl group hover:shadow-[0_0_60px_rgba(0,245,255,0.2)] transition-all duration-500 my-10 overflow-hidden" style={{ maxHeight: '60vh', maxWidth: '106vh' }}>
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-black ring-1 ring-white/5">
          {isLandscape ? (
            <div className="w-full h-full">
              <UnityWrapper 
                buildUrl="/games/RolloRocket/Build"
                gameName="RolloRocket"
                gameVersion="1.0.0"
                gameCompany="DefaultCompany"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-lg text-white p-8 text-center border border-white/5">
              <div className="text-6xl mb-6 text-[#00f5ff] animate-spin-slow">⟳</div>
              <p className="text-xl md:text-2xl font-orbitron text-white tracking-widest mb-2">PLEASE ROTATE</p>
              <p className="text-sm font-space-grotesk text-[#ff2975] tracking-[0.2em] uppercase">Landscape Mode Required</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
