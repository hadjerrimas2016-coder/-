import React from 'react';
import { AppMode } from '../types';

interface SkyBackgroundProps {
  mode: AppMode;
}

export const SkyBackground: React.FC<SkyBackgroundProps> = ({ mode }) => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-1000">
      {mode === 'day' ? (
        // DAY SKY WITH CLOUDS
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-200 to-amber-50">
          {/* Friendly Sun with Rays */}
          <div className="absolute top-6 left-8 md:top-12 md:left-24">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 shadow-[0_0_60px_rgba(251,191,36,0.6)] gentle-pulse" />
              {/* Sun rays */}
              <div className="absolute w-36 h-36 md:w-48 md:h-48 rounded-full border border-amber-300/40 animate-spin" style={{ animationDuration: '30s' }} />
              {/* Cute smiling sun face */}
              <div className="absolute flex flex-col items-center">
                <div className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-amber-800/80 block" />
                  <span className="w-2 h-2 rounded-full bg-amber-800/80 block" />
                </div>
                <div className="w-5 h-2.5 border-b-2 border-amber-800/80 rounded-full mt-1" />
              </div>
            </div>
          </div>

          {/* Drifting Clouds (Multiple Speeds & Layers) */}
          {/* Cloud 1 - Slow Large */}
          <div className="absolute top-16 right-[-20%] cloud-slow opacity-95">
            <svg width="220" height="90" viewBox="0 0 220 90" fill="white" className="drop-shadow-md">
              <path d="M40 70 A25 25 0 0 1 65 30 A35 35 0 0 1 125 20 A30 30 0 0 1 175 40 A25 25 0 0 1 190 70 Z" />
            </svg>
          </div>

          {/* Cloud 2 - Medium */}
          <div className="absolute top-36 right-[-10%] cloud-medium opacity-90">
            <svg width="180" height="75" viewBox="0 0 180 75" fill="white" className="drop-shadow">
              <path d="M30 60 A20 20 0 0 1 50 25 A30 30 0 0 1 105 18 A25 25 0 0 1 145 35 A20 20 0 0 1 160 60 Z" />
            </svg>
          </div>

          {/* Cloud 3 - Lower Fast */}
          <div className="absolute top-64 right-[-30%] cloud-fast opacity-85">
            <svg width="250" height="100" viewBox="0 0 250 100" fill="white" className="drop-shadow-md">
              <path d="M50 80 A30 30 0 0 1 80 35 A45 45 0 0 1 150 25 A35 35 0 0 1 205 45 A30 30 0 0 1 225 80 Z" />
            </svg>
          </div>

          {/* Cloud 4 - Floating near bottom */}
          <div className="absolute bottom-20 right-[-15%] cloud-slow opacity-80" style={{ animationDelay: '-18s' }}>
            <svg width="160" height="70" viewBox="0 0 160 70" fill="white" className="drop-shadow">
              <path d="M25 55 A18 18 0 0 1 45 22 A28 28 0 0 1 95 15 A22 22 0 0 1 130 32 A18 18 0 0 1 145 55 Z" />
            </svg>
          </div>

          {/* Decorative flying hot air balloon */}
          <div className="absolute top-28 right-24 md:right-48 float-mascot opacity-90 hidden sm:block">
            <div className="flex flex-col items-center">
              <div className="w-12 h-14 rounded-full bg-gradient-to-b from-rose-400 via-amber-300 to-indigo-400 border-2 border-white shadow-md relative overflow-hidden">
                <div className="w-2 h-full bg-white/50 mx-auto" />
              </div>
              <div className="w-2.5 h-3 bg-amber-800 rounded-sm mt-0.5" />
            </div>
          </div>
        </div>
      ) : (
        // NIGHT SKY WITH TWINKLING STARS
        <div className="absolute inset-0 bg-gradient-to-b from-[#090b1e] via-[#141238] to-[#251545]">
          {/* Glowing Crescent Moon */}
          <div className="absolute top-8 left-8 md:top-14 md:left-24">
            <div className="relative">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full shadow-[0_0_50px_rgba(253,224,71,0.5)] flex items-center justify-center">
                <span className="text-6xl md:text-7xl select-none filter drop-shadow-[0_0_20px_#fde047]">
                  🌙
                </span>
              </div>
              <span className="absolute -top-1 -right-2 text-xl twinkle-star">✨</span>
            </div>
          </div>

          {/* Shooting Stars */}
          <div className="absolute top-20 right-32 w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-200 to-white shooting-star-1" />
          <div className="absolute top-48 right-72 w-36 h-0.5 bg-gradient-to-r from-transparent via-cyan-200 to-white shooting-star-2" />

          {/* Twinkling Stars Matrix */}
          <div className="absolute inset-0">
            {[
              { top: '10%', left: '15%', size: 'w-2 h-2', delay: '0.2s' },
              { top: '14%', left: '45%', size: 'w-3 h-3', delay: '1.2s' },
              { top: '22%', left: '75%', size: 'w-2.5 h-2.5', delay: '0.7s' },
              { top: '28%', left: '28%', size: 'w-2 h-2', delay: '2.1s' },
              { top: '35%', left: '88%', size: 'w-3 h-3', delay: '1.5s' },
              { top: '42%', left: '12%', size: 'w-2.5 h-2.5', delay: '0.9s' },
              { top: '48%', left: '60%', size: 'w-3.5 h-3.5', delay: '2.5s' },
              { top: '55%', left: '35%', size: 'w-2 h-2', delay: '0.4s' },
              { top: '65%', left: '82%', size: 'w-3 h-3', delay: '1.8s' },
              { top: '72%', left: '20%', size: 'w-2 h-2', delay: '1.1s' },
              { top: '80%', left: '50%', size: 'w-3 h-3', delay: '0.3s' },
              { top: '85%', left: '92%', size: 'w-2.5 h-2.5', delay: '2.3s' },
              { top: '18%', left: '90%', size: 'w-2 h-2', delay: '1.7s' },
              { top: '60%', left: '5%', size: 'w-2.5 h-2.5', delay: '0.8s' },
              { top: '90%', left: '30%', size: 'w-2 h-2', delay: '1.4s' },
            ].map((star, idx) => (
              <div
                key={idx}
                className={`absolute ${star.size} rounded-full bg-yellow-200 shadow-[0_0_10px_#fef08a] twinkle-star`}
                style={{
                  top: star.top,
                  left: star.left,
                  animationDelay: star.delay,
                }}
              />
            ))}

            {/* Cross/Sparkle stars */}
            <div className="absolute top-[16%] left-[62%] twinkle-star text-yellow-300 text-lg" style={{ animationDelay: '0.5s' }}>
              ✦
            </div>
            <div className="absolute top-[38%] left-[40%] twinkle-star text-amber-200 text-xl" style={{ animationDelay: '1.9s' }}>
              ✦
            </div>
            <div className="absolute top-[70%] left-[68%] twinkle-star text-yellow-100 text-base" style={{ animationDelay: '1.3s' }}>
              ✦
            </div>
            <div className="absolute top-[25%] left-[8%] twinkle-star text-purple-200 text-lg" style={{ animationDelay: '2.7s' }}>
              ✦
            </div>
          </div>

          {/* Cosmic Glow / Nebula */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        </div>
      )}
    </div>
  );
};
