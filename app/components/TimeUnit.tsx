'use client';

import { useEffect, useState } from 'react';

interface TimeUnitProps {
  value: number;
  label: string;
}

export default function TimeUnit({ value, label }: TimeUnitProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client render, show a placeholder
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center relative w-[80px] sm:w-[120px] md:w-[160px] lg:w-[200px]">
        <div className="relative flex flex-col items-center w-full">
          <div className="text-white text-[3rem] sm:text-[4rem] md:text-[6rem] lg:text-[8rem] glow-effect font-orbitron tabular-nums leading-none mb-1 sm:mb-2 md:mb-4 flex justify-center">
            <span className="inline-block transform -translate-x-[8%]">
              --
            </span>
          </div>
          <div className="text-white text-sm sm:text-base md:text-xl lg:text-3xl font-roboto-mono font-bold tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] lg:tracking-ultra-wide opacity-60 text-center">
            {label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative w-[80px] sm:w-[120px] md:w-[160px] lg:w-[200px]">
      <div className="relative flex flex-col items-center w-full">
        <div className="text-white text-[3rem] sm:text-[4rem] md:text-[6rem] lg:text-[8rem] glow-effect font-orbitron tabular-nums leading-none mb-1 sm:mb-2 md:mb-4 flex justify-center">
          <span className="inline-block transform -translate-x-[8%]">
            {value}
          </span>
        </div>
        <div className="text-white text-sm sm:text-base md:text-xl lg:text-3xl font-roboto-mono font-bold tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] lg:tracking-ultra-wide opacity-60 text-center">
          {label}
        </div>
      </div>
    </div>
  );
} 