import React from 'react';
import { Star, Award, Sparkles, Trophy, Zap, Mic, BookOpen, Gamepad2 } from 'lucide-react';
import { AppMode } from '../types';
import { playSparkleSound } from '../utils/audio';

interface StarsRewardBannerProps {
  starsCount: number;
  mode: AppMode;
  onOpenReadingClub?: () => void;
}

export const StarsRewardBanner: React.FC<StarsRewardBannerProps> = ({
  starsCount,
  mode,
  onOpenReadingClub,
}) => {
  // Rank calculations
  const ranks = [
    { title: 'المستكشف المبتدئ 🌟', min: 0, max: 150 },
    { title: 'قارئ النجوم الواعد ⭐', min: 150, max: 350 },
    { title: 'حارس الحكايات الذهبية 💫', min: 350, max: 600 },
    { title: 'أمير المعرفة والبيان 👑', min: 600, max: 1000 },
    { title: 'أسطورة نادي القراءة 🏆', min: 1000, max: 9999 },
  ];

  const currentRank = ranks.find((r) => starsCount >= r.min && starsCount < r.max) || ranks[ranks.length - 1];
  const nextRank = ranks[ranks.indexOf(currentRank) + 1] || currentRank;
  const progressToNext = Math.min(
    100,
    Math.max(10, Math.round(((starsCount - currentRank.min) / (nextRank.max - currentRank.min)) * 100))
  );

  return (
    <div
      onClick={playSparkleSound}
      className={`relative rounded-3xl p-4 sm:p-5 border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
        mode === 'day'
          ? 'bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-50 border-amber-300/80 text-amber-950'
          : 'bg-gradient-to-r from-[#211403] via-[#1a0f02] to-[#120a01] border-amber-500/60 text-white shadow-[0_0_30px_rgba(245,158,11,0.2)]'
      }`}
    >
      {/* Right Side: Rank and Stars */}
      <div className="flex items-center gap-3.5 text-center md:text-right">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-400/40 animate-pulse">
          ⭐
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
              نظام مكافآت النجوم
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {currentRank.title}
            </span>
          </div>

          <div className="flex items-baseline gap-2 justify-center md:justify-start">
            <span className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono">
              {starsCount}
            </span>
            <span className="text-xs font-bold text-amber-200">نجمة خيال مكتسبة</span>
          </div>
        </div>
      </div>

      {/* Middle: Progress Bar */}
      <div className="w-full max-w-xs space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-amber-300/90">
          <span>الرتبة القادمة: {nextRank.title}</span>
          <span>{starsCount} / {nextRank.max} ⭐</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden p-0.5 border border-amber-400/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 transition-all duration-700 shadow-md"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      </div>

      {/* Left: Star Reward Rules Quick Pill Indicators */}
      <div className="flex items-center gap-2 flex-wrap justify-center text-[10px] font-bold">
        <span className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/10 text-amber-300 flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-amber-400" />
          <span>قراءة قصة: +20 ⭐</span>
        </span>

        <span className="px-2.5 py-1 rounded-xl bg-pink-900/40 border border-pink-400/30 text-pink-300 flex items-center gap-1">
          <Mic className="w-3 h-3 text-pink-400" />
          <span>تسجيل صوتك: +40 ⭐</span>
        </span>

        <span className="px-2.5 py-1 rounded-xl bg-purple-900/40 border border-purple-400/30 text-purple-300 flex items-center gap-1">
          <Gamepad2 className="w-3 h-3 text-purple-400" />
          <span>ألعاب التحدي: +35 ⭐</span>
        </span>
      </div>
    </div>
  );
};
