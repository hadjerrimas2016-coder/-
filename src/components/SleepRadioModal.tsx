import React, { useState, useEffect, useRef } from 'react';
import { AppMode } from '../types';
import {
  Moon,
  X,
  Play,
  Pause,
  Timer,
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  SkipBack,
  SkipForward,
  ListMusic,
  Check,
  Headphones,
  Sliders,
  Video,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Film,
  Sparkle,
  Radio,
  Settings,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playSparkleSound, playPopSound, speakArabicSpeech, stopArabicSpeech } from '../utils/audio';
import { SLEEP_TRACKS, SleepTrack, SleepMediaType, sleepAudioEngine } from '../utils/sleepAudio';
import {
  auth,
  isOwnerAdmin,
  subscribeToSleepTracks,
  publishSleepTracksToFirestore
} from '../firebase';

interface SleepRadioModalProps {
  mode: AppMode;
  onClose: () => void;
}

const LOCAL_STORAGE_KEY = 'raed_sleep_radio_custom_tracks_v2';

const EMOJI_OPTIONS = ['🌙', '🌌', '✨', '🌊', '🌧️', '🪐', '🧸', '🕯️', '⛵', '☁️', '🌿', '🌠', '🛸', '🌲'];

const PRESET_SAMPLE_VIDEOS = [
  {
    name: 'سماء الفضاء وسدم النجوم الهادئة 🌌',
    url: '/assets/aistudio/video_z5xqdjk5_20261021184400_87b84f16.mp4',
    icon: '🌌',
  },
  {
    name: 'سماء الغيوم والنجوم المتلألئة 🌙',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-with-clouds-and-stars-41312-large.mp4',
    icon: '✨',
  },
  {
    name: 'أمواج شاطئ الليل الهادئ 🌊',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-at-sunset-4416-large.mp4',
    icon: '🌊',
  },
  {
    name: 'قطرات المطر على النافذة الليلية 🌧️',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-the-window-glass-41716-large.mp4',
    icon: '🌧️',
  },
];

