'use client';

import Image from 'next/image';

interface LeaderboardEntry {
  name: string;
  points: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { name: 'Huke', points: 60 },
  { name: 'Nabbe', points: 54 },
  { name: 'Bane', points: 48.5 },
  { name: 'Abbe', points: 46 },
  { name: 'Krulos', points: 25 },
  { name: 'Povel', points: 16.6 },
  { name: 'Alle m mullor', points: 0 },
  { name: 'Pjosk', points: 0 },
  { name: 'Gardner', points: -5 },
];

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2b1055] via-[#7597de] to-[#ff2975] pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12 font-tilt-neon glow-effect-cyan">
          Last Year&apos;s Standings
        </h2>
        <div className="bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="divide-y divide-purple-500/30">
            {leaderboardData.map((entry, index) => (
              <div
                key={entry.name}
                className={`
                  flex items-center justify-between p-6 hover:bg-purple-500/10 transition-colors
                  ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/30 via-amber-400/30 to-yellow-500/30 border-l-4 border-yellow-400' :
                    index === 1 ? 'bg-gradient-to-r from-slate-400/30 via-gray-300/30 to-slate-400/30 border-l-4 borrder white-400' :
                    index === 2 ? 'bg-gradient-to-r from-amber-900/30 via-amber-800/30 to-amber-900/30 border-l-4' : ''
                  }
                `}
              >
                <div className="flex items-center space-x-4">
                  <span className={`text-3xl font-bold w-12 font-alfa-slab ${
                    index === 0 ? 'text-yellow-300' :
                    index === 1 ? 'text-slate-300' :
                    index === 2 ? 'text-amber-700' :
                    'text-white'
                  }`}>
                    {index + 1}.
                  </span>
                  <span className={`text-2xl font-medium font-alfa-slab ${
                    index === 0 ? 'text-yellow-300' :
                    index === 1 ? 'text-slate-300' :
                    index === 2 ? 'text-amber-700' :
                    'text-white'
                  }`}>
                    {entry.name}
                  </span>
                </div>
                <span className={`text-2xl font-mono ${
                  index === 0 ? 'text-yellow-300' :
                  index === 1 ? 'text-slate-300' :
                  index === 2 ? 'text-amber-700' :
                  'text-white'
                }`}>
                  {entry.points.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 