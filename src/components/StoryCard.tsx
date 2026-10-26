import React, { useState, useEffect } from 'react';
import { Story, AppMode } from '../types';
import { Play, Heart, Clock, Users, Image as ImageIcon } from 'lucide-react';
import { playClickSound, playSparkleSound } from '../utils/audio';
import { getStoryCover } from '../utils/customCovers';
import { StoryCoverPickerModal } from './StoryCoverPickerModal';

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
  const [coverUrl, setCoverUrl] = useState<string>(() =>
    getStoryCover(story.id, story.coverImage)
  );
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState<boolean>(false);

  useEffect(() => {
    // Update local state when prop changes
    setCoverUrl(getStoryCover(story.id, story.coverImage));

    const handleCustomCoverEvent = (e: any) => {
      if (e.detail && e.detail.storyId === story.id) {
        setCoverUrl(e.detail.coverUrl || story.coverImage);
      }
    };

    window.addEventListener('raed_story_cover_updated', handleCustomCoverEvent);
    return () => {
      window.removeEventListener('raed_story_cover_updated', handleCustomCoverEvent);
    };
  }, [story.id, story.coverImage]);

  return (
    <>
      <div
        onClick={() => {
          playClickSound();
          onOpenStory({ ...story, coverImage: coverUrl });
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
            src={coverUrl}
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

          {/* Quick Cover Change Button on Card */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              setIsCoverPickerOpen(true);
            }}
            className="absolute bottom-2.5 left-2.5 z-10 px-2 py-1 rounded-full text-[10px] font-black bg-black/70 hover:bg-pink-600 text-purple-100 hover:text-white backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1 transition-all cursor-pointer opacity-85 group-hover:opacity-100 hover:scale-105"
            title="تغيير غلاف هذه القصة بنفسك 🎨"
          >
            <ImageIcon className="w-3 h-3 text-amber-300" />
            <span>تغيير الغلاف 🖼️</span>
          </button>

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
            <h3
              className={`font-black text-base sm:text-lg mb-1 leading-snug ${
                mode === 'day' ? 'text-indigo-950' : 'text-white'
              }`}
            >
              {story.title}
            </h3>
            <p
              className={`text-xs line-clamp-2 leading-relaxed ${
                mode === 'day' ? 'text-slate-600' : 'text-purple-200/80'
              }`}
            >
              {story.subtitle}
            </p>
          </div>

          {/* Card Footer Bar */}
          <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
                mode === 'day' ? 'bg-sky-50 text-sky-800' : 'bg-purple-950 text-yellow-300'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>{story.ageRange}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setIsCoverPickerOpen(true);
                }}
                className={`p-1.5 rounded-full transition-transform active:scale-80 hover:bg-white/20 ${
                  mode === 'day' ? 'text-slate-500 hover:text-amber-500' : 'text-purple-300 hover:text-amber-300'
                }`}
                title="تخصيص غلاف القصة"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
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
      </div>

      {/* Cover Picker Modal */}
      <StoryCoverPickerModal
        storyId={story.id}
        storyTitle={story.title}
        currentCover={coverUrl}
        defaultCover={story.coverImage}
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onCoverUpdated={(newCover) => setCoverUrl(newCover)}
      />
    </>
  );
};

