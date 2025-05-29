'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import TimeUnit from './components/TimeUnit';
import TitleYear from './components/TitleYear';
import UnityWrapper from './components/UnityWrapper';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let nextNovember = new Date(now.getFullYear(), 10, 1); // November 1st of current year
      
      // If we're past November 1st this year, set it to next year
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

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <Navbar />
      <div className="fixed inset-0 bg-[#2b1055] perspective-grid" />
      
      <div className="min-h-screen bg-gradient-to-b from-[#2b1055] via-[#7597de] to-[#ff2975] relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-[#ff2975] to-[#ff8a2c] rounded-t-full opacity-30" />
        
        <main className="relative min-h-screen p-4">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="flex flex-col items-center -mt-20">
              <div className="grid grid-cols-2 md:flex md:flex-row gap-8 md:gap-24 lg:gap-32 xl:gap-40 justify-center relative z-10">
                <TimeUnit value={timeLeft.days} label="DAYS" />
                <TimeUnit value={timeLeft.hours} label="HOURS" />
                <TimeUnit value={timeLeft.minutes} label="MINUTES" />
                <TimeUnit value={timeLeft.seconds} label="SECONDS" />
              </div>
            </div>
          </div>
          <TitleYear />
          <UnityWrapper 
            buildUrl="/games/RolloRocket"
            gameName="RolloRocket"
            gameVersion="1.0"
            gameCompany="Your Company"
          />
        </main>
      </div>
      <style jsx global>{`
        .perspective-grid {
          background-image: linear-gradient(transparent 95%, #ff2975 95%),
                            linear-gradient(90deg, transparent 95%, #ff2975 95%);
          background-size: 40px 40px;
          transform: perspective(500px) rotateX(60deg);
          transform-origin: bottom;
          height: 100%;
          opacity: 0.3;
        }

        .glow-effect {
          text-shadow: 0 0 10px #ff8a2c,
                      0 0 20px #ff8a2c,
                      0 0 30px #ff2975;
        }

        @keyframes gridMove {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 0 40px;
          }
        }

        .perspective-grid {
          animation: gridMove 1s linear infinite;
        }

        .glow-effect-cyan {
          text-shadow: 0 0 10px #00ffff,
                      0 0 20px #00ffff,
                      0 0 30px #00ffff;
        }

        .glow-effect-cyan-border {
          text-shadow: 0 0 10px #00ffff,
                      0 0 20px #00ffff;
          -webkit-text-stroke: 1px #00ffff;
        }

        .glow-effect-soft {
          text-shadow: 0 0 10px rgba(255, 138, 44, 0.7),
                      0 0 20px rgba(255, 138, 44, 0.5),
                      0 0 30px rgba(255, 41, 117, 0.3);
        }
      `}</style>
    </div>
  );
}