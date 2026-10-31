import React, { useState } from 'react';
import { Story, AppMode } from '../types';
import { StoryCard } from './StoryCard';
import { InteractiveAlphabetGarden } from './InteractiveAlphabetGarden';
import {
  Globe,
  Sparkles,
  Volume2,
  BookOpen,
  Award,
  Languages,
  ArrowRight,
  Headphones,
  Check,
  Star
} from 'lucide-react';
import { playClickSound, playSparkleSound, speakArabicSpeech } from '../utils/audio';

interface ForeignLanguagesCornerProps {
  stories: Story[];
  mode: AppMode;
  onOpenStory: (story: Story) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onEarnStars?: (amount: number) => void;
}

interface VocabCard {
  word: string;
  lang: 'en' | 'fr';
  langLabel: string;
  translation: string;
  phonetic: string;
  emoji: string;
  example: string;
}

const DAILY_VOCAB: VocabCard[] = [
  {
    word: 'Star',
    lang: 'en',
    langLabel: 'إنجليزية',
    translation: 'نجمة',
    phonetic: '/stɑːr/',
    emoji: '⭐',
    example: 'The star shines in the night sky.'
  },
  {
    word: 'Friendship',
    lang: 'en',
    langLabel: 'إنجليزية',
    translation: 'صداقة',
    phonetic: '/ˈfrɛnd.ʃɪp/',
    emoji: '🤝',
    example: 'True friendship is a precious treasure.'
  },
  {
    word: 'Le Papillon',
    lang: 'fr',
    langLabel: 'فرنسية',
    translation: 'الفراشة',
    phonetic: '/pa.pi.jɔ̃/',
    emoji: '🦋',
    example: 'Le papillon vole parmi les roses parfumées.'
  },
  {
    word: 'Le Livre',
    lang: 'fr',
    langLabel: 'فرنسية',
    translation: 'الكتاب',
    phonetic: '/liːvʁ/',
    emoji: '📖',
    example: 'Ce livre raconte une histoire merveilleuse.'
  },
  {
    word: 'Spaceship',
    lang: 'en',
    langLabel: 'إنجليزية',
    translation: 'مركبة فضائية',
    phonetic: '/ˈspeɪs.ʃɪp/',
    emoji: '🚀',
    example: 'The spaceship travels to distant planets.'
  },
  {
    word: 'Le Cœur',
    lang: 'fr',
    langLabel: 'فرنسية',
    translation: 'القلب / المحبة',
    phonetic: '/kœʁ/',
    emoji: '💖',
    example: 'Parler avec le cœur rend tout plus doux.'
  }
];

