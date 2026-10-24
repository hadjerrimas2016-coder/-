import React from 'react';
import { Story, AppMode } from '../types';
import { Play, Heart, Sparkles, Clock, Users } from 'lucide-react';
import { playClickSound, playSparkleSound } from '../utils/audio';

interface StoryCardProps {
  story: Story;
  mode: AppMode;
  onOpenStory: (story: Story) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  mode,
  onOpenStory,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={() => {
        playClickSound();
        onOpenStory(story);
      }}
      className={`group relative rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-lg flex flex-col justify-between ${
        mode === 'day'
          ? 'bg-white/90 border-sky-100 shadow-indigo-100/50 hover:shadow-xl hover:border-amber-300'
          : 'bg-[#181339]/90 border-purple-800/60 shadow-purple-950/60 hover:shadow-2xl hover:border-purple-500'
      }`}
    >
      {/* Top Image Thumbnail */}
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-900">
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          loading="lazy"
        />

        {/* Top Badges (Duration & Category) */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md flex items-center gap-1 shadow">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{story.duration}</span>
          </span>

          {story.badge && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 shadow-sm">
              {story.badge}
            </span>
          )}
        </div>

        {/* Category Pill Tag */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-700/85 text-white backdrop-blur-md border border-purple-400/30 flex items-center gap-1 shadow">
            <span>{story.categoryIcon}</span>
            <span>{story.categoryLabel}</span>
          </span>
        </div>

        {/* Big Play Overlay Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25 backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-amber-400 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-current translate-x-[-1px]" />
          </div>
        </div>
      </div>

      {/* Story Card Info */}
      <div className="p-3.5 flex flex-col justify-between flex-grow">
        <div>
          <h3 className={`font-black text-base sm:text-lg mb-1 leading-snug ${
            mode === 'day' ? 'text-indigo-950' : 'text-white'
          }`}>
            {story.title}
          </h3>
          <p className={`text-xs line-clamp-2 leading-relaxed ${
            mode === 'day' ? 'text-slate-600' : 'text-purple-200/80'
          }`}>
            {story.subtitle}
          </p>
        </div>

        {/* Card Footer Bar */}
        <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
            mode === 'day' ? 'bg-sky-50 text-sky-800' : 'bg-purple-950 text-yellow-300'
          }`}>
            <Users className="w-3 h-3" />
            <span>{story.ageRange}</span>
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playSparkleSound();
              onToggleFavorite(story.id);
            }}
            className={`p-1.5 rounded-full transition-transform active:scale-80 hover:bg-white/20 ${
              isFavorite ? 'text-rose-500' : mode === 'day' ? 'text-slate-400' : 'text-purple-400'
            }`}
            aria-label="المفضلة"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
