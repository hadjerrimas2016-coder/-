import React, { useState, useRef, useEffect } from 'react';
import { Story, AppMode, ActiveTab, PictureBook, HeroVideoSettings, DEFAULT_HERO_VIDEO } from '../types';
import { ShahrazadSection } from './ShahrazadSection';
import { PictureBookBanner } from './PictureBookBanner';
import { StarsRewardBanner } from './StarsRewardBanner';
import {
  Sparkles,
  BookOpen,
  ChevronLeft,
  Star,
  Play,
  Pause,
  Search,
  Target,
  Rocket,
  Mic,
  Moon,
  PenTool,
  Brain,
  Clock,
  Bookmark,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Video,
  Film,
  Heart,
  Smile,
  Flame,
  CheckCircle2,
  Globe,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playSparkleSound, playPopSound, playFanfareSound } from '../utils/audio';

interface HomeHeroProps {
  mode: AppMode;
  stories: Story[];
  pictureBook: PictureBook;
  heroVideoSettings?: HeroVideoSettings;
  starsCount?: number;
  onOpenStory: (story: Story) => void;
  onOpenPictureBook: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenSpaceGame: () => void;
  onOpenChallengesMap: () => void;
  onOpenSleepRadio: () => void;
  onOpenMemorizeHelper: () => void;
  onOpenStoryAuthoring: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  mode,
  stories,
  pictureBook,
  heroVideoSettings,
  starsCount = 350,
  onOpenStory,
  onOpenPictureBook,
  onSelectTab,
  favorites,
  onToggleFavorite,
  onOpenSpaceGame,
  onOpenChallengesMap,
  onOpenSleepRadio,
  onOpenMemorizeHelper,
  onOpenStoryAuthoring,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [heroMode, setHeroMode] = useState<'video' | 'story'>('video');
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const [reactionHearts, setReactionHearts] = useState(128);
  const [hasLiked, setHasLiked] = useState(false);
  const [activeReactionToast, setActiveReactionToast] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Settings for the top hero video (prop, localStorage, or default)
  const [settings, setSettings] = useState<HeroVideoSettings>(() => {
    if (heroVideoSettings) return heroVideoSettings;
    try {
      const saved = localStorage.getItem('raed_hero_video_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_HERO_VIDEO;
  });

  useEffect(() => {
    if (heroVideoSettings) {
      setSettings(heroVideoSettings);
    }
  }, [heroVideoSettings]);

  // Primary banner story: Mars Journey
  const marsStory = stories.find((s) => s.id === 'raed-mars') || stories[0];

  // In-progress stories matching Screenshot 3
  const inProgressStories = stories.slice(0, 3);

  const handleOpenById = (id: string) => {
    const found = stories.find((s) => s.id === id);
    if (found) {
      onOpenStory(found);
    }
  };

  // Video control handlers
  const handleTogglePlay = () => {
    playClickSound();
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
      setVideoPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setVideoPlaying(true);
    }
  };

  const handleToggleMute = () => {
    playPopSound();
    if (!videoRef.current) return;
    const nextMuted = !videoMuted;
    videoRef.current.muted = nextMuted;
    setVideoMuted(nextMuted);
    if (!nextMuted && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setVideoPlaying(true);
    }
  };

  const handleRestartVideo = () => {
    playSparkleSound();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setVideoPlaying(true);
  };

  const handleFullscreen = () => {
    playClickSound();
    if (videoContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoContainerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const triggerReaction = (type: 'heart' | 'fox' | 'castle') => {
    if (type === 'heart') {
      playFanfareSound();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setReactionHearts((prev) => prev + 1);
      setHasLiked(true);
      setActiveReactionToast('✨ رائع! شكراً على حبك لرائد وثعلبه 💖');
    } else if (type === 'fox') {
      playPopSound();
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
      setActiveReactionToast('🦊 وااو! الثعلب اللطيف يحييك بحرارة! 🐾');
    } else {
      playSparkleSound();
      setActiveReactionToast('🏰 مرحباً بك في قلعة الأبطال الساحرة! ✨');
    }
    setTimeout(() => setActiveReactionToast(''), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-7">
      {/* Search Bar (Matching Screenshot 1 & 3) */}
      <div className="relative w-full max-w-4xl mx-auto">
        <Search className="w-5 h-5 absolute right-4 top-3.5 text-purple-300 pointer-events-none" />
        <input
          type="text"
          placeholder="ابحث عن قصة، كوكب، حيوان أو قيمة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSelectTab('library');
            }
          }}
          className={`w-full py-3 pr-12 pl-4 rounded-full text-xs sm:text-sm border shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            mode === 'day'
              ? 'bg-white/90 border-sky-200 text-slate-800 placeholder-slate-400'
              : 'bg-[#18113c]/80 border-purple-800/80 text-white placeholder-purple-300/60'
          }`}
        />
      </div>

      {/* Dynamic Top Switcher: Video Cinema vs Story Banner */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="inline-flex items-center p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
          <button
            onClick={() => {
              playClickSound();
              setHeroMode('video');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              heroMode === 'video'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow-md scale-105'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>سينما رائد (فيديو متحرك)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setHeroMode('story');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              heroMode === 'story'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-105'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Rocket className="w-4 h-4 text-amber-300" />
            <span>مغامرة المريخ (قصة اليوم)</span>
          </button>
        </div>

        {/* Live Active Badge */}
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>منصة رائد للأطفال • بدون ملل أثناء الانتظار 🌟</span>
        </div>
      </div>

      {/* HERO SECTION 1: ANIMATED VIDEO CINEMA (Vibrant & Anti-Boring) */}
      {heroMode === 'video' && (
        <div
          className={`relative rounded-3xl overflow-hidden border shadow-2xl p-4 sm:p-7 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 transition-all ${
            mode === 'day'
              ? 'bg-gradient-to-br from-indigo-100 via-sky-100 to-amber-50 border-white/80 shadow-indigo-200/60'
              : 'bg-gradient-to-br from-[#120a2e] via-[#1b1046] to-[#251559] border-purple-700/60 shadow-purple-950/90'
          }`}
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Left Video Player Cinema Card */}
          <div className="relative flex-shrink-0 z-10 w-full lg:w-[460px] xl:w-[500px]">
            <div
              ref={videoContainerRef}
              className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden border-2 border-amber-300/80 shadow-[0_0_35px_rgba(245,158,11,0.3)] group bg-black"
            >
              {/* HTML5 Animated Video */}
              <video
                ref={videoRef}
                src={settings.videoUrl || '/assets/aistudio/video_z5xqdjk5_20261021184400_87b84f16.mp4'}
                autoPlay={settings.autoPlay}
                loop={settings.loop}
                muted={videoMuted}
                playsInline
                className="w-full h-full object-cover rounded-3xl transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Floating Top Castle Badge */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-300/40 text-amber-300 text-xs font-black shadow-lg">
                <span className="animate-spin" style={{ animationDuration: '10s' }}>🏰</span>
                <span>رائد والقلعة الساحرة</span>
              </div>

              {/* Top Left Live Indicator */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/80 backdrop-blur-md text-white text-[11px] font-extrabold shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>فيديو متحرك</span>
              </div>

              {/* Play / Pause Central Overlay (Shown when paused) */}
              {!videoPlaying && (
                <div
                  onClick={handleTogglePlay}
                  className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform">
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  </div>
                </div>
              )}

              {/* Kid-Friendly Player Controls Bar Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2">
                  {/* Play/Pause Button */}
                  <button
                    onClick={handleTogglePlay}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90 cursor-pointer"
                    title={videoPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  >
                    {videoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  {/* Sound Unmute / Mute Button */}
                  <button
                    onClick={handleToggleMute}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow ${
                      videoMuted
                        ? 'bg-rose-600/90 hover:bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black'
                    }`}
                    title={videoMuted ? 'تفعيل صوت الفيديو' : 'كتم صوت الفيديو'}
                  >
                    {videoMuted ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>تشغيل الصوت 🔊</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>الصوت يعمل 🎵</span>
                      </>
                    )}
                  </button>

                  {/* Restart from beginning */}
                  <button
                    onClick={handleRestartVideo}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90 cursor-pointer"
                    title="إعادة تشغيل الفيديو من البداية"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Fullscreen Button */}
                  <button
                    onClick={handleFullscreen}
                    className="p-2 rounded-xl bg-amber-400/90 hover:bg-amber-400 text-amber-950 font-black transition-all active:scale-90 cursor-pointer shadow"
                    title="عرض بملء الشاشة (شاشة السينما)"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Reaction Toast */}
            {activeReactionToast && (
              <div className="absolute -bottom-8 inset-x-4 py-1.5 px-3 rounded-full bg-amber-400 text-amber-950 text-xs font-black text-center shadow-xl border border-amber-200 animate-in fade-in zoom-in-90 duration-200 z-30">
                {activeReactionToast}
              </div>
            )}
          </div>

          {/* Right Info, Animated Copy, and Interactive Actions */}
          <div className="space-y-4 max-w-2xl text-center lg:text-right z-10 flex-grow">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400/25 to-yellow-400/20 border border-amber-300/40 text-amber-300 font-extrabold text-xs shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{settings.badge || 'سينما رائد التفاعلية ✨'}</span>
            </div>

            <h1
              className={`text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight ${
                mode === 'day' ? 'text-indigo-950' : 'text-white'
              }`}
            >
              {settings.title || 'مرحبًا بكم في عالم رائد السحري'}
            </h1>

            <p
              className={`text-xs sm:text-sm font-medium leading-relaxed ${
                mode === 'day' ? 'text-indigo-900/80' : 'text-purple-200/90'
              }`}
            >
              {settings.subtitle || 'شاهد رائد وثعلبه الأليف في عرض سينمائي ممتع بانتظار رحلتك القادمة كي لا تشعر بأي ملل! استمتع بالحركة والألوان ثم اختر وجهتك المفضلة.'}
            </p>

            {/* Interactive Kid Reaction Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="text-xs font-extrabold text-purple-300 ml-1">تفاعل مع رائد:</span>

              <button
                onClick={() => triggerReaction('heart')}
                className={`px-3 py-1.5 rounded-full border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  hasLiked
                    ? 'bg-rose-500 text-white border-rose-300 shadow-md scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-rose-300 border-rose-400/40'
                }`}
                title="أعجبني الفيديو"
              >
                <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{reactionHearts}</span>
                <span>💖</span>
              </button>

              <button
                onClick={() => triggerReaction('fox')}
                className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-black flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                title="حيِّ الثعلب اللطيف"
              >
                <span>🦊 حيِّي الثعلب</span>
              </button>

              <button
                onClick={() => triggerReaction('castle')}
                className="px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 text-xs font-black flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                title="سر القلعة السحرية"
              >
                <span>🏰 سر القلعة</span>
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              {/* Start Adventure button */}
              <button
                onClick={() => {
                  playClickSound();
                  onOpenStory(marsStory);
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>ابدأ رحلة المريخ</span>
                <Play className="w-4 h-4 fill-current" />
              </button>

              {/* Sunnah Corner Button */}
              <button
                onClick={() => {
                  playSparkleSound();
                  onSelectTab('sunnah');
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/40"
              >
                <span>🕌</span>
                <span>ركن السُنّة النبوية</span>
              </button>

              {/* Space 3D Game button */}
              <button
                onClick={() => {
                  playSparkleSound();
                  onOpenSpaceGame();
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4 text-yellow-300" />
                <span>لعبة الفضاء 3D</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION 2: CLASSIC MARS STORY BANNER (Matching Screenshot 1) */}
      {heroMode === 'story' && (
        <div
          className={`relative rounded-3xl overflow-hidden border shadow-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all ${
            mode === 'day'
              ? 'bg-gradient-to-r from-indigo-200 via-sky-200 to-amber-100 border-white/60 shadow-indigo-200/50'
              : 'bg-gradient-to-r from-[#17103a] via-[#1c1247] to-[#251558] border-purple-700/60 shadow-purple-950/90'
          }`}
        >
          {/* Left Character Artwork Card with 50+ points tag (Matching Screenshot 1) */}
          <div className="relative flex-shrink-0 z-10 order-2 lg:order-1">
            <div className="relative w-64 h-56 sm:w-72 sm:h-64 rounded-3xl overflow-hidden border-2 border-amber-300/60 shadow-2xl">
              <img
                src="/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png"
                alt="رحلة رائد إلى المريخ"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* 50+ Fantasy Points Badge */}
            <div className="absolute -bottom-3 inset-x-8 py-1 px-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-xs text-center shadow-lg border border-amber-200 flex items-center justify-center gap-1">
              <span>50+ نقطة خيال</span>
              <span>⭐</span>
            </div>
          </div>

          {/* Right Info & Actions (Matching Screenshot 1) */}
          <div className="space-y-4 max-w-2xl text-center lg:text-right z-10 order-1 lg:order-2 flex-grow">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-extrabold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>مغامرة اليوم المميزة</span>
            </div>

            <h1
              className={`text-2xl sm:text-4xl lg:text-5xl font-black leading-tight ${
                mode === 'day' ? 'text-indigo-950' : 'text-white'
              }`}
            >
              رحلة رائد إلى المريخ: سر الكوكب الأحمر
            </h1>

            <p
              className={`text-xs sm:text-sm font-medium leading-relaxed ${
                mode === 'day' ? 'text-indigo-900/80' : 'text-purple-200/90'
              }`}
            >
              انطلق مع رائد وثعلبه اللطيف في رحلة عبر النجوم وحلقات الكواكب لاكتشاف أسرار المريخ الساحرة!
            </p>

            {/* 3 Action Buttons (Matching Screenshot 1) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  playClickSound();
                  onOpenStory(marsStory);
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>ابدأ المغامرة</span>
                <Play className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={() => {
                  playSparkleSound();
                  onOpenChallengesMap();
                }}
                className="px-5 py-3 rounded-2xl bg-purple-900/60 hover:bg-purple-900 border border-purple-500/60 text-purple-200 font-extrabold text-xs sm:text-sm shadow flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Target className="w-4 h-4 text-purple-300" />
                <span>خريطة التحديات</span>
              </button>

              <button
                onClick={() => {
                  playSparkleSound();
                  onOpenSpaceGame();
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4 text-yellow-300" />
                <span>لعبة الفضاء 3D</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stars Reward System Banner */}
      <StarsRewardBanner
        starsCount={starsCount || 350}
        mode={mode}
        onOpenReadingClub={() => onSelectTab('reading_club')}
      />

      {/* Picture Book Banner (كتاب مصور تفاعلي بالصفحات والصوت - Matching Screenshot 1) */}
      <PictureBookBanner
        book={pictureBook}
        mode={mode}
        onOpenBook={onOpenPictureBook}
      />

      {/* Primary Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card: نادي القراءة والمكتبات الصوتية (Purple) */}
        <div
          onClick={() => {
            playSparkleSound();
            onSelectTab('reading_club');
          }}
          className="group rounded-3xl p-4 border border-purple-500/60 bg-gradient-to-tr from-[#240c3d] to-[#36135c] text-white shadow-xl cursor-pointer transition-all hover:-translate-y-1 hover:border-pink-400 flex items-center justify-between ring-1 ring-purple-400/30"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold">
              <span>ملتقى عام</span>
              <span>🎙️</span>
            </div>
            <h3 className="font-black text-sm sm:text-base text-pink-300">نادي القراءة</h3>
            <p className="text-[11px] text-purple-200/80">مكتبات صوتية وقصص مشتركة 📚</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-inner">
            <Users className="w-5 h-5 text-pink-400" />
          </div>
        </div>

        {/* Card: قصص باللغات الأجنبية (Emerald) */}
        <div
          onClick={() => {
            playSparkleSound();
            onSelectTab('foreign_languages');
          }}
          className="group rounded-3xl p-4 border border-emerald-500/60 bg-gradient-to-tr from-[#092b21] to-[#124234] text-white shadow-xl cursor-pointer transition-all hover:-translate-y-1 hover:border-emerald-300 flex items-center justify-between ring-1 ring-emerald-400/30"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold">
              <span>English & Français</span>
              <span>🌍</span>
            </div>
            <h3 className="font-black text-sm sm:text-base text-emerald-300">قصص باللغات</h3>
            <p className="text-[11px] text-emerald-100/70">تعلّم النطق والكلمات الذكية 🎧</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-inner">
            <Globe className="w-5 h-5 text-emerald-300" />
          </div>
        </div>
        {/* Card Sunnah: ركن السُنّة (Emerald) */}
        <div
          onClick={() => {
            playSparkleSound();
            onSelectTab('sunnah');
          }}
          className="group rounded-3xl p-4 border border-emerald-500/50 bg-gradient-to-tr from-[#082419] to-[#103a28] text-white shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:border-emerald-300 flex items-center justify-between ring-1 ring-emerald-400/30"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold">
              <span>جديد</span>
              <span>🕌</span>
            </div>
            <h3 className="font-black text-sm sm:text-base text-emerald-300">ركن السُنّة</h3>
            <p className="text-[11px] text-emerald-100/70">سور قصيرة وأدعية 🤲</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-inner">
            <span>🕌</span>
          </div>
        </div>

        {/* Card 1: ساعدني على الحفظ (Teal) */}
        <div
          onClick={() => {
            playSparkleSound();
            onOpenMemorizeHelper();
          }}
          className="group rounded-3xl p-4 border border-teal-500/40 bg-gradient-to-tr from-[#0a2626] to-[#0f3837] text-white shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:border-teal-400 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="font-black text-sm sm:text-base text-teal-300">ساعدني على الحفظ</h3>
            <p className="text-[11px] text-teal-200/70">المصحح التلقائي ✨</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: راديو النوم (Indigo) */}
        <div
          onClick={() => {
            playSparkleSound();
            onOpenSleepRadio();
          }}
          className="group rounded-3xl p-4 border border-purple-600/50 bg-gradient-to-tr from-[#1b1240] to-[#251559] text-white shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:border-purple-400 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="font-black text-sm sm:text-base text-purple-300">راديو النوم</h3>
            <p className="text-[11px] text-purple-200/70">قصص هادئة ومؤقت 🌙</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-yellow-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <Moon className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: تأليف قصة ورسم (Amber) */}
        <div
          onClick={() => {
            playSparkleSound();
            onOpenStoryAuthoring();
          }}
          className="group rounded-3xl p-4 border border-amber-600/50 bg-gradient-to-tr from-[#2a170d] to-[#3a2012] text-white shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:border-amber-400 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="font-black text-sm sm:text-base text-amber-400">تأليف قصة ورسم</h3>
            <p className="text-[11px] text-amber-200/70">ابتكر مغامرتك الخاصة ✍️</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <PenTool className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: اختبر معلوماتك (Magenta) */}
        <div
          onClick={() => {
            playSparkleSound();
            onSelectTab('games');
          }}
          className="group rounded-3xl p-4 border border-pink-700/50 bg-gradient-to-tr from-[#2d0e2e] to-[#421443] text-white shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:border-pink-500 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="font-black text-sm sm:text-base text-pink-300">اختبر معلوماتك</h3>
            <p className="text-[11px] text-pink-200/70">ألعاب وألغاز ذكية 🎖️</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <Brain className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Section: عالم شهرزاد وقصص ألف ليلة وليلة (Matching Screenshot 7) */}
      <ShahrazadSection mode={mode} onOpenStoryById={handleOpenById} />

      {/* Section: مستمرون في القراءة 🕒 - أكمل من حيث توقفت (Matching Screenshot 3) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">🕒</span>
            <h3 className={`text-lg sm:text-xl font-black ${mode === 'day' ? 'text-indigo-950' : 'text-white'}`}>
              مستمرون في القراءة
            </h3>
            <span className="text-xs opacity-75 hidden sm:inline">- أكمل من حيث توقفت</span>
          </div>
        </div>

        {/* 3 In-Progress Cards (Matching Screenshot 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {inProgressStories.map((st) => (
            <div
              key={st.id}
              onClick={() => {
                playClickSound();
                onOpenStory(st);
              }}
              className={`p-3.5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-between gap-3 ${
                mode === 'day'
                  ? 'bg-white/90 border-sky-100 shadow-md'
                  : 'bg-[#18113c]/90 border-purple-800/60 shadow-lg shadow-purple-950/40'
              }`}
            >
              <div className="space-y-1 flex-grow">
                <h4 className="font-black text-xs sm:text-sm leading-snug line-clamp-1">{st.title}</h4>
                <div className="flex items-center gap-2 text-[10px] opacity-75 font-bold">
                  <span>{st.ageRange}</span>
                  <span>•</span>
                  <span>{st.duration} دقائق</span>
                </div>

                {/* Progress Bar (Matching Screenshot 3) */}
                <div className="w-full h-1.5 bg-purple-950/60 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                    style={{ width: `${st.progressPercent || 50}%` }}
                  />
                </div>
              </div>

              {/* Thumbnail with mini play icon */}
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/20">
                <img src={st.coverImage} alt={st.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: جميع القصص والمغامرات 📖 - متوفرة في المكتبة */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">📖</span>
            <h3 className={`text-lg sm:text-xl font-black ${mode === 'day' ? 'text-indigo-950' : 'text-white'}`}>
              جميع القصص والمغامرات
            </h3>
            <span className="text-xs opacity-75">({stories.length} قصص متوفرة)</span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onSelectTab('library');
            }}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>عرض الكل في المكتبة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stories.slice(0, 3).map((story) => (
            <div
              key={story.id}
              onClick={() => {
                playClickSound();
                onOpenStory(story);
              }}
              className={`rounded-3xl overflow-hidden border p-4 space-y-3.5 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between ${
                mode === 'day'
                  ? 'bg-white/95 border-sky-100 shadow-md hover:border-amber-300'
                  : 'bg-[#18113c]/95 border-purple-800/80 shadow-xl shadow-purple-950/60 hover:border-purple-500'
              }`}
            >
              {/* Artwork Banner with Badges (Matching Screenshot 3) */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900">
                <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />

                {/* Top Category Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-black/70 text-amber-300 border border-amber-300/30 backdrop-blur-md">
                    {story.categoryLabel}
                  </span>
                </div>

                {/* Bookmark Icon */}
                <div className="absolute top-2.5 left-2.5 p-1 rounded-full bg-black/60 text-amber-400 backdrop-blur">
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                </div>

                {/* Duration Tag with Speaker */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-900/80 text-white border border-purple-400/40 backdrop-blur flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-amber-300" />
                    <span>{story.duration}</span>
                  </span>
                </div>
              </div>

              {/* Story Details */}
              <div className="space-y-1.5 flex-grow">
                <h4 className="font-black text-base sm:text-lg leading-snug">{story.title}</h4>
                <p className="text-xs text-purple-200/80 leading-relaxed line-clamp-2">
                  {story.description}
                </p>
              </div>

              {/* Bottom Card Bar: "اقرأ واستمع ▷" & Age (Matching Screenshot 3) */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <button className="py-1.5 px-3.5 rounded-xl text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400 hover:text-amber-950 transition-all flex items-center gap-1">
                  <span>اقرأ واستمع</span>
                  <span>▷</span>
                </button>

                <span className="text-xs opacity-75 font-bold">
                  الفئة: {story.ageRange}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
