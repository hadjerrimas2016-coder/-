import React, { useState, useEffect, useRef } from 'react';
import { PictureBook, AppMode, UserAudioRecording } from '../types';
import { DEFAULT_PICTURE_BOOK } from '../data/pictureBooksData';
import {
  X,
  Star,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Mic,
  Square,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  Music,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playSparkleSound,
  playPopSound,
  playClickSound,
  playFanfareSound,
  speakArabicSpeech,
  stopArabicSpeech
} from '../utils/audio';

interface PictureBookModalProps {
  book: PictureBook;
  mode: AppMode;
  onClose: () => void;
  onEarnStars: (amount: number) => void;
  onUpdateBook?: (updatedBook: PictureBook) => void;
  onSaveUserRecording?: (recording: UserAudioRecording) => void;
}

export const PictureBookModal: React.FC<PictureBookModalProps> = ({
  book,
  mode,
  onClose,
  onEarnStars,
  onUpdateBook,
  onSaveUserRecording,
}) => {
  // Defensive fallback to prevent any runtime crash if book data was corrupted
  const safePages =
    book?.pages && Array.isArray(book.pages) && book.pages.length > 0
      ? book.pages
      : DEFAULT_PICTURE_BOOK.pages;
  const safeTitle = book?.title || DEFAULT_PICTURE_BOOK.title;
  const totalPages = safePages.length;

  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Audio Narrator states
  const [isPlayingNarrator, setIsPlayingNarrator] = useState<boolean>(false);
  const [voiceTone, setVoiceTone] = useState<'friendly' | 'joyful' | 'encouraging'>('friendly');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Child Microphone Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [pageRecordings, setPageRecordings] = useState<{ [pageNumber: number]: string }>({});
  const [isPlayingChildAudio, setIsPlayingChildAudio] = useState<boolean>(false);
  const [recordingError, setRecordingError] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const childAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Creators official audio upload / link
  const [creatorsAudio, setCreatorsAudio] = useState<string>(book?.creatorsAudioUrl || '');
  const [showCreatorAudioUpload, setShowCreatorAudioUpload] = useState<boolean>(false);

  const currentPage = safePages[currentPageIdx] || safePages[0];

  // Stop speech & audio on unmount
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

  // When changing page, stop current speech and audio playback
  useEffect(() => {
    stopArabicSpeech();
    setIsPlayingNarrator(false);
    if (childAudioPlayerRef.current) {
      childAudioPlayerRef.current.pause();
      setIsPlayingChildAudio(false);
    }
  }, [currentPageIdx]);

  // Handle Narrator Text-to-Speech
  const handleToggleNarrator = () => {
    playClickSound();
    if (isPlayingNarrator) {
      stopArabicSpeech();
      setIsPlayingNarrator(false);
    } else {
      setIsPlayingNarrator(true);
      const textToSpeak = currentPage.tashkeelText || currentPage.text;
      speakArabicSpeech(
        textToSpeak,
        () => setIsPlayingNarrator(true),
        () => {
          setIsPlayingNarrator(false);
          if (autoAdvance && currentPageIdx < totalPages - 1) {
            setCurrentPageIdx((prev) => prev + 1);
          }
        },
        () => setIsPlayingNarrator(false),
        {
          rate: playbackSpeed,
          voiceTone: voiceTone,
        }
      );
    }
  };

  // --- USER MICROPHONE RECORDING LOGIC ---
  const handleStartRecording = async () => {
    playSparkleSound();
    setRecordingError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRecordingError('المتصفح لا يدعم تسجيل الصوت أو يتطلب تشغيل HTTPS');
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
          [currentPage.pageNumber]: audioUrl,
        }));

        if (onSaveUserRecording) {
          const rec: UserAudioRecording = {
            id: `rec-${Date.now()}`,
            title: `قراءة: صفحة ${currentPage.pageNumber} (${currentPage.chapterTitle || 'قصة ليان'})`,
            storyTitle: safeTitle,
            pageNumber: currentPage.pageNumber,
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

        // Celebrate user achievement
        playFanfareSound();
        onEarnStars(40);
        confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });

        // Stop all media tracks
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
      setRecordingError('يرجى السماح بالوصول للميكروفون من إعدادات المتصفح لبدء التسجيل!');
    }
  };

  const handleStopRecording = () => {
    playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const handleDeleteRecording = () => {
    playPopSound();
    if (childAudioPlayerRef.current) {
      childAudioPlayerRef.current.pause();
      setIsPlayingChildAudio(false);
    }
    setPageRecordings((prev) => {
      const copy = { ...prev };
      delete copy[currentPage.pageNumber];
      return copy;
    });
  };

  const handleTogglePlayChildAudio = () => {
    const audioUrl = pageRecordings[currentPage.pageNumber];
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

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreatorFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCreatorsAudio(url);
      playSparkleSound();
      if (onUpdateBook) {
        onUpdateBook({ ...book, creatorsAudioUrl: url });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xl bg-black/85 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-600/70 bg-gradient-to-b from-[#180f33] via-[#100a26] to-[#080517] text-white my-auto max-h-[96vh] flex flex-col">
        {/* Top Header Bar (Matching Screenshots 1, 2, 5, 6) */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 flex-shrink-0">
          {/* Close button on Top Right in RTL */}
          <button
            onClick={() => {
              playClickSound();
              stopArabicSpeech();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 transition-all active:scale-90 order-1"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Book Title & Current Page in Center (Matching Screenshots) */}
          <div className="text-center order-2">
            <h2 className="text-sm sm:text-base font-black text-white drop-shadow">
              {safeTitle}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] shadow">
                صفحة {currentPage.pageNumber} من {totalPages}
              </span>
              <span className="text-[11px] font-bold text-purple-200">
                - كتاب مصوّر تفاعلي
              </span>
            </div>
          </div>

          {/* Controls on Top Left in RTL (Favorite Star & Font Scale) */}
          <div className="flex items-center gap-2 order-3">
            <button
              onClick={() => {
                playSparkleSound();
                setIsFavorite(!isFavorite);
              }}
              className={`p-1.5 rounded-full border transition-all ${
                isFavorite
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                  : 'bg-purple-900/50 text-white border-purple-500/30 hover:bg-purple-800/60'
              }`}
              title="إضافة للمفضلة"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* Font Size Scale (+A, -A) */}
            <div className="flex items-center bg-purple-900/50 rounded-full border border-purple-500/40 px-1 py-0.5 text-xs font-bold text-purple-200">
              <button
                onClick={() => setFontSizeOffset((prev) => Math.min(prev + 2, 8))}
                className="px-2 py-0.5 hover:text-amber-300 transition-colors"
                title="تكبير الخط"
              >
                +A
              </button>
              <span className="opacity-40">|</span>
              <button
                onClick={() => setFontSizeOffset((prev) => Math.max(prev - 2, -4))}
                className="px-2 py-0.5 hover:text-amber-300 transition-colors"
                title="تصغير الخط"
              >
                -A
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-grow">
          {/* Main Book Card Container with glowing pink/magenta frame (Matching Screenshot 5 & 6) */}
          <div className="rounded-3xl border-4 border-[#ff2a85] bg-gradient-to-b from-[#2d0e3a] via-[#1a0826] to-[#10041a] p-3 sm:p-4 shadow-[0_0_35px_rgba(255,42,133,0.3)] space-y-3">
            {/* 1. Illustration Area (مساحة الصورة) */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-white/20 shadow-md">
              <img
                src={currentPage.image}
                alt={currentPage.chapterTitle}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />

              {/* Tag Header in Image: "المسير الصباحي نحو المدرسة" (Matching Screenshot 5 & 6) */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-black/75 text-amber-300 border border-amber-300/40 backdrop-blur-md shadow">
                  {currentPage.chapterTitle}
                </span>
              </div>

              {/* Raed Emblem in Image: "رائد 📖" */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/95 text-indigo-950 flex items-center gap-1 shadow">
                  <span>📖</span>
                  <span>رائد</span>
                </span>
              </div>

              {/* Bottom Tag on Image: "لوحة القصة الفنية 🎨" */}
              <div className="absolute bottom-2.5 right-2.5 z-10">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-pink-300 backdrop-blur border border-pink-400/30 flex items-center gap-1">
                  <span>🎨</span>
                  <span>لوحة القصة الفنية</span>
                </span>
              </div>
            </div>

            {/* 2. Arabic Text Area (مساحة النص المشكول) (Matching Screenshot 5 & 6) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white text-slate-900 shadow-md space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-purple-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>الجزء {currentPage.pageNumber} من {totalPages} • نص مشكول للقراءة والتعلّم</span>
                </span>

                <button
                  onClick={handleToggleNarrator}
                  className="px-2.5 py-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>استمع للنص</span>
                </button>
              </div>

              {/* Formatted Text with Tashkeel */}
              <p
                style={{ fontSize: `${16 + fontSizeOffset}px`, lineHeight: 2.1 }}
                className="font-bold text-justify text-slate-800 selection:bg-amber-200"
              >
                {currentPage.tashkeelText || currentPage.text}
              </p>

              {/* Cute moon corner sticker */}
              <div className="absolute bottom-1 left-2 pointer-events-none opacity-80 text-xl">
                🌙
              </div>
            </div>
          </div>

          {/* 3. Page Flip Navigator (Matching Screenshot 1 & 2) */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              disabled={currentPageIdx === 0}
              onClick={() => {
                playClickSound();
                setCurrentPageIdx((prev) => prev - 1);
              }}
              className="px-4 py-2 rounded-2xl bg-purple-900/60 hover:bg-purple-800 disabled:opacity-30 disabled:pointer-events-none text-xs sm:text-sm font-extrabold flex items-center gap-1 border border-purple-500/40 text-purple-200 transition-all active:scale-95"
            >
              <span>الصفحة السابقة</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* 10 Pagination Dots (Matching Screenshot 1 & 2) */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {safePages.map((p, idx) => {
                const isActive = idx === currentPageIdx;
                const hasRecording = Boolean(pageRecordings[p.pageNumber]);
                return (
                  <button
                    key={p.pageNumber}
                    onClick={() => {
                      playClickSound();
                      setCurrentPageIdx(idx);
                    }}
                    className={`transition-all duration-300 rounded-full relative ${
                      isActive
                        ? 'w-7 h-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-md'
                        : 'w-2.5 h-2.5 bg-purple-800/80 hover:bg-purple-600'
                    }`}
                    title={`صفحة ${p.pageNumber} ${hasRecording ? '(مسجلة بصوتك 🎙️)' : ''}`}
                  >
                    {hasRecording && !isActive && (
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              disabled={currentPageIdx === totalPages - 1}
              onClick={() => {
                playClickSound();
                setCurrentPageIdx((prev) => prev + 1);
              }}
              className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:pointer-events-none text-xs sm:text-sm font-extrabold text-white flex items-center gap-1 shadow-md transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>الصفحة التالية</span>
            </button>
          </div>

          {/* 4. Section: القراءة الصوتية للصفحة (Text-to-Speech) (Matching Screenshot 1 & 2) */}
          <div className="p-4 rounded-3xl border border-purple-700/80 bg-gradient-to-r from-[#1b1242] to-[#251559] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300">
                  <Volume2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-yellow-300">
                    القراءة الصوتية للصفحة (Text-to-Speech)
                  </h4>
                  <p className="text-[10px] text-purple-200/70">
                    {voiceTone === 'friendly' && 'الراوي الودود الهادئ - صوت مريح ومتأن يناسب الاسترخاء وقبل النوم 🌙'}
                    {voiceTone === 'joyful' && 'الراوي المبهج - صوت مرح وحيوي يبعث على البهجة والابتسامة ✨'}
                    {voiceTone === 'encouraging' && 'الراوي المشجع - صوت ملهم يحفز على التعلّم وحفظ المعاني 🌴'}
                  </p>
                </div>
              </div>

              {/* Creator MP3 link/upload toggle */}
              <button
                onClick={() => setShowCreatorAudioUpload(!showCreatorAudioUpload)}
                className="text-[11px] font-bold text-amber-300/80 hover:text-amber-200 hover:underline flex items-center gap-1"
              >
                <span>صوت صناع العمل 🎧</span>
              </button>
            </div>

            {/* Creator MP3 Upload bar (When clicked) */}
            {showCreatorAudioUpload && (
              <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/40 space-y-2">
                <span className="text-xs font-bold text-amber-300 block">
                  نشر مقطع صوتي مخصص (MP3) للقصة بأصواتكم كصناع العمل:
                </span>
                <input
                  type="file"
                  accept="audio/mp3,audio/*"
                  onChange={handleCreatorFileUpload}
                  className="text-xs text-purple-200 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white"
                />
                {creatorsAudio && (
                  <audio controls src={creatorsAudio} className="w-full mt-2 h-8" />
                )}
              </div>
            )}

            {/* Voice Tone Selectors (المشجع، المبهج، الودود) - Matching Screenshot 1 & 2 */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'encouraging' as const, label: 'المشجع 🌴' },
                  { id: 'joyful' as const, label: 'المبهج ✨' },
                  { id: 'friendly' as const, label: 'الودود 🌙' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => {
                      playClickSound();
                      setVoiceTone(tone.id);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      voiceTone === tone.id
                        ? 'bg-amber-400 text-amber-950 font-black shadow'
                        : 'bg-white/10 text-purple-200 hover:bg-white/20'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>

              {/* Speed & Auto Advance Controls (Matching Screenshot 1 & 2) */}
              <div className="flex items-center gap-2 text-xs">
                <label className="flex items-center gap-1 text-[11px] text-purple-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="accent-amber-400 rounded"
                  />
                  <span>انتقال تلقائي</span>
                </label>

                {/* Speed buttons */}
                <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10">
                  <span className="text-[10px] text-purple-300 px-1 font-bold">السرعة:</span>
                  {[0.8, 1, 1.2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${
                        playbackSpeed === spd
                          ? 'bg-amber-400 text-amber-950 font-black shadow-sm'
                          : 'text-purple-300 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Big Narrator Audio Play Button (Matching Screenshot 1 & 2) */}
            <button
              onClick={handleToggleNarrator}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              {isPlayingNarrator ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>إيقاف القراءة مؤقتًا</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>استمع للقصة الآن 🎧</span>
                </>
              )}
            </button>
          </div>

          {/* 5. Section: استوديو تسجيل صوتك لقراءة الصفحة (Matching Screenshot 1 & 2) */}
          <div className="p-4 sm:p-5 rounded-3xl border border-pink-600/70 bg-gradient-to-r from-[#2c0e3a] to-[#3a1040] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-black text-xs sm:text-sm text-pink-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-pink-400 animate-pulse" />
                  <span>استوديو تسجيل صوتك لقراءة الصفحة</span>
                </h4>
                <p className="text-[10px] text-pink-200/80">
                  اقرأ بصوتك الجميل وسجّل تلاوتك لتنال +40 نقطة خيال! ⭐
                </p>
              </div>

              {pageRecordings[currentPage.pageNumber] && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                  <Check className="w-3 h-3" /> تم الحفظ
                </span>
              )}
            </div>

            {recordingError && (
              <div className="p-2.5 rounded-xl bg-rose-900/60 border border-rose-500/50 text-rose-200 text-xs">
                {recordingError}
              </div>
            )}

            {/* Record / Stop / Playback Controls (Matching Screenshot 1 & 2) */}
            {!isRecording && !pageRecordings[currentPage.pageNumber] && (
              <button
                onClick={handleStartRecording}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#ff2a85] via-[#ff4081] to-[#e91e63] hover:from-[#f51f7b] hover:to-[#d81b60] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/40 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer border border-pink-300/40"
              >
                <Mic className="w-5 h-5 animate-bounce" />
                <span>ابدأ تسجيل قراءتك لهذه الصفحة</span>
              </button>
            )}

            {/* While Recording Live */}
            {isRecording && (
              <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/60 flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-rose-300">
                    جاري تسجيل صوتك: {formatTimer(recordingSeconds)}
                  </span>
                </div>

                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>إنهاء التسجيل</span>
                </button>
              </div>
            )}

            {/* Recorded Playback & Options */}
            {pageRecordings[currentPage.pageNumber] && !isRecording && (
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePlayChildAudio}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                  >
                    {isPlayingChildAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlayingChildAudio ? 'إيقاف' : 'استمع لتسجيلك 🎧'}</span>
                  </button>

                  <button
                    onClick={handleStartRecording}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="إعادة التسجيل"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDeleteRecording}
                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="مسح التسجيل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
