'use client';

import { useEffect, useState } from 'react';

interface TimeUnitProps {
  value: number;
  label: string;
  // Allow overriding default sizing classes
  numberClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
}

export default function TimeUnit({ 
  value, 
  label,
  numberClassName = "text-[3rem] sm:text-[4rem] md:text-[6rem] lg:text-[8rem]",
  labelClassName = "text-sm sm:text-base md:text-xl lg:text-3xl tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] lg:tracking-ultra-wide",
  containerClassName = "w-[80px] sm:w-[120px] md:w-[160px] lg:w-[200px]"
}: TimeUnitProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client render, show a placeholder
  if (!mounted) {
    return (
      <div className={`flex flex-col items-center justify-center relative ${containerClassName}`}>
        <div className="relative flex flex-col items-center w-full">
          <div className={`text-white glow-effect font-orbitron tabular-nums leading-none mb-1 sm:mb-2 md:mb-4 flex justify-center ${numberClassName}`}>
            <span className="inline-block transform -translate-x-[8%]">
              --
            </span>
          </div>
          <div className={`text-white font-roboto-mono font-bold text-center ${labelClassName}`}>
            {label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center relative ${containerClassName}`}>
      <div className="relative flex flex-col items-center w-full">
        <div className={`text-white glow-effect font-orbitron tabular-nums leading-none mb-1 sm:mb-2 md:mb-4 flex justify-center ${numberClassName}`}>
          <span className="inline-block transform -translate-x-[8%]">
            {value}
          </span>
        </div>
          <div className={`text-white font-roboto-mono font-bold text-center ${labelClassName}`}>
            {label}
          </div>
      </div>
    </div>
  );
}
