import React, { useState, useEffect } from 'react';
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
  Star,
  Plus,
  Crown,
  Check,
  Eye,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft
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
  sendLocalNotification
} from '../utils/notifications';
import {
  DEFAULT_PRAYER_STEPS,
  DAILY_PRAYERS_INFO,
  PrayerStep,
  DailyPrayerInfo
} from '../data/prayerStepsData';

interface SunnahCornerProps {
  items: SunnahItem[];
  mode: AppMode;
  onAddStar?: () => void;
  isOwnerAdmin?: boolean;
}

export const SunnahCorner: React.FC<SunnahCornerProps> = ({
  items,
  mode,
  onAddStar,
  isOwnerAdmin = false
}) => {
  // Navigation Tabs inside Sunnah Corner
  const [activeTab, setActiveTab] = useState<'salati' | 'athkar' | 'surahs' | 'tasbeeh'>('salati');

  // Prayer Steps ("صلاتي") State
  const [prayerSteps, setPrayerSteps] = useState<PrayerStep[]>(() => {
    try {
      const saved = localStorage.getItem('raed_salati_steps');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PRAYER_STEPS;
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isPlayingStepAudio, setIsPlayingStepAudio] = useState<boolean>(false);
  const [showAddStepModal, setShowAddStepModal] = useState<boolean>(false);

  // New Step Form State (Owner only)
  const [newStepTitle, setNewStepTitle] = useState<string>('');
  const [newStepSubtitle, setNewStepSubtitle] = useState<string>('');
  const [newStepWhatToSay, setNewStepWhatToSay] = useState<string>('');
  const [newStepExplanation, setNewStepExplanation] = useState<string>('');
  const [newStepImage, setNewStepImage] = useState<string>('/assets/aistudio/Capture_d__cran_2026-10-20_135742_9bb46748.png');

  // Athkar & Surahs State
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

  useEffect(() => {
    return () => {
      stopArabicSpeech();
      backgroundAudio.stop();
    };
  }, []);

  // Save steps to localStorage
  const savePrayerSteps = (updated: PrayerStep[]) => {
    setPrayerSteps(updated);
    try {
      localStorage.setItem('raed_salati_steps', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Play audio for prayer step
  const handlePlayStepAudio = (step: PrayerStep) => {
    if (isPlayingStepAudio) {
      stopArabicSpeech();
      backgroundAudio.stop();
      setIsPlayingStepAudio(false);
      return;
    }

    playSparkleSound();
    setIsPlayingStepAudio(true);

    backgroundAudio.playAmbientCarrier({
      title: step.title,
      subtitle: step.subtitle,
      artworkUrl: step.image
    });

    const textToSpeak = `${step.title}. ${step.whatToSayTashkeel || step.whatToSay}. ${step.explanation}`;

    speakArabicSpeech(
      textToSpeak,
      () => {},
      () => {
        setIsPlayingStepAudio(false);
        backgroundAudio.stop();
        if (onAddStar) onAddStar();
        showToast(`أحسنت يا بطل! استمعت إلى خطوة: ${step.title} ⭐`);
      },
      () => {
        setIsPlayingStepAudio(false);
        backgroundAudio.stop();
      },
      { rate: 0.9 }
    );
  };

  // Mark step completed
  const handleCompleteStep = (stepNumber: number) => {
    playPopSound();
    if (!completedSteps.includes(stepNumber)) {
      const updated = [...completedSteps, stepNumber];
      setCompletedSteps(updated);

      if (updated.length >= prayerSteps.length) {
        playFanfareSound();
        confetti({ particleCount: 90, spread: 80 });
        if (onAddStar) onAddStar();
        showToast('ما شاء الله تبارك الرحمن! أتممت تعلم جميع خطوات الصلاة ونلت 30 نجمة ذهبية 🌟🕌');
      } else {
        showToast(`رائع! أتممت الخطوة ${stepNumber} من ${prayerSteps.length} 🌟`);
      }
    }

    if (currentStepIndex < prayerSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // Owner publishes new prayer step
  const handleAddNewStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim() || !newStepWhatToSay.trim()) return;

    playSparkleSound();
    const newStep: PrayerStep = {
      id: 'step_' + Date.now(),
      stepNumber: prayerSteps.length + 1,
      title: newStepTitle.trim(),
      subtitle: newStepSubtitle.trim() || 'خطوة مباركة في الصلاة',
      whatToSay: newStepWhatToSay.trim(),
      whatToSayTashkeel: newStepWhatToSay.trim(),
      explanation: newStepExplanation.trim() || 'تأدية الخطوة باطمئنان وخشوع لله تعالى.',
      image: newStepImage.trim() || '/assets/aistudio/Capture_d__cran_2026-10-20_135742_9bb46748.png',
      category: 'fard',
      badge: `الخطوة ${prayerSteps.length + 1} 🕌`
    };

    const updated = [...prayerSteps, newStep];
    savePrayerSteps(updated);
    setShowAddStepModal(false);
    setNewStepTitle('');
    setNewStepSubtitle('');
    setNewStepWhatToSay('');
    setNewStepExplanation('');
    showToast('تم نشر الصورة والخطوة التوضيحية لتعليم الصلاة بنجاح! 👑✨');
  };

  // Sunnah Athkar Audio
  const handlePlayAudio = (item: SunnahItem) => {
    if (playingItemId === item.id) {
      stopArabicSpeech();
      backgroundAudio.stop();
      setPlayingItemId(null);
      return;
    }

    playSparkleSound();
    setPlayingItemId(item.id);

    backgroundAudio.playAmbientCarrier({
      title: item.title,
      subtitle: item.subtitle || 'ركن السُنّة النبوية - منصة رائد',
      artworkUrl: '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png'
    });

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
      [item.id]: next
    }));

    if (next >= target) {
      playFanfareSound();
      confetti({ particleCount: 50, spread: 60 });
      if (onAddStar) onAddStar();
      showToast(`ما شاء الله! أكملت ترديد ${item.title} ${target} مرات! نلت 5 نجوم 🌟`);
    }
  };

  const handleEnableNotifications = async () => {
    playClickSound();
    const granted = await requestNotificationPermission();
    setNotificationsActive(granted);
    if (granted) {
      playFanfareSound();
      confetti({ particleCount: 40, spread: 50 });
      showToast('تم تفعيل إشعارات ركن السُنّة وصلاتي بنجاح! 🕌');
      sendLocalNotification('🕌 مرحباً بك في ركن السُنّة وصلاتي!', {
        body: 'تم تفعيل التنبيهات بنجاح، استعد لحفظ السور والصلوات الخمس يا بطل! 🌟'
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
    if (activeTab === 'surahs') return item.type === 'surah';
    if (activeTab === 'athkar') return item.type === 'duaa' || item.type === 'dhikr';
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'favorites') return favorites.includes(item.id);
    if (selectedFilter === 'surah') return item.type === 'surah';
    if (selectedFilter === 'duaa') return item.type === 'duaa' || item.type === 'dhikr';
    if (selectedFilter === 'sleep') return item.category === 'sleep';
    if (selectedFilter === 'morning') return item.category === 'morning_evening';
    if (selectedFilter === 'study') return item.category === 'study';
    return item.category === selectedFilter;
  });

  const activeStep = prayerSteps[currentStepIndex] || prayerSteps[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs sm:text-sm shadow-2xl border border-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Spiritual Banner */}
      <div
        className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl border transition-all ${
          mode === 'day'
            ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white border-emerald-300/40 shadow-emerald-900/10'
            : 'bg-gradient-to-br from-[#0c2e22] via-[#082018] to-[#04120e] text-white border-emerald-500/40 shadow-emerald-950/40'
        }`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-xs sm:text-sm font-bold backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ركن السُنّة النبوية وخاصية «صَلاتي» 🕌🧎‍♂️</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-100 to-amber-300 leading-tight">
              تعلّم الصلاة خطوة بخطوة بالصور التوضيحية والأدعية
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              دليل مصوّر وتفاعلي للأطفال يعلمهم كيفية الوضوء والصلاة الصحيحة كما صلاها رسول الله ﷺ، مع سور القرآن القصيرة، الأذكار النبوية اليومية، ومسبحة التسبيح الذكية.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <button
                onClick={() => {
                  playSparkleSound();
                  setActiveTab('salati');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-emerald-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <span>🧎‍♂️</span>
                <span>خاصية «صلاتي» (الصور التوضيحية)</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('athkar');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/60 hover:bg-emerald-500/80 text-white font-extrabold text-xs sm:text-sm border border-emerald-400/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>🤲</span>
                <span>الأدعية والسور</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('tasbeeh');
                }}
                className="px-4 py-2.5 rounded-xl bg-teal-600/60 hover:bg-teal-500/80 text-white font-extrabold text-xs sm:text-sm border border-teal-400/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>📿</span>
                <span>المسبحة النبوية</span>
              </button>

              {isOwnerAdmin && (
                <button
                  onClick={() => {
                    playSparkleSound();
                    setShowAddStepModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer border border-pink-400/40 transition-all hover:scale-105"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>نشر صورة تعليمية للصلاة (خاص بك) 👑</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stat / Salati Highlight Card */}
          <div
            onClick={() => {
              playSparkleSound();
              setActiveTab('salati');
            }}
            className="w-full md:w-80 rounded-2xl p-4 bg-gradient-to-b from-[#093d2e]/90 to-[#032017]/90 border border-emerald-400/50 shadow-xl flex flex-col items-center text-center cursor-pointer transition-all hover:scale-105 group ring-1 ring-amber-300/30"
          >
            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 border border-emerald-400/40 shadow-inner">
              <img
                src={activeStep.image}
                alt="خاصية صلاتي"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-400/50 text-[10px] font-black text-amber-300">
                {prayerSteps.length} خطوات مصورة 🧎‍♂️
              </div>
            </div>

            <h3 className="font-black text-base text-amber-300 group-hover:text-amber-200">
              «صلاتي» نور حياتي 🕌
            </h3>
            <p className="text-[11px] text-emerald-200/80 mt-1 line-clamp-2">
              تعلّم أركان الصلاة وسننها بالصور التوضيحية وما يقال في كل حركة
            </p>
            <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-black text-emerald-300 group-hover:translate-x-1 transition-transform">
              <span>افتح دليل الصلاة الآن</span>
              <BookOpen className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto pb-1 border-b border-emerald-500/20">
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('salati');
          }}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'salati'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/50 scale-102'
              : 'bg-white/5 hover:bg-white/10 text-emerald-200'
          }`}
        >
          <span>🧎‍♂️</span>
          <span>خاصية «صلاتي» المصورة 🕌</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black">
            جديد
          </span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('athkar');
          }}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'athkar'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/50 scale-102'
              : 'bg-white/5 hover:bg-white/10 text-emerald-200'
          }`}
        >
          <span>🤲</span>
          <span>الأدعية اليومية النبوية</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('surahs');
          }}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'surahs'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/50 scale-102'
              : 'bg-white/5 hover:bg-white/10 text-emerald-200'
          }`}
        >
          <span>📜</span>
          <span>قصار السور المباركة</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('tasbeeh');
          }}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'tasbeeh'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/50 scale-102'
              : 'bg-white/5 hover:bg-white/10 text-emerald-200'
          }`}
        >
          <span>📿</span>
          <span>المسبحة النبوية</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: «صلاتي» - PRAYER TUTORIAL WITH ILLUSTRATIONS (الصور التوضيحية) */}
      {/* ========================================================================= */}
      {activeTab === 'salati' && (
        <div className="space-y-6">
          {/* Header & Owner Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <span>🧎‍♂️</span>
                <span>دليل تعليم الصلاة الإسلامية للأطفال خطوة بخطوة بالصور</span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                شاهِد الصور التوضيحية، استمع إلى التكبير والتسبيح والتشهد، واختم الخطوات لتفوز بـ +30 نجمة ذهبية!
              </p>
            </div>

            {isOwnerAdmin && (
              <button
                onClick={() => {
                  playSparkleSound();
                  setShowAddStepModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-emerald-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all self-end sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة / نشر صورة توضيحية لتعليم الصلاة 👑</span>
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="p-4 rounded-2xl bg-black/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-300" />
                <span>إنجاز خطوات الصلاة: {completedSteps.length} من {prayerSteps.length}</span>
              </span>
              <span className="text-amber-300 font-mono">
                {Math.round((completedSteps.length / prayerSteps.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-black/50 overflow-hidden p-0.5 border border-emerald-500/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-all duration-500"
                style={{ width: `${(completedSteps.length / prayerSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Step Viewer Card */}
          <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#072b1e] to-[#031810] border-2 border-emerald-400/60 shadow-2xl space-y-5">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Illustration Image */}
              <div className="relative w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-inner group">
                <img
                  src={activeStep.image}
                  alt={activeStep.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/85 backdrop-blur-md border border-amber-300/50 text-amber-300 font-black text-xs shadow-md">
                  الخطوة {activeStep.stepNumber} من {prayerSteps.length} 🕌
                </div>
                {completedSteps.includes(activeStep.stepNumber) && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-md">
                    <Check className="w-3.5 h-3.5" />
                    <span>تم التعلّم ✓</span>
                  </div>
                )}
              </div>

              {/* Step Information & What to say */}
              <div className="w-full lg:w-1/2 space-y-4 text-right">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                    {activeStep.badge || 'أركان الصلاة 🧎‍♂️'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-200 mt-2">
                    {activeStep.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 font-medium">
                    {activeStep.subtitle}
                  </p>
                </div>

                {/* What to Say (Vocalized) */}
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/40 space-y-1">
                  <span className="text-[11px] font-black text-amber-300 block">
                    💬 ما يقوله المسلم الصغير في هذه الخطوة:
                  </span>
                  <p className="font-serif text-base sm:text-lg text-white font-bold leading-relaxed selection:bg-amber-400 selection:text-emerald-950">
                    «{activeStep.whatToSayTashkeel || activeStep.whatToSay}»
                  </p>
                  {activeStep.repeatTimes && (
                    <span className="text-[10px] text-amber-200 font-bold block pt-1">
                      🔁 يُردد {activeStep.repeatTimes} مرات بطمأنينة.
                    </span>
                  )}
                </div>

                {/* Explanation */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-100/90 leading-relaxed">
                  <span className="font-bold text-amber-300 ml-1">📖 الشرح والبيان:</span>
                  <span>{activeStep.explanation}</span>
                </div>

                {/* Step Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => handlePlayStepAudio(activeStep)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                      isPlayingStepAudio
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isPlayingStepAudio ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
                    <span>{isPlayingStepAudio ? 'إيقاف' : 'استمع للنطق الصوتي 🎧'}</span>
                  </button>

                  <button
                    onClick={() => handleCompleteStep(activeStep.stepNumber)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>أتقنت هذه الخطوة ✓</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-emerald-500/30 pt-4">
              <button
                disabled={currentStepIndex === 0}
                onClick={() => {
                  playClickSound();
                  setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  currentStepIndex === 0
                    ? 'opacity-40 cursor-not-allowed text-gray-400'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الخطوة السابقة</span>
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto px-2">
                {prayerSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      playClickSound();
                      setCurrentStepIndex(idx);
                    }}
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      currentStepIndex === idx
                        ? 'bg-amber-400 text-emerald-950 font-black scale-110 shadow-md ring-2 ring-amber-300'
                        : completedSteps.includes(step.stepNumber)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 text-emerald-200 hover:bg-white/20'
                    }`}
                  >
                    {step.stepNumber}
                  </button>
                ))}
              </div>

              <button
                disabled={currentStepIndex === prayerSteps.length - 1}
                onClick={() => {
                  playClickSound();
                  setCurrentStepIndex((prev) => Math.min(prayerSteps.length - 1, prev + 1));
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  currentStepIndex === prayerSteps.length - 1
                    ? 'opacity-40 cursor-not-allowed text-gray-400'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>الخطوة التالية</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* The Five Daily Prayers Guide Table */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#06241a] to-[#03150e] border border-amber-400/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-300">
              <span className="text-2xl">🕌</span>
              <div>
                <h3 className="font-black text-base sm:text-lg">دليل الصلوات الخمس المفروضة</h3>
                <p className="text-xs text-emerald-200/80">أوقات الصلوات وعدد ركعاتها وسننها الرواتب</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {DAILY_PRAYERS_INFO.map((prayer) => (
                <div
                  key={prayer.name}
                  className="rounded-2xl p-4 bg-black/40 border border-emerald-500/30 space-y-2 hover:border-amber-400/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{prayer.icon}</span>
                      <h4 className="font-black text-sm text-white">{prayer.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-amber-300 font-black text-xs">
                      {prayer.rakats} ركعات
                    </span>
                  </div>

                  <p className="text-xs text-emerald-200 font-bold">{prayer.type}</p>
                  <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                    ⏰ {prayer.timeDescription}
                  </p>
                  <p className="text-[11px] text-amber-200/90 pt-1 border-t border-white/10">
                    ⭐ {prayer.sunnahRakats}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2 & 3: ATHKAR & SURAHS (السور القصيرة والأدعية النبوية 🤲📜)     */}
      {/* ========================================================================= */}
      {(activeTab === 'athkar' || activeTab === 'surahs') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <span>{activeTab === 'surahs' ? '📜' : '🤲'}</span>
                <span>{activeTab === 'surahs' ? 'قصار السور المباركة' : 'الأدعية والأذكار النبوية'}</span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                استمع إلى التلاوة والأدعية بصوت واضح مع خاصية الترديد وكسب النجوم ⭐
              </p>
            </div>

            <button
              onClick={handleEnableNotifications}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                notificationsActive
                  ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-400/30'
                  : 'bg-amber-400 text-emerald-950 font-black shadow-md hover:bg-amber-300'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{notificationsActive ? 'التنبيهات مفعلة ✓' : 'تفعيل تنبيهات الأذكار 🔔'}</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'الكل 🌟' },
              { id: 'morning', label: 'الصباح والمساء ☀️' },
              { id: 'sleep', label: 'قبل النوم 🌙' },
              { id: 'study', label: 'طلب العلم والتركيز 📚' },
              { id: 'favorites', label: 'المفضلة ❤️' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playClickSound();
                  setSelectedFilter(f.id);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                  selectedFilter === f.id
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white/5 text-emerald-200 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const count = repeatCounters[item.id] || 0;
              const target = item.repeatCount || 1;
              const isPlaying = playingItemId === item.id;
              const isDone = count >= target;

              return (
                <div
                  key={item.id}
                  className={`rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between shadow-lg ${
                    isDone
                      ? 'bg-gradient-to-br from-[#0c3322] to-[#062015] border-amber-400/60'
                      : 'bg-gradient-to-br from-[#09291d] to-[#041710] border-emerald-500/40 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon || '🤲'}</span>
                        <div>
                          <h4 className="font-black text-sm sm:text-base text-amber-200">
                            {item.title}
                          </h4>
                          {item.subtitle && (
                            <p className="text-[11px] text-emerald-300">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                        {item.badge || (item.type === 'surah' ? 'سورة مباركة' : 'دعاء نبوي')}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/30 border border-emerald-500/30 font-serif text-sm sm:text-base text-emerald-100 text-right leading-loose">
                      {item.arabicText}
                    </div>

                    {item.virtue && (
                      <div className="text-[11px] text-amber-200/90 bg-amber-400/10 p-2 rounded-xl border border-amber-400/20">
                        <span className="font-bold">✨ فضل الذكر:</span> {item.virtue}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-emerald-500/30 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handlePlayAudio(item)}
                      className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        isPlaying
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'إيقاف' : 'استمع 🎧'}</span>
                    </button>

                    <button
                      onClick={() => handleRepeatClick(item)}
                      className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                        isDone
                          ? 'bg-amber-400 text-emerald-950 font-black'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        ردد ({count}/{target})
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: DIGITAL TASBEEH COUNTER (المسبحة النبوية الإلكترونية 📿)      */}
      {/* ========================================================================= */}
      {activeTab === 'tasbeeh' && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#08291e] to-[#03150e] border border-amber-400/50 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-emerald-500/30 pb-3">
              <div className="flex items-center gap-2 text-amber-300">
                <span className="text-2xl">📿</span>
                <h3 className="font-black text-base sm:text-lg">مسبحة رائد النبوية الإلكترونية</h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-200">الهدف:</span>
                {[33, 100].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      playClickSound();
                      setTasbeehTarget(t);
                    }}
                    className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-all ${
                      tasbeehTarget === t
                        ? 'bg-amber-400 text-emerald-950 font-black'
                        : 'bg-white/5 text-emerald-200 hover:bg-white/10'
                    }`}
                  >
                    {t} مرة
                  </button>
                ))}
                <button
                  onClick={() => {
                    playPopSound();
                    setTasbeehCount(0);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-rose-500/30 text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>تصفير</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
                'الْحَمْدُ لِلَّهِ',
                'لَا إِلَهَ إِلَّا اللَّهُ',
                'اللَّهُ أَكْبَرُ',
                'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
                'اللَّهُمَّ صَلِّ عَلَى نَبِيِّنَا مُحَمَّدٍ'
              ].map((dhikr) => (
                <button
                  key={dhikr}
                  onClick={() => {
                    playClickSound();
                    setActiveDhikrText(dhikr);
                    setTasbeehCount(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-serif text-xs sm:text-sm font-bold cursor-pointer transition-all ${
                    activeDhikrText === dhikr
                      ? 'bg-emerald-500 text-white shadow-md border border-emerald-300 scale-105'
                      : 'bg-black/30 text-emerald-200 hover:bg-white/10'
                  }`}
                >
                  {dhikr}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <button
                onClick={handleTasbeehClick}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 text-white flex flex-col items-center justify-center shadow-2xl shadow-emerald-900/60 border-4 border-amber-300 cursor-pointer active:scale-95 transition-all hover:scale-105 group"
              >
                <span className="text-3xl sm:text-5xl font-black font-mono tracking-wider drop-shadow-md">
                  {tasbeehCount}
                </span>
                <span className="text-[11px] font-bold text-emerald-950 bg-amber-300/80 px-2 py-0.5 rounded-full mt-1">
                  اضغط للتسبيح 👆
                </span>
              </button>

              <p className="font-serif text-sm sm:text-base text-amber-200 font-bold text-center">
                «{activeDhikrText}»
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Owner Add Prayer Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#07241a] border border-amber-400/50 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
              <h3 className="font-black text-lg text-amber-300 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>إضافة / نشر خطوة توضيحية لتعليم الصلاة (خاص بالمالكة 👑)</span>
              </h3>
              <button
                onClick={() => setShowAddStepModal(false)}
                className="p-1 rounded-xl bg-white/10 text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewStep} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-emerald-200 mb-1">عنوان الخطوة:</label>
                <input
                  type="text"
                  required
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="مثال: الركوع وتعظيم الرب العظيم 🙇‍♂️"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/40 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-200 mb-1">وصف مختصر للخطوة:</label>
                <input
                  type="text"
                  value={newStepSubtitle}
                  onChange={(e) => setNewStepSubtitle(e.target.value)}
                  placeholder="مثال: الانحناء واستواء الظهر ووضع اليدين على الركبتين..."
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/40 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-200 mb-1">ما يقال فيها مشكولاً (للصوت والتلاوة):</label>
                <textarea
                  rows={2}
                  required
                  value={newStepWhatToSay}
                  onChange={(e) => setNewStepWhatToSay(e.target.value)}
                  placeholder="مثال: سُبْحَانَ رَبِّيَ الْعَظِيمِ (3 مرات)"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/40 text-white outline-none focus:border-amber-400 font-serif"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-200 mb-1">الشرح التفصيلي للأطفال:</label>
                <textarea
                  rows={2}
                  value={newStepExplanation}
                  onChange={(e) => setNewStepExplanation(e.target.value)}
                  placeholder="اكتبي شرح الحركة وكيف يؤديها الطفل بخشوع وسكينة..."
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/40 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-200 mb-1">رابط أو مسار الصورة التوضيحية:</label>
                <input
                  type="text"
                  value={newStepImage}
                  onChange={(e) => setNewStepImage(e.target.value)}
                  placeholder="/assets/aistudio/... أو رابط صورة"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/40 text-white outline-none focus:border-amber-400 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStepModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-emerald-950 font-black shadow-lg"
                >
                  نشر الخطوة التوضيحية فوراً 🌟
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
