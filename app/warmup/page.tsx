'use client';

import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';

const UnityWrapper = dynamic(() => import('../components/UnityWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[540px]">
      <div className="text-white text-xl glow-effect-cyan">Loading game...</div>
    </div>
  ),
});

export default function WarmupPage() {
  return (
    <div className="relative">
      <Navbar />
      <div className="fixed inset-0 bg-[#2b1055] perspective-grid" />
      
      <div className="min-h-screen bg-gradient-to-b from-[#2b1055] via-[#7597de] to-[#ff2975] relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-[#ff2975] to-[#ff8a2c] rounded-t-full opacity-30" />
        
        <main className="relative min-h-screen p-4">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-[960px] aspect-[16/10] relative z-10">
              <UnityWrapper 
                buildUrl="/games/RolloRocket/Build"
                gameName="RolloRocket"
                gameVersion="1.0.0"
                gameCompany="DefaultCompany"
              />
            </div>
          </div>
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