import React, { useState, useRef, useEffect } from 'react';
import { AppMode, UserAudioRecording } from '../types';
import {
  Sparkles,
  BookOpen,
  PenTool,
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Save,
  Check,
  Upload,
  Image as ImageIcon,
  Heart,
  Star,
  Layers,
  Smile,
  Trash2,
  Download,
  Flame,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playSparkleSound, playPopSound, playFanfareSound, speakArabicSpeech, stopArabicSpeech } from '../utils/audio';
import { generateAIStory, GeneratedStoryResult } from '../utils/aiStoryGenerator';

interface MyStoryCornerProps {
  mode: AppMode;
  onEarnStars: (amount: number) => void;
  onSaveUserRecording?: (recording: UserAudioRecording) => void;
}

interface SavedCreatedStory extends GeneratedStoryResult {
  id: string;
  createdAt: string;
  coverImage?: string;
  audioBlobUrl?: string;
}

const HERO_PRESETS = [
  { name: 'ليان 🌸', traits: 'بطلة ذكية وشجاعة تملك كتاب أحلامها' },
  { name: 'رائد 🧑‍🚀', traits: 'مستكشف فضائي يحب النجوم والمغامرات' },
  { name: 'الأميرة جنى 👸', traits: 'أميرة لطيفة تحب مساعدة الصديقات' },
  { name: 'فارس الشجاع 🛡️', traits: 'فارس نبيل يدافع عن الخير والحق' },
  { name: 'أنا البطل (اسمي) 🌟', traits: 'طفل مبدع يكتب حكايته بنفسه' },
];

const SETTING_PRESETS = [
  'قصر السحاب الوردي والنجوم 🏰',
  'كوكب المريخ وسفينة الكريستال 🪐',
  'حديقة الزهور السحرية والفراشات 🌸',
  'مدرسة الأبطال ومكتبة الأسرار 📚',
  'واحة الصحراء الذهبية وخيمة النور 🌴',
  'أعماق البحر وقصر اللؤلؤ 🐬',
];

const MORAL_PRESETS = [
  'الصدق والوفاء بالوعد ينيران درب الإنسان 💎',
  'الصداقة والتعاون يحققان المعجزات 🤝',
  'بر الوالدين مفتاح كل خير وسعادة 💖',
  'الشجاعة في مواجهة الصعاب ونصرة الخير 🛡️',
  'حب العلم والقراءة يجعلنا أبطال المستقبل 📖',
];