export const SleepRadioModal: React.FC<SleepRadioModalProps> = ({ mode, onClose }) => {
  // Load saved tracks from localStorage first, falling back to default SLEEP_TRACKS
  const [tracks, setTracks] = useState<SleepTrack[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading local sleep tracks:', e);
    }
    return SLEEP_TRACKS;
  });

  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(30);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30 * 60);
  const [showTrackPicker, setShowTrackPicker] = useState<boolean>(false);
  const [showStudioManager, setShowStudioManager] = useState<boolean>(false);
  const [managerTab, setManagerTab] = useState<'add' | 'list'>('add');
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentProgressSec, setCurrentProgressSec] = useState<number>(0);
  const [enableVoiceStory, setEnableVoiceStory] = useState<boolean>(true);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Form State for Adding / Editing Media
  const [formMediaType, setFormMediaType] = useState<SleepMediaType>('video');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSubtitle, setFormSubtitle] = useState<string>('');
  const [formMediaUrl, setFormMediaUrl] = useState<string>('/assets/aistudio/video_z5xqdjk5_20261021184400_87b84f16.mp4');
  const [formIcon, setFormIcon] = useState<string>('🌌');
  const [formGenre, setFormGenre] = useState<string>('فيديو نوم هادئ');
  const [formDurationMin, setFormDurationMin] = useState<number>(30);
  const [formDescription, setFormDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Safe current track reference
  const currentTrack: SleepTrack = tracks[selectedTrackIndex] || tracks[0] || SLEEP_TRACKS[0];
  const isCurrentVideo = currentTrack.mediaType === 'video' || Boolean(currentTrack.videoUrl);

  // 1. Subscribe to Firestore cloud tracks (Realtime sync for owner updates)
  useEffect(() => {
    try {
      const unsub = subscribeToSleepTracks(
        (cloudTracks) => {
          if (Array.isArray(cloudTracks) && cloudTracks.length > 0) {
            setTracks(cloudTracks);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudTracks));
            } catch (err) {
              // ignore
            }
          }
        },
        (err) => {
          // If Firestore is offline or permissions issue, graceful local fallback
          console.warn('Firestore sleep tracks sync status: using local state.');
        }
      );
      return () => unsub();
    } catch {
      // ignore
    }
  }, []);

  // 2. Audio & Video Playback Synchronization
  useEffect(() => {
    if (isPlaying) {
      if (isCurrentVideo) {
        // Video mode: pause synth audio engine and let video take over, or keep low ambient pad
        sleepAudioEngine.stop();
        if (videoRef.current) {
          videoRef.current.currentTime = currentProgressSec;
          videoRef.current.play().catch(() => {});
          videoRef.current.volume = isMuted ? 0 : volume;
        }
      } else {
        // Audio mode: use sleep audio procedural engine or custom audio
        if (videoRef.current) {
          videoRef.current.pause();
        }
        sleepAudioEngine.playTrack(currentTrack.id, currentTrack.audioUrl);
        sleepAudioEngine.setVolume(isMuted ? 0 : volume);
      }

      if (enableVoiceStory) {
        speakArabicSpeech(
          `أهلاً بك في راديو نوم رائد.. استمع واستمتع بـ ${currentTrack.title}.. تنفس بهدوء واسترخِ في واحة الأحلام الساحرة.. أحلاماً هانئة وسعيدة.`
        );
      }
    } else {
      sleepAudioEngine.stop();
      if (videoRef.current) {
        videoRef.current.pause();
      }
      stopArabicSpeech();
    }

    return () => {
      sleepAudioEngine.stop();
      if (videoRef.current) {
        videoRef.current.pause();
      }
      stopArabicSpeech();
    };
  }, [selectedTrackIndex, isCurrentVideo]);

  // Volume synchronization
  useEffect(() => {
    sleepAudioEngine.setVolume(isMuted ? 0 : volume);
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Timer loop for progress & Sleep auto shutoff
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Advance progress
      setCurrentProgressSec((prev) => {
        if (prev >= currentTrack.durationSec) return 0;
        return prev + 1;
      });

      // Count down sleep timer
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          sleepAudioEngine.stop();
          if (videoRef.current) videoRef.current.pause();
          stopArabicSpeech();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.durationSec]);

  // Handle Play/Pause toggle
  const handleTogglePlay = () => {
    playClickSound();
    if (isPlaying) {
      setIsPlaying(false);
      sleepAudioEngine.stop();
      if (videoRef.current) videoRef.current.pause();
      stopArabicSpeech();
    } else {
      setIsPlaying(true);
      if (isCurrentVideo) {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      } else {
        sleepAudioEngine.playTrack(currentTrack.id, currentTrack.audioUrl);
        sleepAudioEngine.setVolume(isMuted ? 0 : volume);
      }

      if (enableVoiceStory) {
        speakArabicSpeech(
          `نواصل الاسترخاء مع ${currentTrack.title}.. هدوء وسكينة تامة.`
        );
      }
    }
  };

  // Next and Previous Track Handlers
  const handleNextTrack = () => {
    playClickSound();
    setSelectedTrackIndex((prev) => (prev + 1) % tracks.length);
    setCurrentProgressSec(0);
  };

  const handlePrevTrack = () => {
    playClickSound();
    setSelectedTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setCurrentProgressSec(0);
  };

  const handleSelectTrack = (idx: number) => {
    playSparkleSound();
    setSelectedTrackIndex(idx);
    setShowTrackPicker(false);
    setCurrentProgressSec(0);
    setIsPlaying(true);
  };

  const handleSetTimer = (mins: number) => {
    playClickSound();
    setSleepTimerMinutes(mins);
    setRemainingSeconds(mins * 60);
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fullscreen Video handler
  const handleToggleFullscreen = () => {
    playClickSound();
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsVideoFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsVideoFullscreen(false);
    }
  };

  // File Upload handler for custom video or audio
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setFormMediaUrl(fileUrl);
    setFormTitle(file.name.replace(/\.[^/.]+$/, ''));
    if (file.type.startsWith('video/')) {
      setFormMediaType('video');
      setFormGenre('فيديو محلي مخصص');
      setFormIcon('🎬');
    } else {
      setFormMediaType('audio');
      setFormGenre('صوت محلي مخصص');
      setFormIcon('🎵');
    }
    playPopSound();
  };

  // Instant Add / Publish Handler
  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('الرجاء كتابة عنوان للمقطع أو الفيديو');
      return;
    }

    setIsSubmitting(true);
    const newTrack: SleepTrack = {
      id: `custom-${Date.now()}`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim() || (formMediaType === 'video' ? 'فيديو مهدئ للنوم والاسترخاء' : 'موسيقى هادئة للأحلام السعيدة'),
      icon: formIcon,
      genre: formGenre.trim() || (formMediaType === 'video' ? 'فيديو نوم مريح' : 'ألحان نوم ناعمة'),
      durationSec: (formDurationMin || 25) * 60,
      description: formDescription.trim() || 'مقطع مهدئ يساعد الأطفال على الاسترخاء والنوم العميق بسلام وأمان.',
      gradient: formMediaType === 'video' ? 'from-purple-950 via-slate-900 to-black' : 'from-indigo-950 via-purple-950 to-slate-950',
      mediaType: formMediaType,
      videoUrl: formMediaType === 'video' ? formMediaUrl.trim() : undefined,
      audioUrl: formMediaType === 'audio' ? formMediaUrl.trim() : undefined,
      isCustom: true,
      createdAt: Date.now(),
    };

    const updatedTracks = [newTrack, ...tracks];
    setTracks(updatedTracks);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTracks));

    // Sync to Firestore for cloud persistence if owner
    try {
      await publishSleepTracksToFirestore(updatedTracks);
      setStatusMessage('تم النشر والحفظ السحابي بنجاح! ☁️✨');
    } catch {
      setStatusMessage('تم الحفظ الفوري محلياً في المتصفح! 💾✨');
    }

    confetti({ particleCount: 40, spread: 60 });
    playSparkleSound();
    setIsSubmitting(false);
    setSelectedTrackIndex(0);
    setCurrentProgressSec(0);
    setIsPlaying(true);
    setShowStudioManager(false);

    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Delete Track Handler
  const handleDeleteTrack = async (trackId: string) => {
    playClickSound();
    if (tracks.length <= 1) {
      alert('لا يمكنك حذف المقطع الوحيد المتبقي');
      return;
    }

    const updatedTracks = tracks.filter((t) => t.id !== trackId);
    setTracks(updatedTracks);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTracks));

    if (selectedTrackIndex >= updatedTracks.length) {
      setSelectedTrackIndex(0);
    }

    try {
      await publishSleepTracksToFirestore(updatedTracks);
    } catch {
      // ignore
    }
    playPopSound();
  };

  // Reset to Defaults Handler
  const handleResetDefaults = async () => {
    if (!window.confirm('هل تريد استعادة جميع مقاطع وموسيقى وفيديوهات النوم الافتراضية؟')) return;
    playClickSound();
    setTracks(SLEEP_TRACKS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SLEEP_TRACKS));
    setSelectedTrackIndex(0);
    try {
      await publishSleepTracksToFirestore(SLEEP_TRACKS);
    } catch {
      // ignore
    }
    playSparkleSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-2xl bg-black/90 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-600/70 bg-gradient-to-b from-[#180f38] via-[#100a2b] to-[#080517] text-white my-auto p-4 sm:p-6 space-y-4">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-xl shadow">
              🌙
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
                  راديو رائد 📻
                </span>
                <span className="text-[11px] text-purple-300 font-bold">قبل النوم</span>
                {isCurrentVideo && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-bold flex items-center gap-1">
                    <Film className="w-2.5 h-2.5" />
                    فيديو
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                قصص هادئة وموسيقى وفيديوهات مريحة
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Owner Studio Toggle Button */}
            <button
              onClick={() => {
                playClickSound();
                setShowStudioManager(!showStudioManager);
                setShowTrackPicker(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                showStudioManager
                  ? 'bg-amber-400 text-amber-950 border-amber-300 scale-105'
                  : 'bg-purple-950/80 hover:bg-purple-900 text-amber-300 border-amber-400/40'
              }`}
              title="إدارة المقاطع وإضافة فيديو أو موسيقى جديدة فوراً"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إدارة المقاطع والفيديو 🎛️</span>
              <span className="sm:hidden">إدارة 🎛️</span>
            </button>

            {/* Track Picker Button */}
            <button
              onClick={() => {
                setShowTrackPicker(!showTrackPicker);
                setShowStudioManager(false);
              }}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                showTrackPicker
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                  : 'bg-white/10 hover:bg-white/20 text-purple-200 border-white/15'
              }`}
              title="اختر مقطع النوم"
            >
              <ListMusic className="w-4 h-4" />
              <span className="hidden md:inline">القائمة</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                playClickSound();
                sleepAudioEngine.stop();
                if (videoRef.current) videoRef.current.pause();
                stopArabicSpeech();
                onClose();
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification if any */}
        {statusMessage && (
          <div className="p-2.5 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-200 text-xs font-bold text-center animate-in fade-in">
            {statusMessage}
          </div>
        )}

        {/* 1. OWNER MANAGEMENT STUDIO DRAWER */}
        {showStudioManager ? (
          <div className="p-4 rounded-3xl bg-black/60 border border-amber-400/40 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[75vh] overflow-y-auto">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center text-sm font-black">
                  🎛️
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-amber-300">
                    استوديو إدارة موسيقى وفيديوهات راديو النوم
                  </h3>
                  <p className="text-[10px] text-purple-300">
                    أضف فيديوهات مهدئة (MP4) أو مقاطع موسيقية (MP3) فوراً في الموقع
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setManagerTab('add')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    managerTab === 'add'
                      ? 'bg-amber-400 text-amber-950 font-black'
                      : 'text-purple-200 hover:text-white'
                  }`}
                >
                  ➕ إضافة جديد
                </button>
                <button
                  type="button"
                  onClick={() => setManagerTab('list')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    managerTab === 'list'
                      ? 'bg-amber-400 text-amber-950 font-black'
                      : 'text-purple-200 hover:text-white'
                  }`}
                >
                  📋 المقاطع ({tracks.length})
                </button>
              </div>
            </div>

            {/* TAB 1: ADD NEW TRACK OR VIDEO */}
            {managerTab === 'add' ? (
              <form onSubmit={handleAddTrack} className="space-y-3.5">
                {/* Media Type Selector (Audio vs Video) */}
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1.5">
                    اختر نوع المقطع المراد إضافته:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormMediaType('video');
                        setFormIcon('🌌');
                        setFormGenre('فيديو نوم كوني هادئ');
                        setFormMediaUrl('/assets/aistudio/video_z5xqdjk5_20261021184400_87b84f16.mp4');
                      }}
                      className={`p-2.5 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formMediaType === 'video'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-cyan-400 shadow-md ring-2 ring-cyan-400/30'
                          : 'bg-white/5 border-white/10 text-purple-300 hover:bg-white/10'
                      }`}
                    >
                      <Film className="w-4 h-4 text-cyan-300" />
                      <span>🎬 فيديو مهدئ للنوم (Video / MP4)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormMediaType('audio');
                        setFormIcon('🎵');
                        setFormGenre('ألحان نوم ناعمة');
                        setFormMediaUrl('');
                      }}
                      className={`p-2.5 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formMediaType === 'audio'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-amber-400 shadow-md ring-2 ring-amber-400/30'
                          : 'bg-white/5 border-white/10 text-purple-300 hover:bg-white/10'
                      }`}
                    >
                      <Music className="w-4 h-4 text-amber-300" />
                      <span>🎵 مقطع صوتي (Audio / MP3)</span>
                    </button>
                  </div>
                </div>

                {/* Title and Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      عنوان المقطع أو الفيديو: *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سماء النجوم وأمواج الأحلام"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-600/50 text-white text-xs placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      الوصف المختصر أو النوع:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: مشهد مهدئ مع أصوات الطبيعة"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-600/50 text-white text-xs placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Media URL / Source */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-purple-200">
                      {formMediaType === 'video' ? 'رابط الفيديو (MP4 / WebM):' : 'رابط الملف الصوتي (MP3 أو اختياري):'}
                    </label>
                    <label className="text-[10px] text-amber-300 hover:underline cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>أو رفع ملف من جهازك</span>
                      <input
                        type="file"
                        accept={formMediaType === 'video' ? 'video/mp4,video/webm' : 'audio/mp3,audio/wav,audio/*'}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    placeholder={
                      formMediaType === 'video'
                        ? 'أدخل رابط فيديو MP4 (مثلاً: /assets/aistudio/video_z5xqdjk5_20261021184400_87b84f16.mp4)'
                        : 'اتركه فارغاً للتوليد النغمي السحري، أو أدخل رابط MP3'
                    }
                    value={formMediaUrl}
                    onChange={(e) => setFormMediaUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-600/50 text-white text-xs placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 font-mono"
                  />

                  {/* Preset 1-Click Samples for Video */}
                  {formMediaType === 'video' && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-purple-300 block">نماذج وفيديوهات استرخاء جاهزة بنقرة واحدة:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PRESET_SAMPLE_VIDEOS.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => {
                              playPopSound();
                              setFormMediaUrl(preset.url);
                              setFormTitle(preset.name);
                              setFormIcon(preset.icon);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-900/60 border border-purple-500/30 text-[10px] text-purple-200 hover:text-white truncate text-right flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>{preset.icon}</span>
                            <span className="truncate">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Duration & Emoji Icon Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      المدة التقديرية بالدقائق:
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={formDurationMin}
                      onChange={(e) => setFormDurationMin(parseInt(e.target.value, 10) || 30)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-600/50 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      الأيقونة التعبيرية:
                    </label>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setFormIcon(em)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                            formIcon === em ? 'bg-amber-400 scale-110 shadow' : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>نشر وحفظ في راديو النوم فوراً 🚀</span>
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: MANAGE & DELETE EXISTING TRACKS */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300 pb-1">
                  <span>جميع المقاطع النشطة ({tracks.length})</span>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    استعادة الافتراضيات
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
                  {tracks.map((track, idx) => {
                    const isVideo = track.mediaType === 'video' || Boolean(track.videoUrl);
                    return (
                      <div
                        key={track.id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-8 h-8 rounded-lg bg-purple-950 flex items-center justify-center text-base flex-shrink-0">
                            {track.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                              {isVideo && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[9px] font-bold">
                                  فيديو
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-purple-300/80 truncate">{track.genre}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTrackIndex(idx);
                              setShowStudioManager(false);
                              setIsPlaying(true);
                              playClickSound();
                            }}
                            className="px-2 py-1 rounded-lg bg-purple-600/60 hover:bg-purple-600 text-[10px] font-bold text-white cursor-pointer"
                          >
                            تشغيل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTrack(track.id)}
                            className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors cursor-pointer"
                            title="حذف هذا المقطع"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : showTrackPicker ? (
          /* 2. TRACK PICKER LIST DRAWER */
          <div className="p-4 rounded-3xl bg-black/50 border border-purple-500/40 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-amber-400" />
                <span>اختر ألحان أو فيديوهات النوم المفضلة:</span>
              </span>
              <span className="text-[10px] text-purple-300">{tracks.length} مقاطع مريحة</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
              {tracks.map((track, idx) => {
                const isSelected = selectedTrackIndex === idx;
                const isVideo = track.mediaType === 'video' || Boolean(track.videoUrl);
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-700/60 to-indigo-700/60 border-amber-400 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center text-lg flex-shrink-0">
                        {track.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-white truncate">
                            {track.title}
                          </h4>
                          {isVideo && (
                            <span className="px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[9px] font-bold border border-cyan-400/30 flex items-center gap-0.5">
                              <Film className="w-2.5 h-2.5" />
                              فيديو
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-purple-300/80 truncate">{track.genre}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSelected ? (
                        <span className="p-1.5 rounded-full bg-amber-400 text-amber-950">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-2 py-1 rounded-lg bg-white/10 text-[10px] font-bold text-amber-300 hover:bg-white/20"
                        >
                          تشغيل
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 3. MAIN PLAYER DISPLAY: VIDEO MODE OR AUDIO MODE */
          <div className="space-y-4">
            {isCurrentVideo ? (
              /* A. RELAXING SLEEP VIDEO PLAYER */
              <div
                ref={videoContainerRef}
                className="relative w-full rounded-2xl overflow-hidden border-2 border-purple-500/60 shadow-[0_0_40px_rgba(168,85,247,0.35)] bg-black group"
              >
                <video
                  ref={videoRef}
                  src={currentTrack.videoUrl}
                  autoPlay={isPlaying}
                  loop
                  playsInline
                  muted={isMuted}
                  className="w-full h-52 sm:h-64 object-cover filter brightness-90"
                />

                {/* Subtle vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Video Info Overlay */}
                <div className="absolute top-2.5 right-3 flex items-center gap-2 pointer-events-auto">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[10px] font-bold flex items-center gap-1 shadow">
                    <Film className="w-3 h-3 text-cyan-400" />
                    <span>فيديو نوم استرخائي</span>
                  </span>
                </div>

                {/* Fullscreen Button */}
                <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={handleToggleFullscreen}
                    className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/80 border border-white/20 transition-all cursor-pointer shadow"
                    title={isVideoFullscreen ? 'تصغير' : 'ملء الشاشة'}
                  >
                    {isVideoFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Starry Ambient Sparkles in Corner */}
                <div className="absolute bottom-2 left-3 text-sm text-amber-300 animate-pulse pointer-events-none">
                  ✨
                </div>

                {/* Bottom track title on video */}
                <div className="absolute bottom-2 right-3 pointer-events-none max-w-[80%]">
                  <h3 className="text-xs sm:text-sm font-black text-white drop-shadow truncate">
                    {currentTrack.icon} {currentTrack.title}
                  </h3>
                  <p className="text-[10px] text-purple-200/90 drop-shadow truncate">
                    {currentTrack.subtitle}
                  </p>
                </div>
              </div>
            ) : (
              /* B. STARRY CIRCULAR ARTWORK FOR AUDIO MODE */
              <div className="relative flex flex-col items-center justify-center py-1">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-2 bg-gradient-to-b from-indigo-500/30 via-purple-600/20 to-black/60 border-2 border-purple-400/50 shadow-[0_0_50px_rgba(168,85,247,0.35)] flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png"
                    alt="نوم هادئ"
                    className="w-full h-full object-cover rounded-full opacity-85 filter brightness-95"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#100a2b] via-transparent to-transparent opacity-80" />

                  {/* Glowing Crescent Moon */}
                  <div className="absolute top-2 right-4 text-3xl animate-pulse">
                    🌙
                  </div>
                  <div className="absolute top-6 left-6 text-xl text-amber-300 animate-bounce">
                    ✨
                  </div>

                  {/* Sound wave ripple indicator */}
                  {isPlaying && (
                    <div
                      className="absolute inset-0 rounded-full border-2 border-amber-300/30 animate-ping pointer-events-none"
                      style={{ animationDuration: '3s' }}
                    />
                  )}
                </div>

                {/* Current Track Info */}
                <div className="text-center mt-2.5 space-y-1">
                  <span className="px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-amber-300 text-[11px] font-black inline-flex items-center gap-1.5 shadow">
                    <span>{currentTrack.icon}</span>
                    <span>{currentTrack.title}</span>
                  </span>
                  <p className="text-[11px] text-purple-200/80 max-w-xs mx-auto leading-relaxed">
                    {currentTrack.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* Scrub Slider (Matching 05:32 / 20:00 format) */}
            <div className="space-y-1 px-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-purple-300">
                <span className="font-bold text-amber-300">{formatTime(currentProgressSec)}</span>
                <span>{formatTime(currentTrack.durationSec)}</span>
              </div>

              <div className="relative w-full">
                <input
                  type="range"
                  min={0}
                  max={currentTrack.durationSec}
                  value={currentProgressSec}
                  onChange={(e) => {
                    const newSec = parseInt(e.target.value, 10);
                    setCurrentProgressSec(newSec);
                    if (videoRef.current) {
                      videoRef.current.currentTime = newSec;
                    }
                  }}
                  className="w-full h-2 rounded-full appearance-none bg-purple-950 border border-purple-700/50 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Playback Controls (Previous / Play / Next) */}
            <div className="flex items-center justify-center gap-6 pt-0.5">
              <button
                onClick={handlePrevTrack}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 flex items-center justify-center transition-all cursor-pointer border border-white/10"
                title="المقطوعة السابقة"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9c27b0] via-[#673ab7] to-[#e91e63] text-white flex items-center justify-center shadow-xl shadow-purple-900/70 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/30"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current translate-x-[-2px]" />
                )}
              </button>

              <button
                onClick={handleNextTrack}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 flex items-center justify-center transition-all cursor-pointer border border-white/10"
                title="المقطوعة التالية"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* Auto-off Timer Presets (15 د، 30 د، 45 د، 60 د) */}
        <div className="p-3 rounded-2xl bg-white/5 border border-purple-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-200">
            <span className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>مؤقت الإغلاق التلقائي:</span>
            </span>
            <span className="text-amber-300 font-mono text-[11px]">
              {isPlaying && remainingSeconds > 0
                ? `ينطفئ بعد: ${formatTime(remainingSeconds)}`
                : `${sleepTimerMinutes} دقيقة`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSetTimer(mins)}
                className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                  sleepTimerMinutes === mins
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md'
                    : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/15'
                }`}
              >
                {mins} د
              </button>
            ))}
          </div>
        </div>

        {/* Volume & Bedtime Story Voice Toggle */}
        <div className="flex items-center justify-between gap-3 text-xs pt-1 border-t border-white/10">
          <div className="flex items-center gap-2 flex-grow max-w-xs">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-300" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVol = parseFloat(e.target.value);
                setVolume(newVol);
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1.5 rounded-full appearance-none bg-purple-950 accent-amber-400 cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              playClickSound();
              const nextState = !enableVoiceStory;
              setEnableVoiceStory(nextState);
              if (!nextState) stopArabicSpeech();
            }}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              enableVoiceStory
                ? 'bg-amber-400 text-amber-950 border-amber-300 font-black'
                : 'bg-white/5 text-purple-300 border-white/10'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>حكاية صوتية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
