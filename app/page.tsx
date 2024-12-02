'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  
  const calculateTimeLeft = () => {
  const nextNovember = new Date(new Date().getFullYear() + 1, 10, 1);
  const now = new Date();
  const difference = nextNovember.getTime() - now.getTime();

  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
  const timer = setTimeout(() => {
    setTimeLeft(calculateTimeLeft());
  }, 1000);

  return () => clearTimeout(timer);
  });

  return (
  <div>
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-black">
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex space-x-56">
        <div className="flex flex-col items-center relative">
        <div className="text-white text-[18rem] glow-effect font-alfa-slab">
          {timeLeft.days}
        </div>
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-4xl font-roboto-mono font-bold tracking-ultra-wide">DAYS</span>
        </div>
        <div className="flex flex-col items-center relative">
        <div className="text-white text-[18rem] glow-effect font-alfa-slab">
          {timeLeft.hours}
        </div>
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-4xl font-roboto-mono font-bold tracking-ultra-wide">HOURS</span>
        </div>
        <div className="flex flex-col items-center relative">
        <div className="text-white text-[18rem] glow-effect font-alfa-slab">
          {timeLeft.minutes}
        </div>
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-4xl font-roboto-mono font-bold tracking-ultra-wide">MINUTES</span>
        </div>
        <div className="flex flex-col items-center relative">
        <div className="text-white text-[18rem] glow-effect font-alfa-slab">
          {timeLeft.seconds}
        </div>
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-4xl font-roboto-mono font-bold tracking-ultra-wide">SECONDS</span>
        </div>
      </div>
      <div className="flex flex-col items-center">
      </div>
      <h1 className="text-9xl font-bold font-roboto-mono bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-500">GAMING NOVEMBER</h1>
      </div>
    </main>
    </div>
    <style jsx>{`
    .glow-effect {
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3);
    }
    .font-roboto-mono {
      font-family: 'Roboto Mono', monospace;
    }
    `}</style>
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
      aria-hidden
      src="/file.svg"
      alt="File icon"
      width={16}
      height={16}
      />
      Learn
    </a>
    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
      aria-hidden
      src="/window.svg"
      alt="Window icon"
      width={16}
      height={16}
      />
      Examples
    </a>
    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
      aria-hidden
      src="/globe.svg"
      alt="Globe icon"
      width={16}
      height={16}
      />
      Go to nextjs.org →
    </a>
    </footer>
  </div>
  );
}