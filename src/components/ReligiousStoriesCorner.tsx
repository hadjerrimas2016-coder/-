import React, { useState, useRef, useEffect } from 'react';
import { SunnahItem, AppMode, PictureBook, UserAudioRecording } from '../types';
import { RELIGIOUS_AUDIO_STORIES, ReligiousAudioStory } from '../data/religiousStoriesData';
import { PRESET_PICTURE_BOOKS, JUMUAH_PICTURE_BOOK } from '../data/pictureBooksData';
import {
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Heart,
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
  Mic,
  Square,
  Plus,
  Send,
  Radio,
  Clock,
  Layers,
  Crown
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

interface ReligiousStoriesCornerProps {
  items: SunnahItem[];
  mode: AppMode;
  onAddStar?: () => void;
  onOpenPictureBook?: (book?: PictureBook) => void;
  isOwnerAdmin?: boolean;
  onSaveUserRecording?: (rec: UserAudioRecording) => void;
  existingRecordings?: UserAudioRecording[];
}

export const ReligiousStoriesCorner: React.FC<ReligiousStoriesCornerProps> = ({
  items,
  mode,
  onAddStar,
  onOpenPictureBook,
  isOwnerAdmin = false,
  onSaveUserRecording,
  existingRecordings = []
}) => {
  // Main view tab inside Religious Corner
  const [activeSubTab, setActiveSubTab] = useState<'picture_books' | 'audio_stories' | 'sunnah_athkar' | 'my_recordings'>('picture_books');

  // Picture Books State
  const [allBooks, setAllBooks] = useState<PictureBook[]>(PRESET_PICTURE_BOOKS);

  // Audio Stories State
  const [audioStories, setAudioStories] = useState<ReligiousAudioStory[]>(RELIGIOUS_AUDIO_STORIES);
  const [activeAudioStory, setActiveAudioStory] = useState<ReligiousAudioStory | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [narratorSpeed, setNarratorSpeed] = useState<number>(1.0);
  const [audioCategoryFilter, setAudioCategoryFilter] = useState<string>('all');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Child Microphone Recording Studio
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sunnah & Athkar Tab State (retained from SunnahCorner)
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [repeatCounters, setRepeatCounters] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>(['surah-fatiha', 'surah-ikhlas', 'duaa-sleep']);
  const [expandedId, setExpandedId] = useState<string | null>('surah-fatiha');

  // Tasbeeh Counter State
  const [activeDhikrText, setActiveDhikrText] = useState<string>('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ');
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);
  const [tasbeehTarget, setTasbeehTarget] = useState<number>(33);

  // Toast
  const [toastMessage, setToastMessage] = useState<string>('');

  // Owner New Story Modal
  const [showAddAudioModal, setShowAddAudioModal] = useState<boolean>(false);
  const [newAudioTitle, setNewAudioTitle] = useState<string>('');
  const [newAudioSubtitle, setNewAudioSubtitle] = useState<string>('');
  const [newAudioText, setNewAudioText] = useState<string>('');
  const [newAudioCategory, setNewAudioCategory] = useState<'prophets' | 'sunnah' | 'morals' | 'quran'>('sunnah');
  const [newAudioLesson, setNewAudioLesson] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopArabicSpeech();
      backgroundAudio.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Play / Pause Audio Story
  const handleTogglePlayAudioStory = (story: ReligiousAudioStory) => {
    if (isPlayingAudio && activeAudioStory?.id === story.id) {
      stopArabicSpeech();
      backgroundAudio.stop();
      setIsPlayingAudio(false);
      return;
    }

    playSparkleSound();
    setActiveAudioStory(story);
    setIsPlayingAudio(true);
    setQuizAnswers({});
    setQuizSubmitted(false);

    backgroundAudio.playAmbientCarrier({
      title: story.title,
      subtitle: story.subtitle,
      artworkUrl: story.coverImage
    });

    speakArabicSpeech(
      story.tashkeelText || story.text,
      () => {},
      () => {
        setIsPlayingAudio(false);
        backgroundAudio.stop();
        if (onAddStar) onAddStar();
        showToast(`أحسنت يا بطل! استمعت إلى قصة: ${story.title} ونلت 10 نجوم ⭐`);
      },
      () => {
        setIsPlayingAudio(false);
        backgroundAudio.stop();
      },
      { rate: narratorSpeed }
    );
  };

  // Recording child's voice for religious story
  const startRecording = async () => {
    try {
      playClickSound();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setRecordedAudioUrl(null);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      showToast('يرجى السماح بالوصول إلى الميكروفون لبدء التسجيل 🎙️');
    }
  };

  const stopRecording = () => {
    playPopSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const saveRecording = () => {
    if (!recordedAudioUrl) return;
    playFanfareSound();
    confetti({ particleCount: 60, spread: 70 });

    const newRec: UserAudioRecording = {
      id: 'rec_rel_' + Date.now(),
      title: activeAudioStory ? `تسجيل قصة: ${activeAudioStory.title}` : 'تسجيل قصة دينية مباركة 🕌',
      storyTitle: activeAudioStory?.title || 'يوم الجمعة المبارك 🕌',
      storyId: activeAudioStory?.id || 'jumuah',
      createdAt: new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' }),
      durationSec: recordingSeconds,
      audioBlobUrl: recordedAudioUrl,
      scorePoints: 30
    };

    if (onSaveUserRecording) {
      onSaveUserRecording(newRec);
    }
    if (onAddStar) onAddStar();
    showToast('ما شاء الله! تم حفظ تسجيلك بصوتك الرائع ونلت +30 نجمة 🌟');
    setRecordedAudioUrl(null);
  };

  // Quiz Handling
  const handleAnswerQuiz = (qIndex: number, optIndex: number) => {
    playPopSound();
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleCheckQuiz = () => {
    playFanfareSound();
    setQuizSubmitted(true);
    let correctCount = 0;
    activeAudioStory?.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correctCount++;
    });

    if (correctCount > 0 && onAddStar) {
      onAddStar();
      confetti({ particleCount: 70, spread: 80 });
      showToast(`ما شاء الله! أجبت على الأسئلة بنجاح ونلت 15 نجمة ذهبية 🌟`);
    }
  };

  // Sunnah Athkar Audio
  const handlePlaySunnahItem = (item: SunnahItem) => {
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
      subtitle: item.subtitle || 'ركن القصص الدينية والأذكار النبوية',
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

    setRepeatCounters((prev) => ({ ...prev, [item.id]: next }));

    if (next >= target) {
      playFanfareSound();
      confetti({ particleCount: 50, spread: 60 });
      if (onAddStar) onAddStar();
      showToast(`ما شاء الله! أكملت ترديد ${item.title} ${target} مرات! نلت 5 نجوم 🌟`);
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

  // Owner saves new audio story
  const handleSaveNewAudioStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudioTitle.trim() || !newAudioText.trim()) return;

    playSparkleSound();
    const newStory: ReligiousAudioStory = {
      id: 'rel_audio_' + Date.now(),
      title: newAudioTitle.trim(),
      subtitle: newAudioSubtitle.trim() || 'قصة دينية مباركة',
      coverImage: '/assets/aistudio/Capture_d__cran_2026-10-20_135742_9bb46748.png',
      category: newAudioCategory,
      categoryLabel: newAudioCategory === 'prophets' ? 'قصص الأنبياء 🌟' : 'سنن وأخلاق 💎',
      duration: '03:30',
      badge: 'قصة جديدة',
      text: newAudioText.trim(),
      tashkeelText: newAudioText.trim(),
      moralLesson: newAudioLesson.trim() || 'العمل الصالح وطاعة الله مفتاح السعادة والبركة.',
      quiz: [
        {
          question: `ما هي العبرة المستفادة من قصة ${newAudioTitle.trim()}؟`,
          options: ['طاعة الله وحسن الأخلاق', 'التكاسل والنسيان', 'التسرع في الحكم', 'عدم الاهتمام'],
          correctIndex: 0,
          explanation: 'الأخلاق الفاضلة وطاعة الله هي أعظم ما يحرص عليه المسلم.'
        }
      ]
    };

    setAudioStories((prev) => [newStory, ...prev]);
    setShowAddAudioModal(false);
    setNewAudioTitle('');
    setNewAudioSubtitle('');
    setNewAudioText('');
    setNewAudioLesson('');
    showToast('تم نشر القصة الدينية الصوتية بنجاح في المنصة! 👑✨');
  };

  const filteredSunnahItems = items.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'favorites') return favorites.includes(item.id);
    if (selectedFilter === 'surah') return item.type === 'surah';
    if (selectedFilter === 'duaa') return item.type === 'duaa' || item.type === 'dhikr';
    if (selectedFilter === 'sleep') return item.category === 'sleep';
    if (selectedFilter === 'morning') return item.category === 'morning_evening';
    return item.category === selectedFilter;
  });

  const filteredAudioStories = audioStories.filter((s) => {
    if (audioCategoryFilter === 'all') return true;
    return s.category === audioCategoryFilter;
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

      {/* Main Spiritual Banner */}
      <div
        className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl border transition-all ${
          mode === 'day'
            ? 'bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 text-white border-emerald-300/40 shadow-emerald-900/10'
            : 'bg-gradient-to-br from-[#06241a] via-[#093527] to-[#03130d] text-white border-emerald-500/40 shadow-emerald-950/40'
        }`}
      >
        {/* Decorative Golden Ornaments */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-xs sm:text-sm font-bold backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>ركن القصص الدينية الإسلامية المصورة والصوتية 🕌📖</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-100 to-amber-300 leading-tight">
              قصص مباركة، كتب مصورة تفاعلية، وأصوات ملهمة
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              تصفّح الكتب المصورة المشكولة صفحة بصفحة، استمع لروايات السيرة والأنبياء بصوت الراوي، وسجّل قراءتك بصوتك في استوديو التسجيل، وردد الأذكار اليومية والتسبيح النبوي.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <button
                onClick={() => {
                  playSparkleSound();
                  setActiveSubTab('picture_books');
                  if (onOpenPictureBook) onOpenPictureBook(JUMUAH_PICTURE_BOOK);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-emerald-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <span>📖</span>
                <span>تصفّح كتاب «يوم الجمعة» المصور</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveSubTab('audio_stories');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/60 hover:bg-emerald-500/80 text-white font-extrabold text-xs sm:text-sm border border-emerald-400/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <span>🎧</span>
                <span>القصص الصوتية والتسجيل</span>
              </button>

              {isOwnerAdmin && (
                <button
                  onClick={() => {
                    playSparkleSound();
                    if (onOpenPictureBook) onOpenPictureBook(undefined);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer border border-pink-400/40 transition-all hover:scale-105"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>نشر كتاب مصور جديد (خاص بك) 👑</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Highlight Card - Jumu'ah Day */}
          <div
            onClick={() => {
              playSparkleSound();
              if (onOpenPictureBook) onOpenPictureBook(JUMUAH_PICTURE_BOOK);
            }}
            className="w-full md:w-80 rounded-2xl p-4 bg-gradient-to-b from-[#093d2e]/90 to-[#032017]/90 border border-emerald-400/50 shadow-xl flex flex-col items-center text-center cursor-pointer transition-all hover:scale-105 group ring-1 ring-amber-300/30"
          >
            <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 border border-emerald-400/40 shadow-inner">
              <img
                src="/assets/aistudio/Capture_d__cran_2026-10-20_135742_9bb46748.png"
                alt="يوم الجمعة"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-400/50 text-[10px] font-black text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                <span>كتاب مصور 10 صفحات</span>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white font-bold">
                مشكول بالكامل 📜
              </div>
            </div>

            <h3 className="font-black text-base text-amber-300 group-hover:text-amber-200 transition-colors">
              يَوْمُ الْجُمُعَةِ 🕌✨
            </h3>
            <p className="text-[11px] text-emerald-200/80 mt-1 line-clamp-2">
              «عَادَ أَحْمَدُ إِلَى الْبَيْتِ وَقَلْبُهُ مَلِيءٌ بِالنُّورِ وَالْفَرَحِ...»
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-emerald-300 group-hover:translate-x-1 transition-transform">
              <span>افتح واقرأ الآن</span>
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
            setActiveSubTab('picture_books');
          }}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'picture_books'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/50 scale-102'
              : 'bg-white/5 hover:bg-white/10 text-emerald-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>الكتب المصورة التفاعلية 📖💎</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black">
            {allBooks.length}
          </span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('audio_stories');
          }}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'audio_stories'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/50 scale-102'
              : 'bg-white/5 hover:bg-white/10 text-emerald-200'
          }`}
        >
          <Volume2 className="w-4 h-4 text-emerald-300" />
          <span>القصص الدينية الصوتية 🎧🎙️</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/40 text-emerald-200 text-[10px] font-black">
            {audioStories.length}
          </span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('sunnah_athkar');
          }}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'sunnah_athkar'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/50 scale-102'
              : 'bg-white/5 hover:bg-white/10 text-emerald-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>الأذكار والتسبيح النبوي 📿🤲</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('my_recordings');
          }}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
            activeSubTab === 'my_recordings'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/50 scale-102'
              : 'bg-white/5 hover:bg-white/10 text-emerald-200'
          }`}
        >
          <Mic className="w-4 h-4 text-pink-300" />
          <span>تسجيلات الأطفال 🎙️⭐</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PICTURE BOOKS (كتب مصورة تفاعلية بالصفحات والصوت)              */}
      {/* ========================================================================= */}
      {activeSubTab === 'picture_books' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <span>📖</span>
                <span>مكتبة الكتب الدينية المصورة المشكولة</span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                اقرأ الحكاية صفحة بصفحة مع رسوم كرتونية ساحرة، نصوص مشكولة، صوت الراوي، واستوديو تسجيل صوتك 🎙️
              </p>
            </div>

            {isOwnerAdmin && (
              <button
                onClick={() => {
                  playSparkleSound();
                  if (onOpenPictureBook) onOpenPictureBook(undefined);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-emerald-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all self-end sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>نشر كتاب مصور جديد (خاص بك) 👑</span>
              </button>
            )}
          </div>

          {/* Picture Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {allBooks.map((book) => {
              const isJumuah = book.id === 'jumuah-day';
              return (
                <div
                  key={book.id}
                  className={`relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
                    isJumuah
                      ? 'bg-gradient-to-br from-[#0a3527] to-[#041a12] border-amber-400/60 ring-2 ring-amber-400/30'
                      : 'bg-gradient-to-br from-[#0c2f23] to-[#061e16] border-emerald-500/40 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Image */}
                    <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-emerald-400/40 shadow-inner group">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/85 backdrop-blur-md border border-amber-300/50 text-amber-300 font-black text-xs flex items-center gap-1.5 shadow-md">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{book.badge || 'كتاب مصور 10 صفحات'}</span>
                      </div>

                      <div className="absolute bottom-3 right-3 left-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/80 text-white text-[11px] font-bold">
                          الفئة: {book.ageRange || 'جميع الأعمار 🌟'}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white mt-1 drop-shadow-md">
                          {book.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                      {book.subtitle}
                    </p>

                    {/* Moral lesson box */}
                    {book.moralLesson && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-xs text-emerald-200">
                        <span className="font-black text-amber-300 ml-1">💎 القيمة والعبرة:</span>
                        <span>{book.moralLesson}</span>
                      </div>
                    )}

                    {/* Page 10 quote for Jumuah story */}
                    {isJumuah && (
                      <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/40 text-[11px] sm:text-xs text-amber-200 font-serif leading-relaxed">
                        <span className="font-bold text-amber-300 block mb-0.5">🌟 من كلمات الصفحة العاشرة:</span>
                        «عَادَ أَحْمَدُ إِلَى الْبَيْتِ وَقَلْبُهُ مَلِيءٌ بِالنُّورِ وَالْفَرَحِ، وَقَرَّرَ أَنْ يُحَافِظَ عَلَى قِرَاءَةِ سُورَةِ الْكَهْفِ وَصَلَاةِ الْجُمُعَةِ كُلَّ أُسْبُوعٍ.»
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-2 border-t border-emerald-500/30 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        playSparkleSound();
                        if (onOpenPictureBook) onOpenPictureBook(book);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>تصفّح الكتاب المصور بالكامل (10 صفحات) 📖</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: AUDIO RELIGIOUS STORIES (القصص الدينية الصوتية 🎧)              */}
      {/* ========================================================================= */}
      {activeSubTab === 'audio_stories' && (
        <div className="space-y-6">
          {/* Header & Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <span>🎧</span>
                <span>القصص الدينية الصوتية واستوديو تسجيل صوتك</span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                استمع إلى أجمل الحكايات الإسلامية بصوت الراوي الودود مع إمكانية تسجيل قراءتك بصوتك الخاص لكسب +30 نقطة!
              </p>
            </div>

            {isOwnerAdmin && (
              <button
                onClick={() => {
                  playSparkleSound();
                  setShowAddAudioModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-emerald-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all self-end sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قصة صوتية جديدة (خاص بك) 👑</span>
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'جميع القصص 🌟' },
              { id: 'sunnah', label: 'السنن النبوية 🕌' },
              { id: 'prophets', label: 'قصص الأنبياء 📜' },
              { id: 'morals', label: 'أخلاق وقيم 💎' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playClickSound();
                  setAudioCategoryFilter(f.id);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                  audioCategoryFilter === f.id
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white/5 text-emerald-200 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Active Player if a story is selected */}
          {activeAudioStory && (
            <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#06261a] to-[#0c3829] border border-amber-400/50 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-2xl border border-amber-400/40">
                    🕌
                  </div>
                  <div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                      مشغّل القصة الدينية
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-amber-200 mt-0.5">
                      {activeAudioStory.title}
                    </h3>
                  </div>
                </div>

                {/* Narrator Speed Controls */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                  <span className="text-[10px] text-emerald-300 font-bold px-1.5 hidden sm:inline">السرعة:</span>
                  {[0.8, 1.0, 1.2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        playClickSound();
                        setNarratorSpeed(spd);
                        if (isPlayingAudio) {
                          handleTogglePlayAudioStory(activeAudioStory);
                          setTimeout(() => handleTogglePlayAudioStory(activeAudioStory), 200);
                        }
                      }}
                      className={`px-2 py-1 rounded-lg font-black transition-all ${
                        narratorSpeed === spd
                          ? 'bg-amber-400 text-emerald-950 font-bold'
                          : 'text-emerald-200 hover:bg-white/10'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Tashkeel Text Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-emerald-500/30 font-serif text-sm sm:text-base leading-loose text-emerald-100 text-right selection:bg-amber-400 selection:text-emerald-950">
                {activeAudioStory.tashkeelText}
              </div>

              {/* Player Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleTogglePlayAudioStory(activeAudioStory)}
                  className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95 ${
                    isPlayingAudio
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-950/60'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>إيقاف القراءة الصوتية</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>استمع بصوت الراوي 🎧</span>
                    </>
                  )}
                </button>

                {/* Microphone Recording Studio */}
                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <Mic className="w-4 h-4 text-amber-300" />
                      <span>سجّل قراءتك بصوتك 🎙️</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-rose-950/80 px-3 py-1.5 rounded-2xl border border-rose-500 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-xs font-mono font-bold text-white">
                        {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={stopRecording}
                        className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>إنهاء</span>
                      </button>
                    </div>
                  )}

                  {recordedAudioUrl && !isRecording && (
                    <div className="flex items-center gap-2 bg-emerald-900/60 p-1.5 rounded-2xl border border-emerald-400/40">
                      <audio src={recordedAudioUrl} controls className="h-8 max-w-[150px]" />
                      <button
                        onClick={saveRecording}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>احفظ واكسب +30 ⭐</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Quiz */}
              {activeAudioStory.quiz && activeAudioStory.quiz.length > 0 && (
                <div className="mt-4 pt-4 border-t border-emerald-500/30 space-y-3">
                  <h4 className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>اختبر معلوماتك في القصة (اكسب 15 نجمة):</span>
                  </h4>

                  {activeAudioStory.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <p className="text-xs sm:text-sm font-bold text-emerald-200">{q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[qIdx] === optIdx;
                          const isCorrect = optIdx === q.correctIndex;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerQuiz(qIdx, optIdx)}
                              className={`p-2.5 rounded-xl text-right text-xs font-bold transition-all cursor-pointer ${
                                quizSubmitted
                                  ? isCorrect
                                    ? 'bg-emerald-600 text-white border-2 border-amber-300'
                                    : isSelected
                                    ? 'bg-rose-700 text-white'
                                    : 'bg-white/5 text-gray-400'
                                  : isSelected
                                  ? 'bg-amber-400 text-emerald-950 font-black shadow-md'
                                  : 'bg-white/5 hover:bg-white/10 text-emerald-100'
                              }`}
                            >
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && (
                        <p className="text-[11px] text-amber-200 mt-1 font-medium">{q.explanation}</p>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted && Object.keys(quizAnswers).length > 0 && (
                    <button
                      onClick={handleCheckQuiz}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-emerald-950 font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-all"
                    >
                      تحقق من الإجابات واجمع النجوم 🌟
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAudioStories.map((story) => {
              const isSelected = activeAudioStory?.id === story.id;
              return (
                <div
                  key={story.id}
                  className={`rounded-3xl p-4 border transition-all duration-300 flex flex-col justify-between shadow-lg ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#0e3b2c] to-[#06241b] border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-gradient-to-b from-[#092d21] to-[#041912] border-emerald-500/40 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-emerald-400/30 shadow-inner">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-[10px] text-amber-300 font-bold border border-emerald-400/40">
                        {story.badge}
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-white font-mono">
                        {story.duration}
                      </div>
                    </div>

                    <h3 className="font-black text-sm sm:text-base text-amber-200 line-clamp-1">
                      {story.title}
                    </h3>

                    <p className="text-xs text-emerald-100/80 line-clamp-2 leading-relaxed">
                      {story.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-emerald-500/30 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        setActiveAudioStory(story);
                        handleTogglePlayAudioStory(story);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-102"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isSelected && isPlayingAudio ? 'إيقاف' : 'استمع للقصة 🎧'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: SUNNAH ATHKAR & TASBEEH (الأذكار والتسبيح النبوي 📿)             */}
      {/* ========================================================================= */}
      {activeSubTab === 'sunnah_athkar' && (
        <div className="space-y-6">
          {/* Digital Tasbeeh Section */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#08291e] to-[#03150e] border border-amber-400/50 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-emerald-500/30 pb-3">
              <div className="flex items-center gap-2 text-amber-300">
                <span className="text-2xl">📿</span>
                <h3 className="font-black text-base sm:text-lg">مسبحة رائد النبوية الإلكترونية</h3>
              </div>

              {/* Target Selector */}
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

            {/* Dhikr Selector */}
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

            {/* Big Interactive Counter Button */}
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

          {/* Filter Bar for Athkar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'الكل 🤲' },
              { id: 'surah', label: 'قصار السور 📜' },
              { id: 'morning', label: 'الصباح والمساء ☀️' },
              { id: 'sleep', label: 'قبل النوم 🌙' },
              { id: 'duaa', label: 'أدعية يومية 🤲' }
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

          {/* Sunnah Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSunnahItems.map((item) => {
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

                    {/* Vocalized Arabic Text */}
                    <div className="p-3.5 rounded-2xl bg-black/30 border border-emerald-500/30 font-serif text-sm sm:text-base text-emerald-100 text-right leading-loose">
                      {item.arabicText}
                    </div>

                    {/* Virtue / explanation */}
                    {item.virtue && (
                      <div className="text-[11px] text-amber-200/90 bg-amber-400/10 p-2 rounded-xl border border-amber-400/20">
                        <span className="font-bold">✨ فضل الذكر:</span> {item.virtue}
                      </div>
                    )}
                  </div>

                  {/* Actions & Counter */}
                  <div className="pt-3 mt-3 border-t border-emerald-500/30 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handlePlaySunnahItem(item)}
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
      {/* SUB-TAB 4: CHILDREN'S RECORDINGS (تسجيلات الأطفال 🎙️⭐)                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'my_recordings' && (
        <div className="space-y-4">
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4">
            <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
              <Mic className="w-5 h-5 text-pink-300" />
              <span>تسجيلات الأطفال الصوتية في الركن الديني</span>
            </h2>
            <p className="text-xs text-emerald-200/80">
              استمع إلى قراءاتك المسجلة أو شاركها في نادي القراءة مع زملائك المبدعين!
            </p>
          </div>

          {existingRecordings.length === 0 ? (
            <div className="p-8 rounded-3xl bg-black/20 border border-emerald-500/30 text-center space-y-3">
              <Mic className="w-12 h-12 text-emerald-400/40 mx-auto" />
              <h3 className="font-bold text-emerald-200">لا توجد تسجيلات بعد</h3>
              <p className="text-xs text-emerald-300/70 max-w-sm mx-auto">
                اختر أي قصة دينية أو صفحة من كتاب «يوم الجمعة»، واضغط على زر «سجّل قراءتك بصوتك 🎙️» لتظهر تسجيلاتك هنا!
              </p>
              <button
                onClick={() => setActiveSubTab('audio_stories')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                انتقل للقصص الصوتية الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {existingRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-2xl p-4 bg-gradient-to-br from-[#0c2e22] to-[#061b14] border border-emerald-500/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 truncate max-w-[200px]">
                      {rec.title}
                    </span>
                    <span className="text-[10px] text-emerald-300">{rec.createdAt}</span>
                  </div>

                  <audio src={rec.audioBlobUrl} controls className="w-full h-8" />

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/20 text-emerald-200">
                    <span>المدة: {rec.durationSec} ثانية</span>
                    <span className="text-amber-300 font-bold">+{rec.scorePoints || 25} نقطة ⭐</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Owner Add Audio Story Modal */}
      {showAddAudioModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#07241a] border border-amber-400/50 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
              <h3 className="font-black text-lg text-amber-300 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>إضافة قصة دينية صوتية جديدة (خاص بالمالكة 👑)</span>
              </h3>
              <button
                onClick={() => setShowAddAudioModal(false)}
                className="p-1 rounded-xl bg-white/10 text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAudioStory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-emerald-200 mb-1">عنوان القصة:</label>
                <input
                  type="text"
                  required
                  value={newAudioTitle}
                  onChange={(e) => setNewAudioTitle(e.target.value)}
                  placeholder="مثال: قصة الصدق منجاة 💎"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/40 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-200 mb-1">وصف موجز / العبرة:</label>
                <input
                  type="text"
                  value={newAudioSubtitle}
                  onChange={(e) => setNewAudioSubtitle(e.target.value)}
                  placeholder="قصة إسلامية ممتعة بصوت الراوي..."
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/40 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-200 mb-1">الفئة:</label>
                <select
                  value={newAudioCategory}
                  onChange={(e) => setNewAudioCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#031911] border border-emerald-500/40 text-emerald-200 outline-none"
                >
                  <option value="sunnah">سنن نبوية مباركة 🕌</option>
                  <option value="prophets">قصص الأنبياء والرسل 📜</option>
                  <option value="morals">أخلاق وقيم إسلامية 💎</option>
                  <option value="quran">قصص من القرآن الكريم 🌟</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-emerald-200 mb-1">نص الحكاية (مشكول أو عادي):</label>
                <textarea
                  rows={4}
                  required
                  value={newAudioText}
                  onChange={(e) => setNewAudioText(e.target.value)}
                  placeholder="اكتبي نص الحكاية هنا وسيقوم النظام الصوتي بقراءتها تلقائياً بصوت الراوي العربي..."
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/40 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAudioModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-emerald-950 font-black shadow-lg"
                >
                  نشر القصة الصوتية فوراً 🌟
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
