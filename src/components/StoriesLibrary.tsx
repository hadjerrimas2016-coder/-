import React, { useState } from 'react';
import { Story, AppMode } from '../types';
import { StoryCard } from './StoryCard';
import {
  CATEGORIES_LIST
} from '../data/storiesData';
import {
  Search,
  BookOpen,
  Sparkles,
  Flame,
  Play,
  Heart,
  Clock,
  Filter
} from 'lucide-react';
import { playClickSound, playSparkleSound } from '../utils/audio';
import { PictureBook } from '../types';
import { PictureBookBanner } from './PictureBookBanner';

interface StoriesLibraryProps {
  stories: Story[];
  mode: AppMode;
  onOpenStory: (story: Story) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  pictureBook?: PictureBook;
  onOpenPictureBook?: () => void;
  isOwnerAdmin?: boolean;
  onSaveStory?: (updatedStory: Story) => void;
  onUpdatePictureBook?: (updatedBook: PictureBook) => void;
}

export const StoriesLibrary: React.FC<StoriesLibraryProps> = ({
  stories,
  mode,
  onOpenStory,
  favorites,
  onToggleFavorite,
  pictureBook,
  onOpenPictureBook,
  isOwnerAdmin,
  onSaveStory,
  onUpdatePictureBook,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<string>('all');

  const filteredStories = stories.filter((story) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      story.category === selectedCategory ||
      (selectedCategory === 'foreign_languages' && (story.category === 'foreign_languages' || story.category === 'languages')) ||
      (selectedCategory === 'languages' && (story.category === 'foreign_languages' || story.category === 'languages'));
    const matchesSearch =
      story.title.includes(searchQuery) ||
      story.description.includes(searchQuery) ||
      story.subtitle.includes(searchQuery);
    const matchesAge =
      selectedAge === 'all' ||
      (selectedAge === 'young' && (story.ageRange.includes('5') || story.ageRange.includes('6'))) ||
      (selectedAge === 'older' && (story.ageRange.includes('8') || story.ageRange.includes('10') || story.ageRange.includes('12')));
    return matchesCategory && matchesSearch && matchesAge;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      {/* Featured Picture Book Banner in Library if available and on 'all' view */}
      {pictureBook && onOpenPictureBook && selectedCategory === 'all' && !searchQuery && (
        <PictureBookBanner
          book={pictureBook}
          mode={mode}
          onOpenBook={onOpenPictureBook}
          isOwnerAdmin={isOwnerAdmin}
          onUpdateBook={onUpdatePictureBook}
        />
      )}
      {/* Search & Quick Filters Bar */}
      <div
        className={`p-4 rounded-3xl border shadow-lg space-y-3 ${
          mode === 'day'
            ? 'bg-white/85 border-sky-100'
            : 'bg-[#181339]/90 border-purple-800/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full flex-grow">
            <Search className="w-5 h-5 absolute right-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن قصة، كوكب، بطل، أو فكرة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2.5 pr-11 pl-4 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                mode === 'day'
                  ? 'bg-sky-50/70 border-sky-200 text-slate-800'
                  : 'bg-black/30 border-purple-700 text-white placeholder-purple-300/50'
              }`}
            />
          </div>

          {/* Age Filters */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1 pl-1">
              <Filter className="w-3.5 h-3.5" />
              <span>العمر:</span>
            </span>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'young', label: '5-8 سنوات' },
              { id: 'older', label: '8-12 سنة' },
            ].map((age) => (
              <button
                key={age.id}
                onClick={() => {
                  playClickSound();
                  setSelectedAge(age.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedAge === age.id
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Scroller (Matching Attachment 2 & 3) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playSparkleSound();
                setSelectedCategory(cat.id);
              }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 border-amber-300 shadow-md scale-102'
                  : mode === 'day'
                  ? 'bg-white/70 border-sky-100 hover:bg-white text-indigo-950'
                  : 'bg-indigo-950/60 border-purple-800 hover:bg-indigo-900/60 text-purple-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Headline Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl sm:text-2xl font-black">
            {selectedCategory === 'all' ? 'جميع قصص رائد المصورة' : 'القصص المختارة'} ({filteredStories.length})
          </h2>
        </div>
        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          قصص صوتية وتفاعلية
        </span>
      </div>

      {/* Stories Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              mode={mode}
              onOpenStory={onOpenStory}
              isFavorite={favorites.includes(story.id)}
              onToggleFavorite={onToggleFavorite}
              isOwnerAdmin={isOwnerAdmin}
              onSaveStory={onSaveStory}
            />
          ))}
        </div>
      ) : (
        <div
          className={`p-10 rounded-3xl border text-center space-y-3 ${
            mode === 'day'
              ? 'bg-white/80 border-sky-100'
              : 'bg-indigo-950/50 border-purple-800'
          }`}
        >
          <span className="text-5xl block">🔍</span>
          <h3 className="font-extrabold text-lg">لم نعثر على قصص تطابق بحثك</h3>
          <p className="text-xs opacity-75">جرب البحث بكلمة أخرى أو اختيار جميع الأقسام</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setSelectedAge('all');
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}

      {/* Quick Listen List Layout (Matching Attachment 2: "مزيد من قصص التعلم") */}
      <div className="pt-4 space-y-3">
        <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
          <span>💡</span>
          <span>استمع فورًا للقصص المفضلة</span>
        </h3>

        <div className="space-y-2.5">
          {stories.slice(0, 3).map((st) => (
            <div
              key={st.id}
              onClick={() => {
                playClickSound();
                onOpenStory(st);
              }}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                mode === 'day'
                  ? 'bg-white/90 border-sky-100 hover:shadow-md'
                  : 'bg-[#181339]/80 border-purple-800/60 hover:bg-[#20184b]'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={st.coverImage || '/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png'}
                  alt={st.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png';
                  }}
                  className="w-16 h-14 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-black text-sm sm:text-base leading-tight">{st.title}</h4>
                  <p className="text-xs opacity-70 line-clamp-1 mt-0.5">{st.subtitle}</p>
                  <div className="flex items-center gap-3 text-[10px] opacity-75 mt-1 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{st.duration}</span>
                    </span>
                    <span>{st.ageRange}</span>
                  </div>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Play className="w-5 h-5 fill-current translate-x-[-1px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
