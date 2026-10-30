import React from 'react';
import { AppMode } from '../types';
import { SHAHRAZAD_CHARACTERS } from '../data/storiesData';
import { Sparkles, Moon, BookOpen } from 'lucide-react';
import { playSparkleSound, playClickSound } from '../utils/audio';
import { ShahrazadCharacterAvatar } from './ShahrazadCharacterAvatar';

interface ShahrazadSectionProps {
  mode: AppMode;
  onOpenStoryById: (storyId: string) => void;
}

export const ShahrazadSection: React.FC<ShahrazadSectionProps> = ({ mode, onOpenStoryById }) => {
  const handleCardClick = (e: React.MouseEvent, storyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    playClickSound();
    playSparkleSound();
    onOpenStoryById(storyId || 'shahrazad-origin');
  };

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md text-xl">
            👸
          </div>
          <div>
            <h3
              className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
                mode === 'day' ? 'text-indigo-950' : 'text-white'
              }`}
            >
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

      {/* Grid of Shahrazad Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {SHAHRAZAD_CHARACTERS.map((char) => {
          const targetStoryId = char.storyId || 'shahrazad-origin';
          return (
            <div
              key={char.id}
              onClick={(e) => handleCardClick(e, targetStoryId)}
              className={`group rounded-3xl p-3 border cursor-pointer transition-all duration-300 hover:-translate-y-2 active:scale-95 flex flex-col items-center text-center justify-between shadow-lg ${
                mode === 'day'
                  ? 'bg-gradient-to-b from-purple-50 via-white to-indigo-50 border-purple-200 hover:border-amber-400 shadow-md'
                  : 'bg-gradient-to-b from-[#1f1245] via-[#160c33] to-[#100726] border-purple-800/80 hover:border-amber-400 shadow-purple-950/60'
              }`}
            >
              {/* Circular Avatar with Glowing Ring */}
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 shadow-md group-hover:scale-110 transition-transform overflow-hidden flex items-center justify-center">
                  <ShahrazadCharacterAvatar characterId={char.id} size="md" showBadge={false} />
                </div>
                <span className="absolute -top-1 -right-1 text-sm animate-pulse">✨</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1 mb-2">
                <h4
                  className={`font-black text-xs sm:text-sm leading-tight ${
                    mode === 'day' ? 'text-indigo-950' : 'text-purple-100 group-hover:text-amber-300 transition-colors'
                  }`}
                >
                  {char.title}
                </h4>
                <p
                  className={`text-[10px] line-clamp-2 leading-relaxed ${
                    mode === 'day' ? 'text-slate-600' : 'text-purple-300/80'
                  }`}
                >
                  {char.subtitle}
                </p>
              </div>

              {/* Read Button */}
              <button
                type="button"
                onClick={(e) => handleCardClick(e, targetStoryId)}
                className="w-full py-1.5 px-2 rounded-xl text-[10px] font-bold bg-purple-600/30 hover:bg-gradient-to-r hover:from-amber-400 hover:to-yellow-500 hover:text-amber-950 border border-purple-400/40 text-purple-200 flex items-center justify-center gap-1 transition-all shadow cursor-pointer group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-500 group-hover:text-amber-950 group-hover:border-amber-300 group-hover:font-black"
              >
                <BookOpen className="w-3 h-3" />
                <span>اقرأ الحكاية</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
