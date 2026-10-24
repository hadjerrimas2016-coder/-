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
  Check
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

interface StoryModalProps {
  story: Story;
  mode: AppMode;
  onClose: () => void;
  onEarnStars: (amount: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSaveUserRecording?: (recording: UserAudioRecording) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  story,
  mode,
  onClose,
  onEarnStars,
  isFavorite,
  onToggleFavorite,
  onSaveUserRecording,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const totalDurationSec = 300; // 5:00 simulated story track duration
  const [showReader, setShowReader] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [quizAnswered, setQuizAnswered] = useState<{ [qIdx: number]: number }>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [interactiveToast, setInteractiveToast] = useState<{ emoji: string; msg: string } | null>(null);

  // Audio timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
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
  }, [isPlaying, totalDurationSec]);

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
      setIsPlaying(true);
      // Also speak current page if in reader mode
      if (showReader) {
        speakCurrentPage();
      }
    } else {
      setIsPlaying(false);
      stopArabicSpeech();
      setIsSpeaking(false);
    }
  };

  const handleSeek = (diff: number) => {
    playClickSound();
    setCurrentTimeSec((prev) => Math.min(Math.max(0, prev + diff), totalDurationSec));
  };

  const speakCurrentPage = () => {
    const textToSpeak = story.pages[currentPage]?.text || story.description;
    setIsSpeaking(true);
    backgroundAudio.playAmbientCarrier({
      title: story.title,
      subtitle: 'الصفحة ' + (currentPage + 1) + ': ' + (story.pages[currentPage]?.text?.slice(0, 30) || story.subtitle),
      artworkUrl: story.coverImage,
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
          {/* Main Story Hero Artwork Banner */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[16/10] bg-slate-900 border border-white/20">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
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
    </div>
  );
};
