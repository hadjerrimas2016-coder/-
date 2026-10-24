import React, { useState } from 'react';
import { SunnahItem, AppMode } from '../types';
import {
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Bell,
  CheckCircle2,
  Share2,
  Award,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  ShieldCheck,
  Flame,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playClickSound,
  playSparkleSound,
  playFanfareSound,
  playPopSound,
  speakArabicSpeech,
  stopArabicSpeech
} from '../utils/audio';
import { backgroundAudio } from '../utils/backgroundAudio';
import {
  requestNotificationPermission,
  hasNotificationPermission,
  sendLocalNotification,
  notifyDuaaReminder
} from '../utils/notifications';

interface SunnahCornerProps {
  items: SunnahItem[];
  mode: AppMode;
  onAddStar?: () => void;
}

export const SunnahCorner: React.FC<SunnahCornerProps> = ({
  items,
  mode,
  onAddStar
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [repeatCounters, setRepeatCounters] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>(['surah-fatiha', 'surah-ikhlas', 'duaa-sleep']);
  const [expandedId, setExpandedId] = useState<string | null>('surah-fatiha');
  const [notificationsActive, setNotificationsActive] = useState<boolean>(() => hasNotificationPermission());
  const [toastMessage, setToastMessage] = useState<string>('');

  // Tasbeeh Corner state
  const [activeDhikrText, setActiveDhikrText] = useState<string>('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ');
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);
  const [tasbeehTarget, setTasbeehTarget] = useState<number>(33);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleFavorite = (id: string) => {
    playPopSound();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleExpand = (id: string) => {
    playClickSound();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handlePlayAudio = (item: SunnahItem) => {
    if (playingItemId === item.id) {
      stopArabicSpeech();
      backgroundAudio.stop();
      setPlayingItemId(null);
      return;
    }

    playSparkleSound();
    setPlayingItemId(item.id);

    // Update background audio media session for mobile lock-screen
    backgroundAudio.playAmbientCarrier({
      title: item.title,
      subtitle: item.subtitle || 'ركن السُنّة النبوية - منصة رائد',
      artworkUrl: '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png',
    });

    // Speak the tashkeel Arabic text
    speakArabicSpeech(
      item.arabicText,
      () => {},
      () => {
        setPlayingItemId(null);
        backgroundAudio.stop();
        if (onAddStar) onAddStar();
        showToast(`أحسنت يا بطل! استمعت إلى ${item.title} ونلت ثواباً كبيراً ⭐`);
      },
      () => {
        setPlayingItemId(null);
        backgroundAudio.stop();
      }
    );
  };

  const handleRepeatClick = (item: SunnahItem) => {
    playPopSound();
    const current = repeatCounters[item.id] || 0;
    const target = item.repeatCount || 1;
    const next = current + 1;

    setRepeatCounters((prev) => ({
      ...prev,
      [item.id]: next,
    }));

    if (next >= target) {
      playFanfareSound();
      confetti({ particleCount: 50, spread: 60 });
      if (onAddStar) onAddStar();
      showToast(`ما شاء الله! أكملت ترديد ${item.title} ${target} مرات! نلت 5 نجوم 🌟`);
    }
  };

  const handleResetRepeat = (id: string) => {
    playClickSound();
    setRepeatCounters((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };

  const handleEnableNotifications = async () => {
    playClickSound();
    const granted = await requestNotificationPermission();
    setNotificationsActive(granted);
    if (granted) {
      playFanfareSound();
      confetti({ particleCount: 40, spread: 50 });
      showToast('تم تفعيل إشعارات ركن السُنّة بنجاح! ستصلك تنبيهات بأذكار الصباح والمساء والقصص 🕌');
      sendLocalNotification('🕌 مرحباً بك في ركن السُنّة النبوية!', {
        body: 'تم تفعيل التنبيهات بنجاح، استعد لحفظ السور وأجمل الأدعية اليومية يا بطل! 🌟',
      });
    } else {
      showToast('يرجى السماح بالإشعارات من إعدادات المتصفح.');
    }
  };

  const handleTasbeehClick = () => {
    playClickSound();
    const next = tasbeehCount + 1;
    setTasbeehCount(next);

    if (next >= tasbeehTarget) {
      playFanfareSound();
      confetti({ particleCount: 80, spread: 80 });
      if (onAddStar) onAddStar();
      showToast(`مبارك يا بطل! أكملت ${tasbeehTarget} تسبيحة وغرست لك نخيل في الجنة 🌴🌟`);
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'favorites') return favorites.includes(item.id);
    if (selectedFilter === 'surah') return item.type === 'surah';
    if (selectedFilter === 'duaa') return item.type === 'duaa' || item.type === 'dhikr';
    if (selectedFilter === 'sleep') return item.category === 'sleep';
    if (selectedFilter === 'morning') return item.category === 'morning_evening';
    if (selectedFilter === 'study') return item.category === 'study';
    return item.category === selectedFilter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs sm:text-sm shadow-2xl border border-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div
        className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl border transition-all ${
          mode === 'day'
            ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white border-emerald-300/40 shadow-emerald-900/10'
            : 'bg-gradient-to-br from-[#0c2e22] via-[#082018] to-[#04120e] text-white border-emerald-500/40 shadow-emerald-950/40'
        }`}
      >
        {/* Background Islamic Geometric & Star Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-300/40 text-emerald-200 text-xs font-bold">
              <span>🕌</span>
              <span>ركن السُنّة النبوية الشريفة للأطفال</span>
              <span>✨</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-amber-300 tracking-wide drop-shadow">
              السور القصيرة وأهم الأدعية اليومية
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              احفظ كتاب الله وسُنّة الحبيب المصطفى ﷺ، ونوّر قلبك بأذكار الصباح والمساء ودعاء النوم والمائدة مع قراءة صوتية مشكولة وتعمل في خلفية الهاتف! 📱🎧
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <button
                onClick={handleEnableNotifications}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                  notificationsActive
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                    : 'bg-amber-400 text-amber-950 hover:bg-amber-300 hover:scale-105'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>
                  {notificationsActive
                    ? '✓ تنبيهات الأذكار اليومية مفعّلة'
                    : '🔔 تفعيل إشعارات الأدعية بالخلفية'}
                </span>
              </button>

              <button
                onClick={() => {
                  playSparkleSound();
                  setSelectedFilter('dhikr');
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📿</span>
                <span>المسبحة الذكية</span>
              </button>
            </div>
          </div>

          {/* Interactive Islamic Emblem with Background Audio indicator */}
          <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-black/25 backdrop-blur-md border border-emerald-400/30 text-center min-w-[200px]">
            <div className="text-4xl sm:text-5xl mb-2 animate-bounce">
              🕌
            </div>
            <span className="text-xs font-black text-amber-300">
              {playingItemId ? 'جارٍ الاستماع في الخلفية 🎧' : 'اختر سورة أو دعاء'}
            </span>
            <span className="text-[10px] text-emerald-200/80 mt-1">
              يدعم قفل الشاشة والتحكم من شريط الإشعارات
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: 'الكل', icon: '🌟' },
          { id: 'surah', label: 'السور القصيرة', icon: '📖' },
          { id: 'duaa', label: 'أهم الأدعية', icon: '🤲' },
          { id: 'sleep', label: 'أدعية النوم', icon: '🌙' },
          { id: 'morning', label: 'الصباح والمساء', icon: '☀️' },
          { id: 'study', label: 'طلب العلم', icon: '📚' },
          { id: 'dhikr', label: 'المسبحة الذكية', icon: '📿' },
          { id: 'favorites', label: `المفضلة (${favorites.length})`, icon: '❤️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playClickSound();
              setSelectedFilter(tab.id);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm ${
              selectedFilter === tab.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-300/50 scale-105'
                : mode === 'day'
                ? 'bg-white/80 hover:bg-white text-emerald-950 border border-emerald-100'
                : 'bg-white/5 hover:bg-white/10 text-emerald-200 border border-emerald-800/40'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SPECIAL TAB: Interactive Smart Tasbeeh for Kids */}
      {selectedFilter === 'dhikr' && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-xl text-center space-y-6 ${
            mode === 'day'
              ? 'bg-white/90 border-emerald-100 text-emerald-950'
              : 'bg-[#0f1f19]/90 border-emerald-800/40 text-white'
          }`}
        >
          <div className="max-w-md mx-auto space-y-2">
            <span className="text-3xl">📿</span>
            <h3 className="text-xl sm:text-2xl font-black text-amber-500">
              مسبحة الأبطال الذكية
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-300">
              اختر الذكر المفضل لديك، واضغط على زر التسبيح لتملأ حديقة حسناتك بالنجوم والزهور!
            </p>
          </div>

          {/* Quick Dhikr Choice Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', target: 33 },
              { text: 'الْحَمْدُ لِلَّهِ', target: 33 },
              { text: 'اللَّهُ أَكْبَرُ', target: 33 },
              { text: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: 33 },
              { text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ', target: 33 },
              { text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', target: 10 },
            ].map((d) => (
              <button
                key={d.text}
                onClick={() => {
                  playClickSound();
                  setActiveDhikrText(d.text);
                  setTasbeehTarget(d.target);
                  setTasbeehCount(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDhikrText === d.text
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200'
                }`}
              >
                {d.text}
              </button>
            ))}
          </div>

          {/* Big Tasbeeh Bead Button */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 max-w-sm">
              <span className="text-base sm:text-lg font-black text-amber-500 tracking-wide">
                «{activeDhikrText}»
              </span>
            </div>

            <button
              onClick={handleTasbeehClick}
              className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-2xl border-4 border-amber-300 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            >
              <span className="text-3xl sm:text-4xl font-black drop-shadow">
                {tasbeehCount}
              </span>
              <span className="text-[11px] font-bold text-amber-200 mt-1">
                الهدف: {tasbeehTarget}
              </span>
              <span className="text-[10px] text-white/80 mt-1 group-hover:underline">
                انقر للتسبيح 📿
              </span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setTasbeehCount(0);
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة البدء من الصفر</span>
            </button>
          </div>
        </div>
      )}

      {/* Surahs and Duas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          const isPlaying = playingItemId === item.id;
          const isFav = favorites.includes(item.id);
          const currentRepeats = repeatCounters[item.id] || 0;
          const targetRepeats = item.repeatCount || 1;
          const isComplete = currentRepeats >= targetRepeats;

          return (
            <div
              key={item.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-lg ${
                mode === 'day'
                  ? 'bg-white/90 border-emerald-100 hover:border-emerald-300 text-emerald-950'
                  : 'bg-[#121c17]/90 border-emerald-800/40 hover:border-emerald-600 text-white'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-emerald-500/10">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                    {item.icon || (item.type === 'surah' ? '📖' : '🤲')}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                        {item.type === 'surah' ? 'سورة قصيرة' : 'دعاء مأثور'}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-700 dark:text-amber-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black truncate text-amber-600 dark:text-amber-300">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 line-clamp-1">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleToggleFavorite(item.id)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isFav
                        ? 'text-red-500 bg-red-500/10'
                        : 'text-gray-400 hover:text-red-400 hover:bg-white/10'
                    }`}
                    title="إضافة للمفضلة"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => handlePlayAudio(item)}
                    className={`p-2.5 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-400 text-amber-950 animate-pulse'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                    title={isPlaying ? 'إيقاف الصوت' : 'استماع صوتي في الخلفية'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                </div>
              </div>

              {/* Main Tashkeel Text Box */}
              <div className="p-4 sm:p-5 space-y-4">
                <div
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    mode === 'day'
                      ? 'bg-emerald-50/70 border-emerald-200/60'
                      : 'bg-emerald-950/30 border-emerald-700/30'
                  }`}
                >
                  <p className="font-serif text-lg sm:text-xl font-bold leading-loose text-emerald-900 dark:text-emerald-100 select-text">
                    {item.arabicText}
                  </p>
                </div>

                {/* Repeat / Dhikr Counter Bar for Kids */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-500">
                      تكرار للحفظ والبركة:
                    </span>
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {currentRepeats} / {targetRepeats}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRepeatClick(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow flex items-center gap-1 ${
                        isComplete
                          ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isComplete ? 'تم الحفظ! 🌟' : 'كررتُها 🤲'}</span>
                    </button>

                    {currentRepeats > 0 && (
                      <button
                        onClick={() => handleResetRepeat(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 cursor-pointer"
                        title="إعادة التكرار"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Explanation & Virtue */}
                <button
                  onClick={() => handleToggleExpand(item.id)}
                  className="w-full flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1 cursor-pointer"
                >
                  <span>
                    {isExpanded ? 'إخفاء الشرح والفضل' : '💡 ما معنى الكلمات وما فضلها للأطفال؟'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="space-y-2.5 pt-2 border-t border-emerald-500/20 text-xs leading-relaxed animate-fadeIn">
                    {item.explanation && (
                      <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-800 dark:text-amber-200">
                        <strong className="block mb-1 text-amber-600 dark:text-amber-300 font-black">
                          🌱 شرح الكلمات للأبطال الصغار:
                        </strong>
                        {item.explanation}
                      </div>
                    )}

                    {item.virtue && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                        <strong className="block mb-1 text-emerald-600 dark:text-emerald-300 font-black">
                          ⭐ فضل السورة أو الدعاء:
                        </strong>
                        {item.virtue}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
