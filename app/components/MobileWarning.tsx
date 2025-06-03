'use client';

import { useEffect, useState } from 'react';
import { isMobileDevice } from '../utils/deviceDetection';

export default function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Mobile Device Detected</h2>
        <p className="text-gray-600 mb-6">
          For the best gaming experience, we recommend playing on a desktop computer.
          The game is optimized for larger screens and keyboard controls.
        </p>
        <button
          onClick={() => setIsMobile(false)}
          className="bg-[#ff8a2c] text-white px-6 py-3 rounded-lg hover:bg-[#ff7a1c] transition-colors"
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );
} 