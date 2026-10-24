import React, { useState } from 'react';
import { AppMode, Story } from '../types';
import { PenTool, X, Sparkles, Volume2, Save, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playFanfareSound, playSparkleSound, playClickSound, speakArabicSpeech, stopArabicSpeech } from '../utils/audio';

interface StoryAuthoringModalProps {
  mode: AppMode;
  onClose: () => void;
  onSaveStory: (story: Story) => void;
  onEarnStars: (amount: number) => void;
}

export const StoryAuthoringModal: React.FC<StoryAuthoringModalProps> = ({
  mode,
  onClose,
  onSaveStory,
  onEarnStars,
}) => {
  const [title, setTitle] = useState<string>('مغامرة في وادي النجوم');
  const [hero, setHero] = useState<string>('رائد الصغير');
  const [heroEmoji, setHeroEmoji] = useState<string>('🧑‍🚀');
  const [location, setLocation] = useState<string>('قصر شهرزاد الساحر 🕌');
  const [storyBody, setStoryBody] = useState<string>(
    'في يوم مشرق انطلق بطلنا في رحلة لاكتشاف الكنز المخفي وراء الجبال، وهناك التقى بأصدقاء لطفاء ساعدوه على نشر الخير والفرح.'
  );
  const [isReading, setIsReading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

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

  const handleSave = () => {
    playFanfareSound();
    stopArabicSpeech();

    const newStory: Story = {
      id: `custom-${Date.now()}`,
      title: title || 'قصتي الخاصة',
      subtitle: `بقلم المؤلف الصغير - مغامرة مع ${hero}`,
      category: 'fantasy',
      categoryLabel: 'قصتي المبتكرة',
      categoryIcon: heroEmoji,
      ageRange: 'جميع الأعمار',
      duration: '03:00',
      badge: 'قصة من تأليفي',
      coverImage: '/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png',
      description: storyBody,
      highlightText: 'قصة أبدعها مؤلفنا الصغير في مرسم رائد',
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

    onSaveStory(newStory);
    onEarnStars(25);
    setSavedSuccess(true);
    confetti({ particleCount: 70, spread: 70 });

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/75 overflow-y-auto">
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
              <p className="text-xs text-amber-200/80">ابتكر مغامرتك الخاصة واجعل رائد يرويها لك!</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopArabicSpeech();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleReadAloud}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>{isReading ? 'جاري القراءة...' : 'استمع لقصتك'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-grow py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم الحفظ في مكتبتي! (+25 ⭐)</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>احفظ القصة في مكتبة رائد</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
