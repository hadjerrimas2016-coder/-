import React, { useState, useRef } from 'react';
import { Story, AppMode, UserAudioRecording } from '../types';
import { DEFAULT_COOKING_STORIES } from '../data/cookingStoriesData';
import {
  UtensilsCrossed,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  BookOpen,
  Mic,
  Square,
  CheckCircle2,
  Star,
  Award,
  Heart,
  Clock,
  Flame,
  ChefHat,
  Plus,
  HelpCircle,
  ChevronRight,
  Maximize2,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playSparkleSound,
  playFanfareSound,
  playClickSound,
  playPopSound,
  speakArabicSpeech,
  stopArabicSpeech
} from '../utils/audio';

interface CookingCornerProps {
  mode: AppMode;
  stories: Story[];
  onOpenStory: (story: Story) => void;
  favorites: string[];
  onToggleFavorite: (storyId: string) => void;
  onEarnStars: (amount: number, reason: string) => void;
  onOpenAdmin?: () => void;
  onOpenAdminPublish?: (category?: string) => void;
  onSaveUserRecording?: (recording: UserAudioRecording) => void;
  isOwnerAdmin?: boolean;
}

export const CookingCorner: React.FC<CookingCornerProps> = ({
  mode,
  stories,
  onOpenStory,
  favorites,
  onToggleFavorite,
  onEarnStars,
  onOpenAdmin,
  onOpenAdminPublish,
  onSaveUserRecording,
  isOwnerAdmin = false,
}) => {
  // Combine cloud stories with category 'cooking' + default cooking stories
  const cloudCookingStories = stories.filter((s) => s.category === 'cooking');
  const allCookingStories: Story[] = [...DEFAULT_COOKING_STORIES];
  for (const cs of cloudCookingStories) {
    if (!allCookingStories.some((item) => item.id === cs.id)) {
      allCookingStories.push(cs);
    }
  }

  const [selectedStory, setSelectedStory] = useState<Story>(allCookingStories[0]);
  const [activeTab, setActiveTab] = useState<'video' | 'story' | 'ingredients' | 'steps' | 'record'>('video');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSolved, setQuizSolved] = useState<boolean>(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTogglePlayVideo = () => {
    playClickSound();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const handleToggleMuteVideo = () => {
    playClickSound();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsVideoMuted(videoRef.current.muted);
    }
  };

  const handleFullscreenVideo = () => {
    playClickSound();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleToggleNarrate = () => {
    playClickSound();
    if (isNarrating) {
      stopArabicSpeech();
      setIsNarrating(false);
      return;
    }

    const textToSpeak = `${selectedStory.title}. ${selectedStory.subtitle}. ${selectedStory.pages[0]?.text || selectedStory.description}`;
    setIsNarrating(true);
    speakArabicSpeech(
      textToSpeak,
      () => setIsNarrating(true),
      () => {
        setIsNarrating(false);
        onEarnStars(20, `الاستماع إلى قصة ${selectedStory.title}`);
        confetti({ particleCount: 45, spread: 60 });
        playSparkleSound();
      },
      () => setIsNarrating(false),
      { voiceTone: 'joyful', rate: 0.88 }
    );
  };

  const handleToggleIngredient = (name: string) => {
    playPopSound();
    setCheckedIngredients((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
    if (!checkedIngredients.includes(name) && checkedIngredients.length + 1 === (selectedStory.ingredients?.length || 0)) {
      playFanfareSound();
      confetti({ particleCount: 50, spread: 60 });
      onEarnStars(15, 'تجهيز كل مقادير الطبق بنجاح 🥕');
    }
  };

  const handleQuizAnswer = (optionIdx: number) => {
    playClickSound();
    setSelectedQuizAnswer(optionIdx);
    const correctIdx = selectedStory.quiz?.[0]?.correctIndex ?? 0;
    if (optionIdx === correctIdx) {
      setQuizSolved(true);
      playFanfareSound();
      confetti({ particleCount: 60, spread: 70 });
      onEarnStars(25, 'الإجابة الصحيحة على سؤال الشيف الصغير 👨‍🍳⭐');
    } else {
      playPopSound();
    }
  };

  // Recording voice for cooking story
  const handleStartRecording = async () => {
    playSparkleSound();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        if (onSaveUserRecording) {
          const rec: UserAudioRecording = {
            id: `rec-cooking-${Date.now()}`,
            title: `وصفة الشيف: ${selectedStory.title}`,
            storyTitle: selectedStory.title,
            pageNumber: 1,
            createdAt: new Date().toLocaleDateString('ar-EG', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            durationSec: recordingSeconds > 0 ? recordingSeconds : 8,
            audioBlobUrl: audioUrl,
          };
          onSaveUserRecording(rec);
        }

        playFanfareSound();
        confetti({ particleCount: 60, spread: 70 });
        onEarnStars(35, `تسجيل قراءة قصة الطبخ (${selectedStory.title}) 🎙️🍲`);

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error:', err);
      alert('يرجى السماح بالوصول إلى الميكروفون لبدء التسجيل الصوتي.');
    }
  };

  const handleStopRecording = () => {
    playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTogglePlayRecorded = () => {
    if (!recordedAudioUrl) return;
    if (!recordedAudioPlayerRef.current) {
      recordedAudioPlayerRef.current = new Audio(recordedAudioUrl);
      recordedAudioPlayerRef.current.onended = () => setIsPlayingRecorded(false);
    } else {
      recordedAudioPlayerRef.current.src = recordedAudioUrl;
    }

    if (isPlayingRecorded) {
      recordedAudioPlayerRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      recordedAudioPlayerRef.current.play().catch(() => {});
      setIsPlayingRecorded(true);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner (ركن قصص ومغامرات الطبخ الممتع) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/60 bg-gradient-to-r from-[#291307] via-[#1f0f0c] to-[#120807] p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-rose-500/20 border border-amber-400/40 text-amber-300 text-xs font-black shadow-inner">
              <UtensilsCrossed className="w-4 h-4 text-amber-300" />
              <span>ركن قصص ومغامرات الطبخ الصحي بالفيديو والنص 🎬🍲</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-tight">
              مطبخ الشيف الصغير: قصص الطبخ بالفيديو 👨‍🍳🥗
            </h1>

            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-2xl font-medium">
              هنا تكتشفون أسرار المطبخ اللذيذ من خلال قصص ممتعة مصحوبة بالفيديو والنص! تعلموا كيف تختارون الخضار والفواكه، وكيف تصنعون أطباقاً شهية ومغذية مع العائلة، وآداب الطعام وشكر نعم الله.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              <button
                onClick={handleToggleNarrate}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                  isNarrating
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 hover:brightness-110 shadow-amber-400/30'
                }`}
              >
                {isNarrating ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>إيقاف صوت الحكاية ⏹️</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>استمع لقصة الوصفة صوتياً 🎙️</span>
                  </>
                )}
              </button>

              {(onOpenAdminPublish || onOpenAdmin) && (
                <button
                  onClick={() => {
                    playClickSound();
                    if (onOpenAdminPublish) {
                      onOpenAdminPublish('cooking');
                    } else if (onOpenAdmin) {
                      onOpenAdmin();
                    }
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر قصة طبخ جديدة (لوحة المالك) ✍️🎬</span>
                </button>
              )}
            </div>
          </div>

          {/* Chef Badge Avatar */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-2xl bg-gradient-to-b from-amber-900 to-rose-950 flex-shrink-0 flex items-center justify-center p-2 group">
            <img
              src={selectedStory.coverImage}
              alt={selectedStory.title}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-center rounded-2xl">
              <span className="text-xs font-black text-amber-300">الشيف الصغير 👨‍🍳</span>
              <span className="text-[10px] text-amber-100/90">{selectedStory.badge || 'فيديو وقصة'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Story Selector Carousel / Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>اختر قصة الطبخ لاستكشاف الفيديو والنص:</span>
          </span>
          <span className="text-[11px] text-purple-200/80 font-bold">
            {allCookingStories.length} قصص طهي متوفرة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allCookingStories.map((story) => {
            const isSelected = selectedStory.id === story.id;
            return (
              <div
                key={story.id}
                onClick={() => {
                  playClickSound();
                  stopArabicSpeech();
                  setIsNarrating(false);
                  setSelectedStory(story);
                  setCheckedIngredients([]);
                  setSelectedQuizAnswer(null);
                  setQuizSolved(false);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/30 to-rose-500/30 border-amber-400 text-white shadow-lg scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-300/40 flex-shrink-0">
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-400 text-amber-950">
                    {story.categoryIcon || '🍲'} {story.badge}
                  </span>
                  <h4 className="text-xs font-black text-white truncate">{story.title}</h4>
                  <span className="text-[10px] text-amber-200/80 block">⏱️ {story.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Dual Story & Video Stage */}
      <div className="rounded-3xl border border-amber-400/40 bg-gradient-to-b from-[#1c0f1e] to-[#110714] overflow-hidden shadow-2xl p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs for Selected Story: Video, Story Text, Ingredients, Steps, Record */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
          {[
            { id: 'video' as const, label: 'فيديو القصة 🎬', icon: Video },
            { id: 'story' as const, label: 'نص القصة المشكول 📖', icon: BookOpen },
            { id: 'ingredients' as const, label: 'المقادير والمكونات 🥕', icon: UtensilsCrossed },
            { id: 'steps' as const, label: 'خطوات التحضير 🥣', icon: ChefHat },
            { id: 'record' as const, label: 'سجل صوتك بالوصفة 🎙️', icon: Mic },
          ].map((tabItem) => {
            const Icon = tabItem.icon;
            const isActive = activeTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tabItem.id);
                }}
                className={`py-2 px-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow-md scale-105'
                    : 'bg-white/5 text-purple-200 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tabItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Video Player */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="relative aspect-[16/9] max-h-[460px] w-full rounded-3xl overflow-hidden bg-black border-2 border-amber-400/40 shadow-2xl">
              <video
                ref={videoRef}
                src={selectedStory.videoUrl || '/assets/aistudio/video_z5xqdjk5_20261021184400_87b84f16.mp4'}
                controls
                className="w-full h-full object-cover"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />

              {/* Overlay Video Controls */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-xs font-black border border-white/10 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>فيديو قصة: {selectedStory.title}</span>
                </span>

                <button
                  onClick={handleFullscreenVideo}
                  className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black pointer-events-auto border border-white/10 transition-all cursor-pointer"
                  title="تكبير ملء الشاشة"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick narrative summary under video */}
            <div className="p-4 rounded-2xl bg-white/5 border border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-1 text-center sm:text-right">
                <h3 className="text-sm sm:text-base font-black text-amber-300">{selectedStory.title}</h3>
                <p className="text-xs text-purple-200/80 leading-relaxed max-w-2xl">{selectedStory.description}</p>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('story');
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-amber-950 font-black text-xs hover:brightness-110 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow"
              >
                <span>اقرأ النص المشكول</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Synchronized Story Text (مشكول وتفاعلي) */}
        {activeTab === 'story' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-6 rounded-3xl bg-black/30 border border-amber-400/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-400 text-amber-950 font-black text-sm">📖</span>
                  <h3 className="text-base font-black text-amber-300">أحداث ومغامرة قصة الطبخ:</h3>
                </div>

                <button
                  onClick={handleToggleNarrate}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isNarrating ? 'إيقاف الصوت' : 'استمع للحكاية 🎙️'}</span>
                </button>
              </div>

              {selectedStory.pages.map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-amber-300">المشهد {idx + 1}</span>
                  </div>

                  <p className="text-sm sm:text-base text-amber-100 font-bold leading-loose">
                    {p.text}
                  </p>

                  {p.interactiveElements && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                      {p.interactiveElements.map((el) => (
                        <button
                          key={el.id}
                          onClick={() => {
                            playSparkleSound();
                            speakArabicSpeech(el.message);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-xs text-amber-300 border border-purple-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{el.emoji}</span>
                          <span>{el.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Moral Lesson */}
              {selectedStory.moralLesson && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/30 text-xs text-amber-200 font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>العبرة الغذائية والتربوية: {selectedStory.moralLesson}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Ingredients Checklist */}
        {activeTab === 'ingredients' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-black/30 border border-amber-400/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                    <span>المقادير والمكونات الصحية للطبق 🥕</span>
                  </h3>
                  <p className="text-xs text-purple-200">
                    اضغط على كل مكون بعد تجهيزه في المطبخ لتكسب نقاط الشيف الماهر!
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                  {checkedIngredients.length} من {selectedStory.ingredients?.length || 0} جاهزة
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(selectedStory.ingredients || [
                  { name: 'خضار مشكلة طازجة', amount: 'حسب الرغبة', emoji: '🥦' },
                  { name: 'ماء نقي وزيت زيتون', amount: 'قليل', emoji: '💧' },
                  { name: 'توابل خفيفة', amount: 'رشة', emoji: '🧂' }
                ]).map((ing, idx) => {
                  const isChecked = checkedIngredients.includes(ing.name);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleIngredient(ing.name)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow'
                          : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{ing.emoji}</span>
                        <div>
                          <span className={`text-xs sm:text-sm font-black block ${isChecked ? 'line-through text-emerald-300' : 'text-white'}`}>
                            {ing.name}
                          </span>
                          <span className="text-[11px] text-purple-300/80">{ing.amount}</span>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isChecked ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/20'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-4 h-4 fill-current" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Recipe Steps */}
        {activeTab === 'steps' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-black/30 border border-amber-400/30 space-y-4">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <span>خطوات الطهي خطوة بخطوة للأبطال الصغار:</span>
              </h3>

              <div className="space-y-3">
                {(selectedStory.recipeSteps || [
                  'غسل اليدين جيداً بالماء والصابون.',
                  'تجهيز المكونات الطازجة بمساعدة ماما.',
                  'الطهي على نار هادئة بحرص وتأنٍ.',
                  'الجلوس على المائدة وتناول الطعام الصحي بابتسامة.'
                ]).map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-amber-950 font-black text-xs flex items-center justify-center flex-shrink-0 shadow">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-amber-100 font-bold leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Voice Narration Studio (سجل صوتك بالوصفة) */}
        {activeTab === 'record' && (
          <div className="space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-950/60 via-purple-950/60 to-black/60 border-2 border-rose-500/50 space-y-4 shadow-xl text-center sm:text-right">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-rose-500 text-white font-black text-xl shadow">
                    <Mic className="w-6 h-6 animate-pulse" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-rose-300">
                      استوديو تسجيل صوتك لقصة الطبخ 🎙️🍲
                    </h3>
                    <p className="text-xs text-purple-200">
                      اقرأ أحداث القصة بصوتك أو احكِ طريقتك في تحضير هذا الطبق، واكسب +35 نجمة ذهبية تضاف فوراً لرصيدك ومكتبتك الصوتية!
                    </p>
                  </div>
                </div>

                {recordedAudioUrl && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>تم حفظ التسجيل</span>
                  </span>
                )}
              </div>

              {/* Live Recording Panel */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                {!isRecording && !recordedAudioUrl && (
                  <button
                    onClick={handleStartRecording}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:brightness-110 text-white font-black text-sm shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mic className="w-5 h-5 animate-bounce" />
                    <span>ابدأ تسجيل صوتك الآن (اقرأ القصة أو صف الطبق)</span>
                  </button>
                )}

                {isRecording && (
                  <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500 flex items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-bold text-rose-200">
                        جاري التسجيل الصوتي... المدة: {recordingSeconds} ثوانٍ
                      </span>
                    </div>

                    <button
                      onClick={handleStopRecording}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>إيقاف وحفظ التسجيل</span>
                    </button>
                  </div>
                )}

                {recordedAudioUrl && !isRecording && (
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTogglePlayRecorded}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        {isPlayingRecorded ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        <span>{isPlayingRecorded ? 'إيقاف مؤقت' : 'استمع لتسجيلك الصوتي 🎧'}</span>
                      </button>

                      <button
                        onClick={handleStartRecording}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-purple-200 cursor-pointer"
                      >
                        إعادة التسجيل
                      </button>
                    </div>

                    <span className="text-xs font-bold text-amber-300">
                      ✓ متاح في مكتبتك الصوتية ونادي القراءة!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kitchen Quiz Section (سؤال الشيف) */}
        {selectedStory.quiz && selectedStory.quiz.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-black/40 border border-amber-400/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>سؤال الشيف الصغير: {selectedStory.quiz[0].question}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                +25 ⭐
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {selectedStory.quiz[0].options.map((option, idx) => {
                const isSelected = selectedQuizAnswer === idx;
                const isCorrect = idx === selectedStory.quiz[0].correctIndex;

                let btnStyle = 'bg-white/5 border-purple-700/50 text-white hover:bg-white/10';
                if (selectedQuizAnswer !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-black';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-700 border-rose-400 text-white';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={quizSolved}
                    className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${btnStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {quizSolved && (
              <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{selectedStory.quiz[0].explanation || 'إجابة صحيحة يا بطل الشيف!'}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
