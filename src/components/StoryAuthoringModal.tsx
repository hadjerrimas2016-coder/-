import React, { useState } from 'react';
import { AppMode, Story, UserAudioRecording } from '../types';
import { PenTool, X, Sparkles, Volume2, Save, Check, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playFanfareSound, playSparkleSound, playClickSound, speakArabicSpeech, stopArabicSpeech } from '../utils/audio';

interface StoryAuthoringModalProps {
  mode: AppMode;
  onClose: () => void;
  onSaveStory?: (story: Story) => void;
  onEarnStars: (amount: number) => void;
  isOwnerAdmin?: boolean;
  onSaveUserRecording?: (recording: UserAudioRecording) => void;
}

export const StoryAuthoringModal: React.FC<StoryAuthoringModalProps> = ({
  mode,
  onClose,
  onSaveStory,
  onEarnStars,
  isOwnerAdmin = false,
  onSaveUserRecording,
}) => {
  const [title, setTitle] = useState<string>('مغامرة في وادي النجوم');
  const [hero, setHero] = useState<string>('رائد الصغير');
  const [heroEmoji, setHeroEmoji] = useState<string>('🧑‍🚀');
  const [location, setLocation] = useState<string>('قصر شهرزاد الساحر 🕌');
  const [storyBody, setStoryBody] = useState<string>(
    'في يوم مشرق انطلق بطلنا في رحلة لاكتشاف الكنز المخفي وراء الجبال، وهناك التقى بأصدقاء لطفاء ساعدوه على نشر الخير والفرح.'
  );
  const [isReading, setIsReading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<string>('');

  const heroes = [
    { name: 'رائد الصغير', emoji: '🧑‍🚀' },
    { name: 'شهرزاد اليافعة', emoji: '👸' },
    { name: 'الثعلب الذكي', emoji: '🦊' },
    { name: 'التنين اللطيف', emoji: '🐲' },
    { name: 'علاء الدين', emoji: '🧞' },
  ];

  const locations = [
    'كوكب المريخ الأحمر 🪐',
    'قصر شهرزاد الساحر 🕌',
    'واحة الصحراء التراثية 🌴',
    'حدائق البلور المضيئة 💎',
    'الغابة العجيبة 🌳',
  ];

  const handleReadAloud = () => {
    playClickSound();
    setIsReading(true);
    speakArabicSpeech(
      `قصة ${title}. البطل: ${hero}. المكان: ${location}. ${storyBody}`,
      undefined,
      () => setIsReading(false)
    );
  };

  const handleSaveToPersonalLibrary = () => {
    playFanfareSound();
    stopArabicSpeech();

    const createdItem = {
      id: `story-custom-${Date.now()}`,
      title: title || 'قصتي الخاصة',
      subtitle: `بقلم المؤلف الصغير - مغامرة مع ${hero}`,
      hero,
      location,
      text: storyBody,
      pages: [{ text: storyBody }],
      coverImage: '/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png',
      createdAt: new Date().toLocaleDateString('ar-EG'),
    };

    // Save to user's private library
    try {
      const raw = localStorage.getItem('raed_my_created_stories') || '[]';
      const existing = JSON.parse(raw);
      existing.unshift(createdItem);
      localStorage.setItem('raed_my_created_stories', JSON.stringify(existing));
    } catch {}

    // If Owner, also update official platform stories
    if (isOwnerAdmin && onSaveStory) {
      const newPlatformStory: Story = {
        id: `custom-${Date.now()}`,
        title: title || 'قصتي الخاصة',
        subtitle: `بقلم المؤلف الصغير - مغامرة مع ${hero}`,
        category: 'fantasy',
        categoryLabel: 'قصتي المبتكرة',
        categoryIcon: heroEmoji,
        ageRange: 'جميع الأعمار',
        duration: '03:00',
        badge: 'قصة رسمية معتمدة',
        coverImage: '/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png',
        description: storyBody,
        highlightText: 'قصة موثقة على منصة رائد',
        moralLesson: 'الإبداع والخيال يفتحان أبواب المستحيل!',
        pages: [
          {
            text: storyBody,
            interactiveElements: [
              { id: 'hero', label: hero, emoji: heroEmoji, sound: 'sparkle', message: `أنا ${hero} بطل هذه الحكاية!` }
            ]
          }
        ],
        quiz: []
      };
      onSaveStory(newPlatformStory);
    }

    onEarnStars(30);
    setSavedSuccess('تم حفظ القصة في مكتبتك الخاصة بنجاح! 📚');
    confetti({ particleCount: 70, spread: 70 });

    setTimeout(() => {
      onClose();
    }, 1600);
  };

  const handleShareToReadingClub = () => {
    playFanfareSound();
    stopArabicSpeech();

    // Share to reading club
    if (onSaveUserRecording) {
      onSaveUserRecording({
        id: `reading-club-text-${Date.now()}`,
        storyId: `custom-${Date.now()}`,
        title: `قصة مؤلفة: ${title}`,
        audioBlobUrl: '',
        audioUrl: '',
        durationSec: 20,
        createdAt: new Date().toLocaleDateString('ar-EG'),
        scorePoints: 40,
      });
    }

    try {
      const existingRaw = localStorage.getItem('raed_reading_club_shared_stories') || '[]';
      const existing = JSON.parse(existingRaw);
      existing.unshift({
        id: `shared-${Date.now()}`,
        title: title || 'قصتي الخاصة',
        subtitle: `مغامرة مع ${hero}`,
        hero: hero,
        author: 'مؤلف صغير مبدع',
        coverImage: '/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png',
        text: storyBody,
        createdAt: new Date().toLocaleDateString('ar-EG'),
      });
      localStorage.setItem('raed_reading_club_shared_stories', JSON.stringify(existing));
    } catch {}

    onEarnStars(40);
    setSavedSuccess('تم نشر قصتك في نادي القراءة بنجاح ليقرأها الأصدقاء! 🎙️🌟');
    confetti({ particleCount: 80, spread: 70 });

    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/75 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-amber-600/60 bg-gradient-to-b from-[#25150f] via-[#1a0f0a] to-[#0f0805] text-white p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-800/40 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-300">
              <PenTool className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-black text-lg sm:text-xl flex items-center gap-1.5">
                <span>تأليف قصة ورسم ✍️</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-amber-200/80">ألّف حكايتك الخاصة واحفظها في مكتبتك أو شاركها في نادي القراءة!</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopArabicSpeech();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-400">عنوان قصتك الجميلة:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-amber-500/40 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="اكتب عنوان القصة..."
          />
        </div>

        {/* Choose Hero */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-400">اختر بطل القصة:</label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {heroes.map((h) => (
              <button
                key={h.name}
                onClick={() => {
                  playClickSound();
                  setHero(h.name);
                  setHeroEmoji(h.emoji);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  hero === h.name
                    ? 'bg-amber-400 text-amber-950 font-black shadow'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span>{h.emoji}</span>
                <span>{h.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Choose Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-400">أين تقع أحداث القصة؟</label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  playClickSound();
                  setLocation(loc);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  location === loc
                    ? 'bg-amber-400 text-amber-950 font-black shadow'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Story Content Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-400">نص الحكاية والمغامرة:</label>
          <textarea
            rows={4}
            value={storyBody}
            onChange={(e) => setStoryBody(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white/10 border border-amber-500/40 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            placeholder="اكتب ماذا حدث مع بطل القصة..."
          />
        </div>

        {savedSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/25 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* Disclaimer Note */}
        <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[10px] text-amber-200/80 leading-relaxed text-right">
          <span>ℹ️ تُحفظ القصص في <strong>مكتبتك الخاصة</strong> أو تُشارك في <strong>نادي القراءة 🎙️</strong>. أما مكتبة المنصة الرسمية فتُدار حصرياً من قِبل مالكة الموقع 👑.</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <button
            onClick={handleReadAloud}
            className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>{isReading ? 'جاري القراءة...' : 'استمع للحكاية'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToPersonalLibrary}
              className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              title="حفظ في مكتبتي الخاصة"
            >
              <Save className="w-3.5 h-3.5" />
              <span>مكتبتي الخاصة 📚</span>
            </button>

            <button
              onClick={handleShareToReadingClub}
              className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
              title="مشاركة ونشر في نادي القراءة"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>نشر في نادي القراءة 🎙️ (+40 ⭐)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
