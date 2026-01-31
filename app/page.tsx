'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import GameSection from './components/GameSection';

export default function Home() {
  const [showScrollCTA, setShowScrollCTA] = useState(true);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const scrollTop = target.scrollTop;
      
      if (scrollTop > 100) {
        setShowScrollCTA(false);
      } else {
        setShowScrollCTA(true);
      }
    };

    const snapContainer = document.querySelector('.snap-y');
    if (snapContainer) {
      snapContainer.addEventListener('scroll', handleScroll);
      return () => snapContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToGame = () => {
    const container = document.querySelector('.snap-y');
    
    if (container) {
      container.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-[#2b1055] via-[#7597de] to-[#ff2975] relative snap-y snap-mandatory overflow-y-auto h-screen">
        <HeroSection onScrollClick={scrollToGame} showScrollCTA={showScrollCTA} />
        <GameSection />
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          overflow-y: auto !important;
          overflow-x: hidden;
        }

        .glow-effect {
          text-shadow: 0 0 10px #ff8a2c,
                      0 0 20px #ff8a2c,
                      0 0 30px #ff2975;
        }
      `}</style>
    </div>
  );
}