export const MyStoryCorner: React.FC<MyStoryCornerProps> = ({
  mode,
  onEarnStars,
  onSaveUserRecording,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'illustrate' | 'record' | 'myStories'>('create');

  // Story Creator form state
  const [heroName, setHeroName] = useState<string>('ليان');
  const [customHeroName, setCustomHeroName] = useState<string>('');
  const [heroTraits, setHeroTraits] = useState<string>('بطلة ذكية وشجاعة تملك كتاب أحلامها');
  const [setting, setSetting] = useState<string>(SETTING_PRESETS[0]);
  const [moralLesson, setMoralLesson] = useState<string>(MORAL_PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active created story
  const [currentStory, setCurrentStory] = useState<GeneratedStoryResult | null>(null);
  const [activePageIdx, setActivePageIdx] = useState<number>(0);
  const [storyCover, setStoryCover] = useState<string>('/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png');

  // Drawing Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#ff007f');
  const [brushSize, setBrushSize] = useState<number>(6);
  const [pageDrawings, setPageDrawings] = useState<{ [page: number]: string }>({});

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recSeconds, setRecSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Saved Stories List
  const [savedStories, setSavedStories] = useState<SavedCreatedStory[]>(() => {
    try {
      const saved = localStorage.getItem('raed_my_created_stories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Read aloud active page with TTS
  const handleReadAloud = (textToRead: string) => {
    playClickSound();
    setIsPlayingAudio(true);
    speakArabicSpeech(
      textToRead,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const handleGenerateStory = async () => {
    playSparkleSound();
    setIsGenerating(true);
    stopArabicSpeech();

    const actualHero = heroName.includes('اسمي') && customHeroName.trim() ? customHeroName.trim() : heroName;

    try {
      const result = await generateAIStory({
        heroName: actualHero,
        heroTraits,
        setting,
        moralLesson,
        targetPages: 4,
      });

      setCurrentStory(result);
      setActivePageIdx(0);
      setActiveTab('create');
      playFanfareSound();
      confetti({ particleCount: 70, spread: 60 });
      onEarnStars(30);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas drawing handlers
  useEffect(() => {
    if (activeTab === 'illustrate' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (isDrawing && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setPageDrawings((prev) => ({ ...prev, [activePageIdx + 1]: dataUrl }));
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playPopSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Microphone recording
  const handleStartRecord = async () => {
    playSparkleSound();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('المتصفح لا يدعم تسجيل الصوت أو يتطلب HTTPS');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        if (onSaveUserRecording && currentStory) {
          onSaveUserRecording({
            id: `rec-mystory-${Date.now()}`,
            title: `قصتي: ${currentStory.title}`,
            storyTitle: currentStory.title,
            createdAt: new Date().toLocaleDateString('ar-EG'),
            durationSec: recSeconds,
            audioBlobUrl: url,
          });
        }
        playFanfareSound();
        confetti({ particleCount: 50, spread: 60 });
        onEarnStars(40);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecSeconds(0);
      recTimerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (err) {
      alert('يرجى السماح بالوصول للميكروفون لتسجيل القصة بصوتك!');
    }
  };

  const handleStopRecord = () => {
    playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    }
  };

  const handleSaveToMyStories = () => {
    if (!currentStory) return;
    playFanfareSound();
    const newSaved: SavedCreatedStory = {
      ...currentStory,
      id: `story-created-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('ar-EG'),
      coverImage: storyCover,
      audioBlobUrl: recordedAudioUrl || undefined,
    };
    const updated = [newSaved, ...savedStories];
    setSavedStories(updated);
    try {
      localStorage.setItem('raed_my_created_stories', JSON.stringify(updated));
    } catch {}
    confetti({ particleCount: 80, spread: 70 });
    onEarnStars(50);
    alert('تم حفظ قصتك بنجاح في مكتبة قصصي! 🌟');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-6" dir="rtl">
      {/* Premier Hero Banner featuring Layan holding her story book */}
      <div
        className={`relative rounded-3xl overflow-hidden border shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${
          mode === 'day'
            ? 'bg-gradient-to-r from-pink-100 via-purple-50 to-amber-50 border-pink-200'
            : 'bg-gradient-to-r from-[#280d3d] via-[#1c082e] to-[#120520] border-purple-800/80'
        }`}
      >
        <div className="space-y-3.5 max-w-xl text-center md:text-right flex-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-900/40 border border-pink-400/40 text-pink-300 font-black text-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>ركن الإبداع للأطفال: أنا بطلة قصتي 🌟</span>
          </div>

          <h1
            className={`text-2xl sm:text-4xl font-black leading-tight ${
              mode === 'day' ? 'text-indigo-950' : 'text-white'
            }`}
          >
            ركن "قِصَّتِي" الذكي 📖✨
          </h1>

          <p
            className={`text-xs sm:text-sm font-medium leading-relaxed ${
              mode === 'day' ? 'text-slate-700' : 'text-purple-200/90'
            }`}
          >
            ألّف حكايتك الخيالية بمساعدة الذكاء الاصطناعي، صمم رسومات المشاهد، وسجّل قراءتك بصوتك في استوديو الأطفال لتكون بطل قصتك دائماً!
          </p>

          {/* Quick Action Tabs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('create');
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>تأليف قصة جديدة ✨</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('illustrate');
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'illustrate'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>مرسم ورسومات القصة 🎨</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('record');
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'record'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>تسجيل صوتي 🎙️</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('myStories');
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'myStories'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>قصصي المحفوظة ({savedStories.length}) 📚</span>
            </button>
          </div>
        </div>

        {/* Layan Artwork Card */}
        <div className="relative w-52 sm:w-60 h-64 sm:h-72 rounded-3xl overflow-hidden border-2 border-pink-400/50 shadow-2xl flex-shrink-0 group hover:scale-105 transition-all">
          <img
            src="/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png"
            alt="ليان - أنا بطلة قصتي"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-center">
            <span className="text-xs font-black text-amber-300 drop-shadow">ليان: كل قصة بداية حلم جديد 💖</span>
          </div>
        </div>
      </div>

      {/* Main Feature View */}
      {/* 1. Create Story Tab */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Creator Configuration Form */}
          <div
            className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border shadow-xl space-y-4 ${
              mode === 'day'
                ? 'bg-white/90 border-pink-200'
                : 'bg-[#180a2c]/90 border-purple-800'
            }`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <span className="text-xl">✍️</span>
              <h3 className="font-black text-base sm:text-lg">اختر ملامح قصتك السحرية:</h3>
            </div>

            {/* Hero Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-400">بطل أو بطلة القصة:</label>
              <div className="grid grid-cols-2 gap-2">
                {HERO_PRESETS.map((h) => {
                  const isSel = heroName === h.name;
                  return (
                    <button
                      key={h.name}
                      onClick={() => {
                        playClickSound();
                        setHeroName(h.name);
                        setHeroTraits(h.traits);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border text-right cursor-pointer ${
                        isSel
                          ? 'border-pink-500 bg-pink-500/20 text-pink-300 font-black'
                          : 'border-white/10 bg-white/5 text-purple-200 hover:bg-white/10'
                      }`}
                    >
                      {h.name}
                    </button>
                  );
                })}
              </div>

              {heroName.includes('اسمي') && (
                <input
                  type="text"
                  placeholder="اكتب اسمك هنا (مثال: سارة، أحمد)..."
                  value={customHeroName}
                  onChange={(e) => setCustomHeroName(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/50 text-white text-xs placeholder-purple-400/60 focus:outline-none focus:border-pink-400"
                />
              )}
            </div>

            {/* Setting / Location Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-400">المكان والمغامرة:</label>
              <select
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/50 text-white text-xs font-bold focus:outline-none focus:border-pink-400 cursor-pointer"
              >
                {SETTING_PRESETS.map((s) => (
                  <option key={s} value={s} className="bg-[#180a2c]">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Moral Lesson Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-400">العبرة والقيمة الأخلاقية:</label>
              <select
                value={moralLesson}
                onChange={(e) => setMoralLesson(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/50 text-white text-xs font-bold focus:outline-none focus:border-pink-400 cursor-pointer"
              >
                {MORAL_PRESETS.map((m) => (
                  <option key={m} value={m} className="bg-[#180a2c]">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-pink-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <span>الذكاء الاصطناعي يؤلف الحكاية السحرية الآن... ✍️✨</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>تأليف القصة بالذكاء الاصطناعي 🌟</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Story Reader & Live View */}
          <div
            className={`lg:col-span-7 p-5 sm:p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
              mode === 'day'
                ? 'bg-white/90 border-pink-200'
                : 'bg-[#180a2c]/90 border-purple-800'
            }`}
          >
            {currentStory ? (
              <div className="space-y-4">
                {/* Story Title & Badge */}
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-amber-400">{currentStory.title}</h2>
                    <p className="text-xs text-purple-200/80">{currentStory.subtitle}</p>
                  </div>

                  <button
                    onClick={() => handleReadAloud(currentStory.pages[activePageIdx]?.text || '')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600/40 hover:bg-purple-600 text-amber-300 hover:text-white border border-purple-400/50 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow"
                    title="الاستماع لصوت الراوي"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>اقرأ لي 🎧</span>
                  </button>
                </div>

                {/* Page Card */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 min-h-[180px]">
                  <div className="flex items-center justify-between text-xs font-black text-pink-400">
                    <span>
                      صفحة {activePageIdx + 1} من {currentStory.pages.length}: {currentStory.pages[activePageIdx]?.title}
                    </span>
                    <span className="text-amber-400">✨ مشكولة</span>
                  </div>

                  <p className="text-base sm:text-lg leading-loose font-medium text-white/95">
                    {currentStory.pages[activePageIdx]?.text}
                  </p>

                  {/* Illustration suggestion */}
                  <div className="pt-2 text-xs text-purple-300/80 border-t border-white/5 flex items-center gap-2">
                    <span className="font-bold text-amber-400">💡 فكرة الرسمة:</span>
                    <span>{currentStory.pages[activePageIdx]?.illustrationPrompt}</span>
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActivePageIdx((p) => Math.max(0, p - 1))}
                    disabled={activePageIdx === 0}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>الصفحة السابقة</span>
                  </button>

                  <div className="flex gap-1.5">
                    {currentStory.pages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePageIdx(i)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          i === activePageIdx ? 'bg-amber-400 scale-125' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setActivePageIdx((p) => Math.min(currentStory.pages.length - 1, p + 1))}
                    disabled={activePageIdx === currentStory.pages.length - 1}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>الصفحة التالية</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Save Story Button */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveTab('illustrate')}
                    className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>ارسم غلاف ومشاهدي 🎨</span>
                  </button>

                  <button
                    onClick={handleSaveToMyStories}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ القصة في مكتبتي 💾 (+50 ⭐)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 flex-1">
                <div className="w-16 h-16 rounded-3xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-4xl shadow-inner">
                  📖
                </div>
                <h4 className="font-black text-lg text-white">اختر ملامح قصتك واضغط زر التأليف السحري!</h4>
                <p className="text-xs text-purple-200/80 max-w-sm">
                  سيقوم الذكاء الاصطناعي بتأليف حكاية مشكولة وكاملة مخصصة لك في ثوانٍ معدودة.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Illustrate / Canvas Drawing Tab */}
      {activeTab === 'illustrate' && (
        <div className="p-6 rounded-3xl border shadow-xl bg-[#180a2c]/90 border-purple-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-black text-lg text-amber-300">مرسم ورسومات القصة</h3>
                <p className="text-xs text-purple-200/80">ارسم مشهد القصة أو لوّن غلافها بنفسك</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearCanvas}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>مسح اللوحة</span>
              </button>
            </div>
          </div>

          {/* Tools Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30">
            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-200">الألوان:</span>
              {['#ff007f', '#00f5d4', '#ffbe0b', '#8338ec', '#3a86ff', '#ffffff', '#111111'].map((c) => (
                <button
                  key={c}
                  onClick={() => setBrushColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    brushColor === c ? 'scale-125 border-white ring-2 ring-amber-400' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Brush Sizes */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-200">السمك:</span>
              {[3, 6, 12, 20].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setBrushSize(sz)}
                  className={`w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold ${
                    brushSize === sz ? 'bg-amber-400 text-amber-950' : 'text-purple-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Box */}
          <div className="flex justify-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-purple-400/50 shadow-2xl bg-white">
              <canvas
                ref={canvasRef}
                width={700}
                height={400}
                onMouseDown={startDraw}
                onMouseMove={drawMove}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={drawMove}
                onTouchEnd={stopDraw}
                className="cursor-crosshair touch-none w-full max-w-[700px] h-auto max-h-[400px] block"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Record Voice Tab */}
      {activeTab === 'record' && (
        <div className="p-8 rounded-3xl border shadow-xl bg-[#180a2c]/90 border-purple-800 text-center space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-4xl shadow-inner">
            🎙️
          </div>

          <div>
            <h3 className="text-2xl font-black text-amber-300">سجّل قراءتك للقصة بصوتك!</h3>
            <p className="text-xs text-purple-200/80 mt-1">
              اقرأ كلمات الحكاية بمشاعرك الجميلة لتستمع إليها العائلة والأصدقاء (+40 ⭐).
            </p>
          </div>

          {/* Recording Timer / Wave */}
          {isRecording && (
            <div className="space-y-3">
              <div className="text-3xl font-black text-rose-500 animate-pulse">
                00:{recSeconds < 10 ? `0${recSeconds}` : recSeconds}
              </div>
              <div className="flex items-center justify-center gap-1 h-8">
                {[4, 8, 12, 16, 20, 16, 12, 8, 4].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-rose-400 rounded-full animate-bounce"
                    style={{ height: `${h * 1.5}px`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Record Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={handleStartRecord}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mic className="w-5 h-5" />
                <span>بدء التسجيل الصوتي 🎙️</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecord}
                className="px-6 py-3.5 rounded-2xl bg-red-600 text-white font-black text-sm shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>إيقاف وحفظ التسجيل ⏹️</span>
              </button>
            )}
          </div>

          {/* Recorded Audio Player */}
          {recordedAudioUrl && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
                <Check className="w-4 h-4" />
                <span>تم تسجيل صوتك بنجاح! استمع إليه:</span>
              </div>
              <audio src={recordedAudioUrl} controls className="w-full mt-2" />
            </div>
          )}
        </div>
      )}

      {/* 4. My Saved Stories Tab */}
      {activeTab === 'myStories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-xl font-black text-amber-300">مكتبة قصصي المؤلّفة 📚</h3>
            <span className="text-xs text-purple-200">إجمالي القصص: {savedStories.length}</span>
          </div>

          {savedStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedStories.map((st) => (
                <div
                  key={st.id}
                  className="rounded-3xl p-5 border border-purple-500/40 bg-purple-950/40 shadow-xl space-y-3 text-right"
                >
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                    <img
                      src={st.coverImage || '/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png'}
                      alt={st.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="font-black text-base text-white">{st.title}</h4>
                    <p className="text-xs text-purple-200/80 line-clamp-2 mt-1">{st.subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-amber-300 border-t border-white/10 pt-2 font-bold">
                    <span>البطل: {st.hero}</span>
                    <span>{st.createdAt}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCurrentStory(st);
                        setActiveTab('create');
                      }}
                      className="flex-1 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>قراءة القصة</span>
                    </button>
                    {st.audioBlobUrl && (
                      <button
                        onClick={() => {
                          const a = new Audio(st.audioBlobUrl);
                          a.play();
                        }}
                        className="p-2 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs cursor-pointer"
                        title="تشغيل تسجيل صوتك"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center space-y-3">
              <span className="text-4xl">📚</span>
              <p className="text-sm font-bold text-purple-200">لم تقم بتأليف وحفظ أي قصة بعد.</p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-5 py-2.5 rounded-2xl bg-pink-500 text-white font-black text-xs cursor-pointer"
              >
                ابدأ بتأليف أول قصة لك الآن ✍️✨
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
