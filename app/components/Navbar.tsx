'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-black/80 backdrop-blur-md z-50 border-b border-white/10">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-6 py-4">
        <Link 
          href="/" 
          className="text-2xl font-orbitron text-white hover:text-purple-300 transition-colors duration-300"
        >
          GN
        </Link>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
        </button>
        
        <div className={`${isOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`}>
          <ul className="flex flex-col p-4 md:p-0 mt-4 md:flex-row md:space-x-8 md:mt-0">
            <li>
              <Link 
                href="/warmup" 
                className="block py-2 px-3 text-white/90 hover:text-white font-geist-sans text-sm font-medium tracking-wide transition-all duration-300 hover:bg-white/5 rounded-lg"
              >
                RolloRocket
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
} 