export const ForeignLanguagesCorner: React.FC<ForeignLanguagesCornerProps> = ({
  stories,
  mode,
  onOpenStory,
  favorites,
  onToggleFavorite,
  onEarnStars,
}) => {
  const [selectedLang, setSelectedLang] = useState<'all' | 'en' | 'fr' | 'bilingual'>('all');
  const [activeVocabWord, setActiveVocabWord] = useState<string | null>(null);

  // Filter foreign language stories
  const foreignStories = stories.filter(
    (s) => s.category === 'foreign_languages' || s.category === 'languages' || s.badge?.includes('English') || s.badge?.includes('Français')
  );

  const filteredStories = foreignStories.filter((s) => {
    if (selectedLang === 'all') return true;
    if (selectedLang === 'en') {
      return s.title.includes('Astronaut') || s.badge?.includes('English') || s.description.includes('English');
    }
    if (selectedLang === 'fr') {
      return s.title.includes('Jardin') || s.badge?.includes('Français') || s.description.includes('Français');
    }
    if (selectedLang === 'bilingual') {
      return s.badge?.includes('&') || s.title.includes('|');
    }
    return true;
  });

  const handlePronounceVocab = (card: VocabCard) => {
    playSparkleSound();
    setActiveVocabWord(card.word);
    setTimeout(() => setActiveVocabWord(null), 1800);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(card.word);
      utterance.lang = card.lang === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }

    if (onEarnStars) {
      onEarnStars(5);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-7 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div
        className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${
          mode === 'day'
            ? 'bg-gradient-to-r from-emerald-100 via-teal-50 to-indigo-50 border-emerald-300 text-slate-800'
            : 'bg-gradient-to-r from-[#0d2e24] via-[#09221d] to-[#121330] border-emerald-500/50 text-white shadow-emerald-950/60'
        }`}
      >
        <div className="space-y-3.5 max-w-xl text-center md:text-right flex-grow">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '14s' }} />
            <span>نادي اللغات الأجنبية للأبطال الصغار</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black leading-tight flex items-center justify-center md:justify-start gap-2">
            <span>قصص وحكايات باللغات العالمية</span>
            <span className="text-3xl">🌍✨</span>
          </h1>

          <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
            تعلّم الإنجليزية والفرنسية من خلال حكايات شيقة ومشوقة، مع نصوص ثنائية متوازية، وقراءة صوتية نقية لتدريب الأذن، وبطاقات مفردات ذكية تكسبك نجوماً إضافية!
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap pt-1">
            <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-bold border border-white/10 flex items-center gap-1.5">
              <span>🇬🇧</span>
              <span>English Stories</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-bold border border-white/10 flex items-center gap-1.5">
              <span>🇫🇷</span>
              <span>Histoires en Français</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>+40 نجمة لكل تسجيل صوتي</span>
            </span>
          </div>
        </div>

        {/* Mascot Illustration */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border-2 border-emerald-400/40 shadow-2xl flex-shrink-0 bg-emerald-950/40">
          <img
            src="/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png"
            alt="Foreign Languages Stories"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
            <span className="text-white text-[11px] font-black drop-shadow">
              🌟 استمع وتعلّم وسجّل بصوتك
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Alphabet Garden with Delightful Touch Effects (حديقة الحروف التفاعلية 🔤✨) */}
      <InteractiveAlphabetGarden
        mode={mode}
        onEarnStars={onEarnStars}
      />

      {/* Interactive Daily Vocabulary Flashcards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-black">
              بنك الكلمات الذكية للأبطال (اضغط واستمع للنطق 🎧)
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+5 نجوم لكل كلمة</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DAILY_VOCAB.map((card) => {
            const isPlaying = activeVocabWord === card.word;
            return (
              <div
                key={card.word}
                onClick={() => handlePronounceVocab(card)}
                className={`group p-3.5 rounded-2xl border text-center space-y-2 cursor-pointer transition-all hover:-translate-y-1 active:scale-95 shadow-md relative overflow-hidden ${
                  isPlaying
                    ? 'bg-emerald-500 text-emerald-950 border-emerald-300 scale-105 shadow-emerald-400/50'
                    : mode === 'day'
                    ? 'bg-white border-emerald-200 text-slate-800 hover:border-emerald-400'
                    : 'bg-[#122822]/90 border-emerald-600/40 text-emerald-100 hover:border-emerald-400'
                }`}
              >
                <div className="text-2xl group-hover:scale-125 transition-transform">
                  {card.emoji}
                </div>
                <div>
                  <div className="font-black text-sm text-emerald-300 font-mono">
                    {card.word}
                  </div>
                  <div className="text-[11px] font-bold text-amber-400">
                    {card.translation}
                  </div>
                  <div className="text-[9px] opacity-70 dir-ltr font-mono">
                    {card.phonetic}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-center">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 ${
                    isPlaying ? 'bg-black/20 text-white' : 'bg-white/10 text-emerald-300'
                  }`}>
                    <Volume2 className="w-3 h-3" />
                    <span>نطق الكلمة</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all' as const, label: 'جميع القصص العالمية', icon: '🌍' },
            { id: 'en' as const, label: 'الإنجليزية (English)', icon: '🇬🇧' },
            { id: 'fr' as const, label: 'الفرنسية (Français)', icon: '🇫🇷' },
            { id: 'bilingual' as const, label: 'قصص ثنائية اللغة', icon: '🌟' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setSelectedLang(tab.id);
              }}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                selectedLang === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 font-black shadow-lg scale-105'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-emerald-400">
          متوفر {filteredStories.length} قصة
        </span>
      </div>

      {/* Story Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            mode={mode}
            onOpenStory={onOpenStory}
            isFavorite={favorites.includes(story.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
