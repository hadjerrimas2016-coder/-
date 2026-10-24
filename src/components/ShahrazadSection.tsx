import React from 'react';
import { AppMode, Story } from '../types';
import { SHAHRAZAD_CHARACTERS } from '../data/storiesData';
import { Sparkles, Moon, Crown, ChevronLeft, BookOpen } from 'lucide-react';
import { playSparkleSound, playClickSound } from '../utils/audio';

interface ShahrazadSectionProps {
  mode: AppMode;
  onOpenStoryById: (storyId: string) => void;
}

export const ShahrazadSection: React.FC<ShahrazadSectionProps> = ({ mode, onOpenStoryById }) => {
  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md text-xl">
            👸
          </div>
          <div>
            <h3 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
              mode === 'day' ? 'text-indigo-950' : 'text-white'
            }`}>
              <span>عالم شهرزاد وقصص ألف ليلة وليلة</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            </h3>
            <p className={`text-xs ${mode === 'day' ? 'text-slate-600' : 'text-purple-200/80'}`}>
              أميرة الحكايات، فرسان البساط الطائر، والقباب البنفسجية في ليالي بغداد السحرية
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
          <Moon className="w-3.5 h-3.5 text-yellow-300" />
          <span>7 شخصيات أسطورية</span>
        </span>
      </div>

      {/* Grid of Shahrazad Cards (Matching Screenshot 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {SHAHRAZAD_CHARACTERS.map((char) => (
          <div
            key={char.id}
            onClick={() => {
              playSparkleSound();
              if (char.storyId) {
                onOpenStoryById(char.storyId);
              }
            }}
            className={`group rounded-3xl p-3 border cursor-pointer transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center justify-between ${
              mode === 'day'
                ? 'bg-gradient-to-b from-purple-50 via-white to-indigo-50 border-purple-200 hover:border-purple-400 shadow-md'
                : 'bg-gradient-to-b from-[#1f1245] via-[#160c33] to-[#100726] border-purple-800/80 hover:border-purple-500 shadow-lg shadow-purple-950/60'
            }`}
          >
            {/* Circular Avatar with Glowing Ring */}
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src={char.image}
                  alt={char.title}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="absolute -top-1 -right-1 text-sm">✨</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1 mb-2">
              <h4 className={`font-black text-xs sm:text-sm leading-tight ${
                mode === 'day' ? 'text-indigo-950' : 'text-purple-100'
              }`}>
                {char.title}
              </h4>
              <p className={`text-[10px] line-clamp-2 leading-relaxed ${
                mode === 'day' ? 'text-slate-600' : 'text-purple-300/80'
              }`}>
                {char.subtitle}
              </p>
            </div>

            {/* Read Button */}
            <button className="w-full py-1.5 px-2 rounded-xl text-[10px] font-bold bg-purple-600/20 hover:bg-purple-600 hover:text-white border border-purple-400/40 text-purple-300 flex items-center justify-center gap-1 transition-all group-hover:bg-purple-600 group-hover:text-white">
              <BookOpen className="w-3 h-3" />
              <span>اقرأ الحكاية</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
