import React from 'react';
import { PictureBook, AppMode } from '../types';
import { Sparkles, BookOpen, ChevronLeft } from 'lucide-react';
import { playClickSound, playSparkleSound } from '../utils/audio';

interface PictureBookBannerProps {
  book: PictureBook;
  mode: AppMode;
  onOpenBook: () => void;
}

export const PictureBookBanner: React.FC<PictureBookBannerProps> = ({ book, mode, onOpenBook }) => {
  const safeCover = book?.coverImage || '/assets/aistudio/Capture_d__cran_2026-10-20_135700_a8f3d8ee.png';
  const safeTitle = book?.title || 'قصة ليان وسر الجوهرة المصونة';
  const safeBadge = book?.badge || 'كتاب مصوّر تفاعلي بالصفحات والصوت';
  const safeSubtitle =
    book?.subtitle ||
    'تصفّح الحكاية صفحة بصفحة كرسوم كرتونية ساحرة مع نصوص مشكولة. استمع بصوت الراوي 🎧 . وسجّل قراءتك بصوتك لكسب 40+ نقطة خيال!';

  return (
    <div
      onClick={() => {
        playSparkleSound();
        onOpenBook();
      }}
      className={`group relative rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 hover:scale-[1.008] shadow-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 ${
        mode === 'day'
          ? 'bg-gradient-to-r from-purple-100 via-pink-50 to-amber-50 border-purple-300/80 shadow-purple-200/50 hover:border-pink-500'
          : 'bg-[#180a2c] border-purple-800/80 shadow-[0_0_35px_rgba(40,15,65,0.7)] hover:border-pink-500'
      }`}
    >
      {/* Right Column in RTL: Badge, Title, Subtitle, and Big CTA Button (Matching Screenshot 3) */}
      <div className="space-y-3.5 max-w-xl text-center md:text-right order-2 md:order-1 flex-grow">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-900/50 border border-purple-500/40 text-purple-200 font-extrabold text-xs shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
          <span>{safeBadge}</span>
        </div>

        {/* Big Story Title */}
        <h2
          className={`text-2xl sm:text-3xl lg:text-4xl font-black leading-tight flex items-center justify-center md:justify-start gap-2 ${
            mode === 'day' ? 'text-indigo-950' : 'text-white'
          }`}
        >
          <span>{safeTitle}</span>
          <span className="text-2xl">💎</span>
        </h2>

        {/* Description & Rewards */}
        <p
          className={`text-xs sm:text-sm font-medium leading-relaxed ${
            mode === 'day' ? 'text-slate-700' : 'text-purple-200/90'
          }`}
        >
          {safeSubtitle}
        </p>

        {/* CTA Button matching Screenshot 3 */}
        <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              onOpenBook();
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d926aa] via-[#f72585] to-[#f89b29] hover:from-[#e033b5] hover:to-[#ffa63d] text-white font-black text-xs sm:text-sm shadow-xl shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-pink-300/40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>اقرأ واستمع للكتاب المصوّر</span>
            <BookOpen className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Left Column in RTL: Illustrated Book Cover (Matching Screenshot 3) */}
      <div className="relative flex-shrink-0 order-1 md:order-2">
        <div className="relative w-44 h-56 sm:w-52 sm:h-64 rounded-3xl overflow-hidden border border-purple-400/30 shadow-2xl group-hover:scale-105 transition-transform bg-purple-950/40">
          <img
            src={safeCover}
            alt={safeTitle}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
