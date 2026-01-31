'use client';

import { useEffect, useState } from 'react';
import TimeUnit from './TimeUnit';

interface HeroSectionProps {
  onScrollClick: () => void;
  showScrollCTA: boolean;
}

export default function HeroSection({ onScrollClick, showScrollCTA }: HeroSectionProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let nextNovember = new Date(now.getFullYear(), 10, 1);
      
      if (now > nextNovember) {
        nextNovember = new Date(now.getFullYear() + 1, 10, 1);
      }
      
      const difference = nextNovember.getTime() - now.getTime();

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative px-6 py-20 snap-start snap-always">
      <div className="flex flex-row gap-8 sm:gap-16 md:gap-24 lg:gap-32 justify-center mb-16 animate-fade-in">
        <TimeUnit value={timeLeft.days} label="DAYS" />
        <TimeUnit value={timeLeft.hours} label="HOURS" />
        <TimeUnit value={timeLeft.minutes} label="MINUTES" />
        <TimeUnit value={timeLeft.seconds} label="SECONDS" />
      </div>

      <div className="text-center space-y-4 mb-20">
        <p className="text-lg md:text-xl font-space-grotesk text-white/50 uppercase tracking-[0.3em] mb-8">
          Until
        </p>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-tilt-neon neon-text-cyan leading-tight">
            GAMING
          </h1>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-tilt-neon neon-text-cyan leading-tight">
            NOVEMBER '26
          </h2>
        </div>
      </div>

      <div className={`fixed bottom-8 left-0 right-0 flex flex-col items-center gap-4 pointer-events-none z-50 transition-opacity duration-500 ${showScrollCTA ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={onScrollClick}
          className="pointer-events-auto group flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          <span className="text-sm md:text-base font-space-grotesk text-white/70 uppercase tracking-[0.2em] group-hover:text-white/90 transition-colors">
            Play a game while you wait
          </span>
          <div className="w-12 h-12 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white/70 group-hover:text-white/90 transition-colors animate-bounce" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </button>
      </div>
    </section>
  );
}
