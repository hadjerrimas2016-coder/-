import React, { useState, useEffect, useRef } from 'react';
import { Story, AppMode, UserAudioRecording } from '../types';
import { backgroundAudio } from '../utils/backgroundAudio';
import { notifyStoryPlayback, notifyStoryCompleted } from '../utils/notifications';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  Heart,
  Trophy,
  Mic,
  Square,
  Trash2,
  Check,
  Image as ImageIcon,
  Upload,
  Music,
  Link2,
  FileAudio,
  Video,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playSparkleSound,
  playPopSound,
  playFanfareSound,
  playClickSound,
  playCorrectSound,
  playWrongSound,
  speakArabicSpeech,
  stopArabicSpeech,
  getSoundEnabled
} from '../utils/audio';
import { SHAHRAZAD_CHARACTERS } from '../data/storiesData';
import { ShahrazadCharacterAvatar } from './ShahrazadCharacterAvatar';
import { getStoryCover } from '../utils/customCovers';
import { StoryCoverPickerModal } from './StoryCoverPickerModal';

interface StoryModalProps {
  story: Story;
  mode: AppMode;
  onClose: () => void;
  onEarnStars: (amount: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSaveUserRecording?: (recording: UserAudioRecording) => void;
  isOwnerAdmin?: boolean;
  onUpdateStory?: (updatedStory: Story) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  story,
  mode,
  onClose,
  onEarnStars,
  isFavorite,
  onToggleFavorite,
  onSaveUserRecording,
  isOwnerAdmin,
  onUpdateStory,
}) => {
  const fallbackCover = '/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png';
  const [imgError, setImgError] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [totalDurationSec, setTotalDurationSec] = useState<number>(300);
  const [showReader, setShowReader] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [quizAnswered, setQuizAnswered] = useState<{ [qIdx: number]: number }>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [interactiveToast, setInteractiveToast] = useState<{ emoji: string; msg: string } | null>(null);

  // Audio source: props, localStorage, or default
  const [audioUrlState, setAudioUrlState] = useState<string>(() => {
    if (story.audioUrl) return story.audioUrl;
    try {
      const savedAudio = localStorage.getItem(`raed_story_audio_${story.id}`);
      if (savedAudio) return savedAudio;
    } catch {}
    return '';
  });
  const [showOwnerAudioUploader, setShowOwnerAudioUploader] = useState<boolean>(false);
  const [customAudioInput, setCustomAudioInput] = useState<string>('');
  const [audioSaveSuccess, setAudioSaveSuccess] = useState<string>('');

  // 16:9 Video source: props, localStorage, or default
  const [videoUrlState, setVideoUrlState] = useState<string>(() => {
    if (story.videoUrl) return story.videoUrl;
    try {
      const savedVideo = localStorage.getItem(`raed_story_video_${story.id}`);
      if (savedVideo) return savedVideo;
    } catch {}
    return '';
  });
  const [activeMediaMode, setActiveMediaMode] = useState<'reader' | 'video'>(() => {
    return story.videoUrl ? 'video' : 'reader';
  });
  const [showOwnerVideoUploader, setShowOwnerVideoUploader] = useState<boolean>(false);
  const [customVideoInput, setCustomVideoInput] = useState<string>('');
  const [videoSaveSuccess, setVideoSaveSuccess] = useState<string>('');

  const mainAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fantasy Companion for Shahrazad Stories
  const isShahrazadStory = story.category === 'shahrazad';
  const savedCharId =
    typeof window !== 'undefined'
      ? localStorage.getItem('raed_shahrazad_selected_character') || 'shahrazad'
      : 'shahrazad';
  const activeCompanion =
    SHAHRAZAD_CHARACTERS.find((c) => c.id === savedCharId) || SHAHRAZAD_CHARACTERS[0];

  // Story Cover customization state
  const [coverUrl, setCoverUrl] = useState<string>(() =>
    getStoryCover(story.id, story.coverImage)
  );
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState<boolean>(false);

  useEffect(() => {
    setCoverUrl(getStoryCover(story.id, story.coverImage));
    const handleCoverUpdate = (e: any) => {
      if (e.detail && e.detail.storyId === story.id) {
        setCoverUrl(e.detail.coverUrl || story.coverImage);
      }
    };
    window.addEventListener('raed_story_cover_updated', handleCoverUpdate);
    return () => {
      window.removeEventListener('raed_story_cover_updated', handleCoverUpdate);
    };
  }, [story.id, story.coverImage]);

  // Audio timer simulation fallback when no real audio file is loaded
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && (!audioUrlState || !mainAudioRef.current)) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return totalDurationSec;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalDurationSec, audioUrlState]);

  // User Microphone Recording states for this story
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [pageRecordings, setPageRecordings] = useState<{ [pageNumber: number]: string }>({});
  const [isPlayingChildAudio, setIsPlayingChildAudio] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const childAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up speech synthesis & recording on unmount
  useEffect(() => {
    return () => {
      stopArabicSpeech();
      if (childAudioPlayerRef.current) {
        childAudioPlayerRef.current.pause();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // When changing page, stop speaking and child playback
  useEffect(() => {
    stopArabicSpeech();
    setIsSpeaking(false);
    if (childAudioPlayerRef.current) {
      childAudioPlayerRef.current.pause();
      setIsPlayingChildAudio(false);
    }
  }, [currentPage]);

  const handleStartStoryRecording = async () => {
    playSparkleSound();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('المتصفح لا يدعم تسجيل الصوت أو يتطلب تشغيل HTTPS');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setPageRecordings((prev) => ({
          ...prev,
          [currentPage + 1]: audioUrl,
        }));

        if (onSaveUserRecording) {
          const rec: UserAudioRecording = {
            id: `rec-${Date.now()}`,
            title: `قراءة: صفحة ${currentPage + 1} (${story.title})`,
            storyTitle: story.title,
            pageNumber: currentPage + 1,
            createdAt: new Date().toLocaleDateString('ar-EG', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            durationSec: recordingSeconds > 0 ? recordingSeconds : 5,
            audioBlobUrl: audioUrl,
          };
          onSaveUserRecording(rec);
        }

        playFanfareSound();
        onEarnStars(30);
        confetti({ particleCount: 50, spread: 60 });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission or support issue:', err);
      alert('يرجى السماح بالوصول إلى الميكروفون لتسجيل قراءتك للقصة بصوتك!');
    }
  };

  const handleStopStoryRecording = () => {
    playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const handleDeleteStoryRecording = () => {
    playPopSound();
    if (childAudioPlayerRef.current) {
      childAudioPlayerRef.current.pause();
      setIsPlayingChildAudio(false);
    }
    setPageRecordings((prev) => {
      const copy = { ...prev };
      delete copy[currentPage + 1];
      return copy;
    });
  };

  const handleTogglePlayStoryChildAudio = () => {
    const audioUrl = pageRecordings[currentPage + 1];
    if (!audioUrl) return;

    if (!childAudioPlayerRef.current) {
      childAudioPlayerRef.current = new Audio(audioUrl);
      childAudioPlayerRef.current.onended = () => setIsPlayingChildAudio(false);
    } else {
      childAudioPlayerRef.current.src = audioUrl;
    }

    if (isPlayingChildAudio) {
      childAudioPlayerRef.current.pause();
      setIsPlayingChildAudio(false);
    } else {
      childAudioPlayerRef.current.play().catch(() => {});
      setIsPlayingChildAudio(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    playClickSound();
    if (!isPlaying) {
      if (audioUrlState && mainAudioRef.current) {
        mainAudioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Fallback to speech synthesis
          speakCurrentPage();
          setIsPlaying(true);
        });
      } else {
        speakCurrentPage();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(false);
      if (mainAudioRef.current) {
        mainAudioRef.current.pause();
      }
      stopArabicSpeech();
      setIsSpeaking(false);
    }
  };

  const handleSeek = (diff: number) => {
    playClickSound();
    const nextTime = Math.min(Math.max(0, currentTimeSec + diff), totalDurationSec);
    setCurrentTimeSec(nextTime);
    if (mainAudioRef.current) {
      mainAudioRef.current.currentTime = nextTime;
    }
  };

  const handleOwnerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      alert('يرجى اختيار ملف صوتي صالح (MP3, WAV, M4A, WebM)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAudioUrlState(dataUrl);
        setCustomAudioInput('');
        setAudioSaveSuccess('تم تحميل الملف الصوتي! اضغط "حفظ التسجيل للقصة" لاعتماده 🎵');
        playSparkleSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyAudioUrl = () => {
    const trimmed = customAudioInput.trim();
    if (!trimmed) return;
    setAudioUrlState(trimmed);
    setAudioSaveSuccess('تم تطبيق رابط الصوت! يمكنك معاينته ثم الضغط على حفظ 🎵');
    playClickSound();
  };

  const handleSaveStoryAudio = () => {
    if (!audioUrlState) return;
    playSparkleSound();
    confetti({ particleCount: 50, spread: 60 });
    try {
      localStorage.setItem(`raed_story_audio_${story.id}`, audioUrlState);
    } catch {}
    if (onUpdateStory) {
      onUpdateStory({
        ...story,
        audioUrl: audioUrlState,
      });
    }
    setAudioSaveSuccess('تم حفظ التسجيل الصوتي للقصة بنجاح في الموقع! 🌟');
    setTimeout(() => {
      setShowOwnerAudioUploader(false);
      setAudioSaveSuccess('');
    }, 2000);
  };

  const handleOwnerVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('يرجى اختيار ملف فيديو صالح (MP4, WebM, MOV)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setVideoUrlState(dataUrl);
        setCustomVideoInput('');
        setVideoSaveSuccess('تم تحميل الفيديو 16:9 بنجاح! اضغط "حفظ فيديو القصة 16:09" لاعتماده 🎬');
        playSparkleSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyVideoUrl = () => {
    const trimmed = customVideoInput.trim();
    if (!trimmed) return;
    setVideoUrlState(trimmed);
    setVideoSaveSuccess('تم تطبيق رابط الفيديو! يمكنك معاينته ثم الضغط على حفظ 🎬');
    playClickSound();
  };

  const handleSaveStoryVideo = () => {
    if (!videoUrlState) return;
    playSparkleSound();
    confetti({ particleCount: 60, spread: 70 });
    try {
      localStorage.setItem(`raed_story_video_${story.id}`, videoUrlState);
    } catch {}
    if (onUpdateStory) {
      onUpdateStory({
        ...story,
        videoUrl: videoUrlState,
      });
    }
    setVideoSaveSuccess('تم حفظ فيديو القصة بنجاح بقياس 16:09! 🎬🌟');
    setTimeout(() => {
      setShowOwnerVideoUploader(false);
      setVideoSaveSuccess('');
    }, 2000);
  };

  const speakCurrentPage = () => {
    const textToSpeak = story.pages[currentPage]?.text || story.description;
    setIsSpeaking(true);
    backgroundAudio.playAmbientCarrier({
      title: story.title,
      subtitle: 'الصفحة ' + (currentPage + 1) + ': ' + (story.pages[currentPage]?.text?.slice(0, 30) || story.subtitle),
      artworkUrl: coverUrl,
    });
    speakArabicSpeech(
      textToSpeak,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        if (currentPage === story.pages.length - 1) {
          notifyStoryCompleted(story.title, story.moralLesson);
        }
      },
      () => setIsSpeaking(false)
    );
  };

  const handleNextPage = () => {
    playClickSound();
    stopArabicSpeech();
    setIsSpeaking(false);
    if (currentPage < story.pages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    playClickSound();
    stopArabicSpeech();
    setIsSpeaking(false);
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleInteractiveClick = (elem: { emoji: string; sound: string; message: string }) => {
    if (elem.sound === 'sparkle') playSparkleSound();
    else if (elem.sound === 'pop') playPopSound();
    else playClickSound();

    setInteractiveToast({ emoji: elem.emoji, msg: elem.message });
    setTimeout(() => {
      setInteractiveToast(null);
    }, 2800);
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (quizAnswered[qIdx] !== undefined) return;
    const isCorrect = story.quiz[qIdx].correctIndex === optIdx;
    if (isCorrect) {
      playCorrectSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      playWrongSound();
    }
    const updated = { ...quizAnswered, [qIdx]: optIdx };
    setQuizAnswered(updated);

    // If all questions answered
    if (Object.keys(updated).length === story.quiz.length) {
      let correctTotal = 0;
      story.quiz.forEach((q, idx) => {
        if (updated[idx] === q.correctIndex) correctTotal++;
      });
      setQuizScore(correctTotal);
      if (correctTotal === story.quiz.length) {
        playFanfareSound();
        onEarnStars(10);
      } else {
        onEarnStars(5);
      }
    }
  };

  const progressPercent = (currentTimeSec / totalDurationSec) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/60 overflow-y-auto">
      <div
        className={`relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 my-auto ${
          mode === 'day'
            ? 'bg-gradient-to-b from-sky-100 via-white to-amber-50 border-sky-200 text-slate-800'
            : 'bg-gradient-to-b from-[#18123c] via-[#100d2b] to-[#0a071d] border-purple-800/80 text-white shadow-purple-900/50'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={() => {
              playClickSound();
              stopArabicSpeech();
              onClose();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur transition-all active:scale-90"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo badge in center */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30">
            <span className="text-sm font-extrabold text-amber-400">رائد</span>
            <span className="text-xs text-amber-300">⭐ قصص الأطفال</span>
          </div>

          {/* Favorite button */}
          <button
            onClick={() => {
              playSparkleSound();
              onToggleFavorite(story.id);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur transition-all active:scale-90 ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            aria-label="إضافة للمفضلة"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[80vh] overflow-y-auto no-scrollbar space-y-4">
          {/* Real HTML5 Story Audio Element */}
          <audio
            ref={mainAudioRef}
            src={audioUrlState || undefined}
            onTimeUpdate={() => {
              if (mainAudioRef.current) {
                setCurrentTimeSec(mainAudioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (mainAudioRef.current && !isNaN(mainAudioRef.current.duration) && mainAudioRef.current.duration > 0) {
                setTotalDurationSec(mainAudioRef.current.duration);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              notifyStoryCompleted(story.title, story.moralLesson);
              onEarnStars(20);
            }}
            onError={() => {
              console.warn('Story audio source not reachable, will fallback to Arabic speech synthesizer');
            }}
          />

          {/* Media Mode Switcher (If 16:9 Video exists) */}
          {videoUrlState && (
            <div className="flex items-center justify-center p-1 rounded-2xl bg-black/40 border border-purple-500/40 gap-1">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveMediaMode('reader');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMediaMode === 'reader'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>قراءة القصة المصورة 📖</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveMediaMode('video');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMediaMode === 'video'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow font-black'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>مشاهدة الفيديو 16:09 🎬</span>
              </button>
            </div>
          )}

          {/* 16:9 Widescreen Cinema Video Player OR Artwork Banner */}
          {activeMediaMode === 'video' && videoUrlState ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border-2 border-amber-400/80 shadow-2xl group flex items-center justify-center">
              <video
                src={videoUrlState}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur border border-amber-400/50 text-amber-300 text-xs font-black shadow flex items-center gap-1.5 pointer-events-none">
                <span>🎬</span>
                <span>فيديو سينمائي 16:09 عريض</span>
              </div>
            </div>
          ) : (
            /* Main Story Hero Artwork Banner */
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[16/10] bg-slate-900 border border-white/20 group">
              <img
                src={imgError ? fallbackCover : (coverUrl || fallbackCover)}
                alt={story.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Direct Cover Change Button - STRICTLY RESTRICTED TO OWNER */}
              {isOwnerAdmin && (
                <div className="absolute top-3 left-3 z-20">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsCoverPickerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-black bg-black/80 hover:bg-amber-500 text-amber-300 hover:text-white backdrop-blur-md border border-amber-400/80 shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer ring-2 ring-amber-400/40"
                    title="تخصيص واختيار غلاف القصة كمالكة للموقع 👑"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>تغيير الغلاف (المالكة) 👑</span>
                  </button>
                </div>
              )}

              {/* Story Title Overlay (Matching Attachment 1) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 text-lg">★</span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                        {story.title}
                      </h2>
                    </div>
                    <p className="text-sm text-yellow-200/90 font-medium">{story.subtitle}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600/80 text-white border border-purple-400/40">
                    {story.categoryLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* OWNER-ONLY EXCLUSIVE MEDIA STUDIO (فيديو 16:09 + تسجيل صوتي - خاص بمالكة الموقع hadjerrimas2016@gmail.com) */}
          {isOwnerAdmin && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-amber-900/70 border-2 border-amber-400 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/25 border border-amber-400/60 flex items-center justify-center text-amber-300">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1">
                      <span>لوحة نشر الوسائط للقصة (حصري لمالكة الموقع)</span>
                      <span>👑</span>
                    </h4>
                    <p className="text-[10px] text-amber-200/80">
                      إرفاق فيديو عريض 16:09 وتسجيل صوتي رسمي خاص بك كمالكة للمنصة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOwnerVideoUploader(!showOwnerVideoUploader);
                      setShowOwnerAudioUploader(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black shadow transition-all cursor-pointer ${
                      showOwnerVideoUploader
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400 hover:bg-amber-300 text-amber-950'
                    }`}
                  >
                    🎬 {showOwnerVideoUploader ? 'إغلاق الفيديو' : 'إرفاق فيديو 16:9'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOwnerAudioUploader(!showOwnerAudioUploader);
                      setShowOwnerVideoUploader(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black shadow transition-all cursor-pointer ${
                      showOwnerAudioUploader
                        ? 'bg-rose-500 text-white'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    🎙️ {showOwnerAudioUploader ? 'إغلاق الصوت' : 'إرفاق صوت'}
                  </button>
                </div>
              </div>

              {/* Status Notice */}
              {(videoSaveSuccess || audioSaveSuccess) && (
                <div className="p-2.5 rounded-xl bg-emerald-500/30 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{videoSaveSuccess || audioSaveSuccess}</span>
                </div>
              )}

              {/* SECTION A: OWNER 16:9 VIDEO UPLOADER */}
              {showOwnerVideoUploader && (
                <div className="pt-3 border-t border-amber-400/30 space-y-3 text-xs animate-in fade-in duration-200 bg-black/40 p-3 rounded-2xl border border-amber-400/20">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-300 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>إرفاق فيديو القصة بقياس 16:09 عريض:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                      16:9 Widescreen
                    </span>
                  </div>

                  {/* 1. File Upload from Owner's Device */}
                  <div>
                    <label className="block text-[11px] font-bold text-amber-200 mb-1">
                      1. رفع ملف فيديو من جهازك (MP4, WebM, MOV):
                    </label>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-900/40 hover:bg-amber-900/60 border border-dashed border-amber-400/60 text-amber-200 font-bold cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>اختيار ملف فيديو 16:9 من جهازك 📁🎬</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleOwnerVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 2. Direct Link Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-amber-200 mb-1">
                      2. أو كتابة رابط مباشر لملف الفيديو (URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/story-video-16-9.mp4"
                        value={customVideoInput}
                        onChange={(e) => setCustomVideoInput(e.target.value)}
                        className="flex-grow px-3 py-2 rounded-xl bg-black/60 border border-amber-400/40 text-white placeholder-white/40 text-xs focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={handleApplyVideoUrl}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 font-bold border border-amber-400/50 cursor-pointer"
                      >
                        تطبيق
                      </button>
                    </div>
                  </div>

                  {/* 3. Live 16:9 Video Preview & Save */}
                  {videoUrlState && (
                    <div className="p-3 rounded-xl bg-black/60 border border-amber-400/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-amber-300">معاينة الفيديو 16:09:</span>
                        <span className="text-[10px] text-emerald-300 font-bold">✅ جاهز للاعتماد</span>
                      </div>
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/20">
                        <video src={videoUrlState} controls className="w-full h-full object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveStoryVideo}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>حفظ فيديو القصة 16:09 رسمياً في الموقع 💾🎬</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION B: OWNER AUDIO UPLOADER */}
              {showOwnerAudioUploader && (
                <div className="pt-3 border-t border-amber-400/30 space-y-3 text-xs animate-in fade-in duration-200 bg-black/40 p-3 rounded-2xl border border-amber-400/20">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-300 flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-amber-400" />
                      <span>إرفاق التسجيل الصوتي الرسمي للقصة:</span>
                    </span>
                    <span className="text-[10px] text-amber-200">صوت الراوي الرسمي</span>
                  </div>

                  {/* File Upload Option */}
                  <div>
                    <label className="block text-[11px] font-bold text-amber-200 mb-1">
                      1. رفع ملف صوتي من جهازك (MP3, M4A, WAV):
                    </label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900/40 hover:bg-amber-900/60 border border-dashed border-amber-400/60 text-amber-200 font-bold cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>اختيار ملف صوتي من جهازك 📁</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleOwnerFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Direct Link Option */}
                  <div>
                    <label className="block text-[11px] font-bold text-amber-200 mb-1">
                      2. أو كتابة رابط مباشر لملف الصوت (URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/audio.mp3"
                        value={customAudioInput}
                        onChange={(e) => setCustomAudioInput(e.target.value)}
                        className="flex-grow px-3 py-2 rounded-xl bg-black/60 border border-amber-400/40 text-white placeholder-white/40 text-xs focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={handleApplyAudioUrl}
                        className="px-3 py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 font-bold border border-amber-400/50 cursor-pointer"
                      >
                        تطبيق
                      </button>
                    </div>
                  </div>

                  {/* Current Audio Preview and Save */}
                  {audioUrlState && (
                    <div className="p-2.5 rounded-xl bg-black/60 border border-amber-400/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300">معاينة الصوت المرفق:</span>
                        <audio controls src={audioUrlState} className="h-7 max-w-[200px]" />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveStoryAudio}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>حفظ هذا التسجيل الصوتي للقصة في الموقع 💾🎵</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Shahrazad Fantasy Companion Listening Buddy & Background Aura */}
          {isShahrazadStory && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-md bg-gradient-to-r ${activeCompanion.themeGradient} ${activeCompanion.borderGlow}`}
            >
              <div className="flex items-center gap-3">
                <ShahrazadCharacterAvatar
                  characterId={activeCompanion.id}
                  size="md"
                  showBadge={true}
                  animated={isPlaying}
                  onClick={() => {
                    playClickSound();
                    speakArabicSpeech(
                      `${activeCompanion.name} يقول: ${activeCompanion.companionTip}`,
                      undefined,
                      undefined,
                      undefined,
                      { voiceTone: 'joyful' }
                    );
                  }}
                />
                <div className="space-y-0.5 text-right">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-amber-950">
                      رفيقك في عالم شهرزاد 🎭
                    </span>
                    <h4 className="text-xs font-black text-amber-300">
                      {activeCompanion.name} • {activeCompanion.badge}
                    </h4>
                  </div>
                  <p className="text-[11px] text-purple-100 font-medium italic line-clamp-1">
                    "{isPlaying ? activeCompanion.companionTip : activeCompanion.voiceQuote}"
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakArabicSpeech(
                    `${activeCompanion.name} يقول لك: ${activeCompanion.voiceQuote}`,
                    undefined,
                    undefined,
                    undefined,
                    { voiceTone: 'joyful' }
                  );
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer border border-white/10"
                title="استمع لصوت الرفيق"
              >
                <Volume2 className="w-3 h-3 text-amber-300" />
                <span>نصيحة {activeCompanion.name} 🎙️</span>
              </button>
            </div>
          )}

          {/* Audio Player Controls (Inspired by Attachment 1) */}
          <div
            className={`p-4 rounded-2xl border backdrop-blur-sm shadow-md space-y-3 ${
              mode === 'day'
                ? 'bg-white/90 border-sky-100 shadow-indigo-100/50'
                : 'bg-purple-950/40 border-purple-800/60 shadow-purple-950/40'
            }`}
          >
            {/* Scrubber Timeline */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-purple-300 mb-1.5">
                <span>{formatTime(currentTimeSec)}</span>
                <span className="text-amber-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  صوت الراوي
                </span>
                <span>{story.duration}</span>
              </div>
              <div className="relative w-full h-2.5 bg-gray-200 dark:bg-purple-900/60 rounded-full overflow-hidden cursor-pointer">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Play/Pause & Skip Controls */}
            <div className="flex items-center justify-center gap-6 pt-1">
              {/* Rewind 15s */}
              <button
                onClick={() => handleSeek(-15)}
                className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/20 transition-all active:scale-90"
                title="إرجاع 15 ثانية"
              >
                <div className="relative flex items-center justify-center">
                  <RotateCcw className="w-7 h-7 text-purple-400 dark:text-purple-300" />
                  <span className="text-[10px] font-bold absolute text-purple-600 dark:text-yellow-300">15</span>
                </div>
              </button>

              {/* Big Glowing Play/Pause Button */}
              <button
                onClick={handleTogglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الاستماع'}
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-[-1px]" />}
              </button>

              {/* Forward 15s */}
              <button
                onClick={() => handleSeek(15)}
                className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/20 transition-all active:scale-90"
                title="تقديم 15 ثانية"
              >
                <div className="relative flex items-center justify-center">
                  <RotateCw className="w-7 h-7 text-purple-400 dark:text-purple-300" />
                  <span className="text-[10px] font-bold absolute text-purple-600 dark:text-yellow-300">15</span>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Description & Story Reader Toggle */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              mode === 'day'
                ? 'bg-white/80 border-amber-200/70 shadow-sm'
                : 'bg-indigo-950/50 border-purple-800/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <h3 className="font-extrabold text-base">وصف القصة</h3>
                </div>
                <p className="text-sm leading-relaxed opacity-90">{story.description}</p>
              </div>

              {/* Highlight sticker note */}
              <div className="hidden sm:flex flex-col items-center p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold text-center max-w-[130px] rotate-1">
                <span>⭐ قصة مليئة</span>
                <span>بالخيال والقيم!</span>
              </div>
            </div>

            {/* Read Text Button (Expanding Interactive Reader) */}
            <button
              onClick={() => {
                playClickSound();
                setShowReader(!showReader);
                if (!showReader) {
                  speakCurrentPage();
                } else {
                  stopArabicSpeech();
                  setIsSpeaking(false);
                }
              }}
              className="mt-3 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-98 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>{showReader ? 'إغلاق وضع القراءة التفاعلية' : 'قراءة وتصفح صفحات القصة'}</span>
            </button>
          </div>

          {/* Interactive Page-by-Page Reader view */}
          {showReader && (
            <div
              className={`p-4 rounded-2xl border transition-all space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
                mode === 'day'
                  ? 'bg-amber-50/90 border-amber-300/80 shadow-md text-amber-950'
                  : 'bg-purple-900/30 border-purple-700/80 shadow-inner text-purple-100'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-amber-500">
                  الصفحة {currentPage + 1} من {story.pages.length}
                </span>

                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stopArabicSpeech();
                      setIsSpeaking(false);
                    } else {
                      speakCurrentPage();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isSpeaking
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'إيقاف الراوي' : 'اقرأ لي بصوت'}</span>
                </button>
              </div>

              {/* Story Page Text */}
              <p className="text-base sm:text-lg leading-loose font-medium text-justify">
                {story.pages[currentPage]?.text}
              </p>

              {/* Interactive Tappable Elements (Children can touch & hear fun sparkles/pops) */}
              {story.pages[currentPage]?.interactiveElements && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-xs font-bold text-purple-400 block mb-2">
                    المس الأشكال السحرية في الصفحة للتفاعل:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {story.pages[currentPage].interactiveElements!.map((elem) => (
                      <button
                        key={elem.id}
                        onClick={() => handleInteractiveClick(elem)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur border border-white/20 text-xs font-bold transition-transform active:scale-90"
                      >
                        <span className="text-base">{elem.emoji}</span>
                        <span>{elem.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Toast Message */}
              {interactiveToast && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-bold text-sm flex items-center gap-2 animate-bounce shadow-lg">
                  <span className="text-2xl">{interactiveToast.emoji}</span>
                  <span>{interactiveToast.msg}</span>
                </div>
              )}

              {/* Page Navigator */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentPage === 0}
                  onClick={handlePrevPage}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <div className="flex gap-1.5">
                  {story.pages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentPage ? 'bg-amber-400 w-5' : 'bg-gray-400/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  disabled={currentPage === story.pages.length - 1}
                  onClick={handleNextPage}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition-all"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* User Voice Recording Studio for this Story Page */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/60 to-purple-950/60 border border-pink-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-300 flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-pink-400" />
                    <span>سجّل قراءتك لهذه الصفحة بصوتك (+30 نجمة):</span>
                  </span>
                  {pageRecordings[currentPage + 1] && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> تم حفظ التسجيل
                    </span>
                  )}
                </div>

                {!isRecording && !pageRecordings[currentPage + 1] && (
                  <button
                    onClick={handleStartStoryRecording}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Mic className="w-4 h-4" />
                    <span>ابدأ تسجيل صوتك للصفحة {currentPage + 1}</span>
                  </button>
                )}

                {isRecording && (
                  <div className="p-2 rounded-xl bg-rose-900/50 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-rose-300 animate-pulse">
                      🔴 جاري التسجيل: {recordingSeconds}s
                    </span>
                    <button
                      onClick={handleStopStoryRecording}
                      className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>إيقاف وحفظ</span>
                    </button>
                  </div>
                )}

                {pageRecordings[currentPage + 1] && !isRecording && (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={handleTogglePlayStoryChildAudio}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow"
                    >
                      {isPlayingChildAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlayingChildAudio ? 'إيقاف' : 'استمع لتسجيلك 🎧'}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleStartStoryRecording}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-purple-200"
                        title="إعادة التسجيل"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleDeleteStoryRecording}
                        className="px-2 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-[11px] font-bold text-rose-200"
                        title="حذف"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Moral of the story banner */}
              {currentPage === story.pages.length - 1 && (
                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-400/30 text-xs sm:text-sm">
                  <span className="font-extrabold text-amber-300 flex items-center gap-1 mb-1">
                    <Sparkles className="w-4 h-4" /> العبرة المستفادة من القصة:
                  </span>
                  <p>{story.moralLesson}</p>
                </div>
              )}
            </div>
          )}

          {/* Story Comprehension Quiz (Win 10 Stars!) */}
          {story.quiz && story.quiz.length > 0 && (
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                mode === 'day'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-indigo-950/40 border-indigo-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                  <HelpCircle className="w-5 h-5 text-amber-500" />
                  <span>تحدي أذكياء رائد (أجب واربح نجوم ⭐)</span>
                </div>
                {quizScore !== null && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> مبروك! +10 نجوم
                  </span>
                )}
              </div>

              {story.quiz.map((q, qIdx) => {
                const userChoice = quizAnswered[qIdx];
                return (
                  <div key={qIdx} className="space-y-2 pt-2 border-t border-white/10">
                    <p className="text-xs sm:text-sm font-bold">{qIdx + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = userChoice === optIdx;
                        const isCorrect = q.correctIndex === optIdx;
                        let btnStyle = 'bg-white/10 hover:bg-white/20 border-white/10';
                        if (userChoice !== undefined) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-500/80 border-emerald-400 text-white font-bold';
                          } else if (isChosen) {
                            btnStyle = 'bg-rose-500/80 border-rose-400 text-white';
                          } else {
                            btnStyle = 'opacity-40 bg-white/5';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={userChoice !== undefined}
                            onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                            className={`p-2.5 rounded-xl border text-xs sm:text-sm text-right transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {userChoice !== undefined && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {userChoice !== undefined && (
                      <p className="text-xs text-amber-300/90 font-medium">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Metadata Footer Pill Info (Matching Attachment 1) */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-around text-xs font-bold text-center ${
              mode === 'day'
                ? 'bg-white/80 border-sky-100 text-slate-700'
                : 'bg-purple-950/60 border-purple-800/80 text-purple-200'
            }`}
          >
            <div>
              <span className="block opacity-70">المدة</span>
              <span className="text-amber-500 text-sm">{story.duration}</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <span className="block opacity-70">التصنيف</span>
              <span className="text-purple-400 text-sm">{story.categoryLabel}</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <span className="block opacity-70">العمر المناسب</span>
              <span className="text-emerald-500 text-sm">{story.ageRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Story Cover Picker Modal */}
      <StoryCoverPickerModal
        storyId={story.id}
        storyTitle={story.title}
        currentCover={coverUrl}
        defaultCover={story.coverImage}
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onCoverUpdated={(newCover) => {
          setCoverUrl(newCover);
          if (onUpdateStory) {
            onUpdateStory({ ...story, coverImage: newCover });
          }
        }}
      />
    </div>
  );
};
