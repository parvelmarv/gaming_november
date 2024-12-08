'use client';

export default function TitleYear() {
  return (
    <div className="fixed bottom-8 left-0 w-full text-center z-10 space-y-2">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center font-tilt-neon text-white glow-effect-cyan">
        GAMING NOVEMBER
      </h1>
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-orbitron text-white glow-effect-cyan">
        <span className="relative inline-block after:content-[''] after:absolute after:w-[120%] after:h-[2px] after:bg-gradient-to-r after:from-[#ff8a2c] after:to-[#ff2975] after:left-[-10%] after:top-[-5px] after:shadow-[0_0_10px_#ff8a2c,0_0_20px_#ff2975]">
          2025
        </span>
      </div>
    </div>
  );
} 