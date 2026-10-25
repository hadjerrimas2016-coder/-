import React, { useState, useEffect, useRef } from 'react';
import { PictureBook, AppMode, UserAudioRecording } from '../types';
import { DEFAULT_PICTURE_BOOK } from '../data/pictureBooksData';
import { publishPictureBookToFirestore } from '../firebase';
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
  Award,
  Users,
  Edit3,
  Plus,
  Save,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Layers,
  FileText
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
  existingRecordings?: UserAudioRecording[];
}

const CURATED_ILLUSTRATIONS = [
  { id: 'school', title: 'المدرسة والصباح الباكر', url: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png' },
  { id: 'mars', title: 'كوكب المريخ والفضاء', url: '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png' },
  { id: 'stars', title: 'مركبة النجوم والكون', url: '/assets/aistudio/27fbd6f6-d049-4f8d-9848-74312646d933_b4e7b8ad.png' },
  { id: 'castle', title: 'قلعة الأحلام السحرية', url: '/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png' },
  { id: 'kitchen', title: 'مطبخ الشيف والطبخ', url: '/assets/aistudio/video_z5xqdjk5_20261021184400_87b84f16_preview.jpg' },
];

export const PictureBookModal: React.FC<PictureBookModalProps> = ({
  book,
  mode,
  onClose,
  onEarnStars,
  onUpdateBook,
  onSaveUserRecording,
  existingRecordings = [],
}) => {
  // Defensive fallback
  const initialPages =
    book?.pages && Array.isArray(book.pages) && book.pages.length > 0
      ? book.pages
      : DEFAULT_PICTURE_BOOK.pages;

  const [bookTitle, setBookTitle] = useState<string>(book?.title || DEFAULT_PICTURE_BOOK.title);
  const [pagesState, setPagesState] = useState(initialPages);
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Quick Publisher States
  const [showQuickPublisher, setShowQuickPublisher] = useState<boolean>(false);
  const [publisherTab, setPublisherTab] = useState<'editPage' | 'pasteFullBook'>('editPage');
  const [batchFullText, setBatchFullText] = useState<string>('');
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);
  const [publisherNotice, setPublisherNotice] = useState<string>('');

  // Audio Narrator states
  const [isPlayingNarrator, setIsPlayingNarrator] = useState<boolean>(false);
  const [isPlayingWholeBook, setIsPlayingWholeBook] = useState<boolean>(false);
  const [playingCommunityRecId, setPlayingCommunityRecId] = useState<string | null>(null);
  const communityAudioRef = useRef<HTMLAudioElement | null>(null);
  const [voiceTone, setVoiceTone] = useState<'friendly' | 'joyful' | 'encouraging'>('friendly');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

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

  const totalPages = pagesState.length;
  const currentPage = pagesState[currentPageIdx] || pagesState[0];

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

  // When changing page, stop current speech and audio playback unless whole-book loop is active
  useEffect(() => {
    if (!isPlayingWholeBook) {
      stopArabicSpeech();
      setIsPlayingNarrator(false);
    }
    if (childAudioPlayerRef.current) {
      childAudioPlayerRef.current.pause();
      setIsPlayingChildAudio(false);
    }
  }, [currentPageIdx, isPlayingWholeBook]);

  // Continuous whole-book narrator loop
  useEffect(() => {
    if (isPlayingWholeBook) {
      const textToSpeak = currentPage.tashkeelText || currentPage.text;
      const timer = setTimeout(() => {
        speakArabicSpeech(
          textToSpeak,
          () => setIsPlayingNarrator(true),
          () => {
            if (currentPageIdx < totalPages - 1) {
              setCurrentPageIdx((prev) => prev + 1);
            } else {
              setIsPlayingNarrator(false);
              setIsPlayingWholeBook(false);
              playFanfareSound();
              confetti({ particleCount: 75, spread: 70 });
              onEarnStars(30);
            }
          },
          () => {
            setIsPlayingNarrator(false);
            setIsPlayingWholeBook(false);
          },
          { rate: playbackSpeed, voiceTone: voiceTone }
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPageIdx, isPlayingWholeBook, totalPages]);

  // Handle Narrator Text-to-Speech (Current Page)
  const handleToggleNarrator = () => {
    playClickSound();
    if (isPlayingNarrator) {
      stopArabicSpeech();
      setIsPlayingNarrator(false);
      setIsPlayingWholeBook(false);
    } else {
      setIsPlayingNarrator(true);
      const textToSpeak = currentPage.tashkeelText || currentPage.text;
      speakArabicSpeech(
        textToSpeak,
        () => setIsPlayingNarrator(true),
        () => {
          setIsPlayingNarrator(false);
          playSparkleSound();
          onEarnStars(5);
        },
        () => setIsPlayingNarrator(false),
        { rate: playbackSpeed, voiceTone: voiceTone }
      );
    }
  };

  // Toggle Continuous Whole Book Audio
  const handleToggleWholeBookAudio = () => {
    playSparkleSound();
    if (isPlayingWholeBook) {
      stopArabicSpeech();
      setIsPlayingNarrator(false);
      setIsPlayingWholeBook(false);
    } else {
      setIsPlayingWholeBook(true);
      if (currentPageIdx >= totalPages - 1) {
        setCurrentPageIdx(0);
      }
    }
  };

  // Start Mic Recording
  const handleStartRecording = async () => {
    playClickSound();
    setRecordingError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setPageRecordings((prev) => ({
          ...prev,
          [currentPage.pageNumber]: audioUrl,
        }));

        playFanfareSound();
        confetti({ particleCount: 60, spread: 60 });
        onEarnStars(40);

        if (onSaveUserRecording) {
          onSaveUserRecording({
            id: `rec-pb-${currentPage.pageNumber}-${Date.now()}`,
            storyId: `picture-book-page-${currentPage.pageNumber}`,
            title: `قراءة ${bookTitle} - صفحة ${currentPage.pageNumber}`,
            audioUrl: audioUrl,
            durationSec: recordingSeconds || 12,
            createdAt: new Date().toLocaleDateString('ar-SA'),
            scorePoints: 40,
          });
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission error:', err);
      setRecordingError('يرجى السماح بالوصول إلى الميكروفون لبدء تسجيل صوتك الجميل.');
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

  const handleTogglePlayChildAudio = () => {
    const recUrl = pageRecordings[currentPage.pageNumber];
    if (!recUrl) return;

    if (!childAudioPlayerRef.current) {
      childAudioPlayerRef.current = new Audio(recUrl);
      childAudioPlayerRef.current.onended = () => setIsPlayingChildAudio(false);
    } else {
      childAudioPlayerRef.current.src = recUrl;
    }

    if (isPlayingChildAudio) {
      childAudioPlayerRef.current.pause();
      setIsPlayingChildAudio(false);
    } else {
      stopArabicSpeech();
      setIsPlayingNarrator(false);
      childAudioPlayerRef.current.play().catch(() => {});
      setIsPlayingChildAudio(true);
    }
  };

  const handleDeleteRecording = () => {
    playPopSound();
    if (childAudioPlayerRef.current) {
      childAudioPlayerRef.current.pause();
    }
    setIsPlayingChildAudio(false);
    setPageRecordings((prev) => {
      const copy = { ...prev };
      delete copy[currentPage.pageNumber];
      return copy;
    });
  };

  // Play Community Recording
  const handleTogglePlayCommunityRec = (rec: UserAudioRecording) => {
    playClickSound();
    if (playingCommunityRecId === rec.id) {
      if (communityAudioRef.current) {
        communityAudioRef.current.pause();
      }
      setPlayingCommunityRecId(null);
    } else {
      if (communityAudioRef.current) {
        communityAudioRef.current.pause();
      }
      stopArabicSpeech();
      setIsPlayingNarrator(false);
      setIsPlayingChildAudio(false);

      const src = rec.audioUrl || rec.audioBlobUrl;
      if (src) {
        communityAudioRef.current = new Audio(src);
        communityAudioRef.current.onended = () => setPlayingCommunityRecId(null);
        communityAudioRef.current.play().catch(() => {});
        setPlayingCommunityRecId(rec.id);
      }
    }
  };

  // QUICK PUBLISHER HANDLERS (Making story publishing super fast!)
  const handleSaveBookToCloud = async (updatedPages = pagesState) => {
    setIsSavingCloud(true);
    setPublisherNotice('جارٍ حفظ ونشر الكتاب في Firebase...');
    try {
      const updatedBook: PictureBook = {
        ...book,
        title: bookTitle.trim() || DEFAULT_PICTURE_BOOK.title,
        pages: updatedPages,
        totalPages: updatedPages.length,
        updatedAt: new Date().toISOString(),
      };

      await publishPictureBookToFirestore(updatedBook);
      if (onUpdateBook) {
        onUpdateBook(updatedBook);
      }

      playFanfareSound();
      confetti({ particleCount: 70, spread: 70 });
      setPublisherNotice('تم حفظ ونشر الكتاب المصور بنجاح في Firebase! 🌟');
      setTimeout(() => setPublisherNotice(''), 3000);
    } catch (err: any) {
      alert(`خطأ أثناء الحفظ على Firebase: ${err?.message || err}`);
      setPublisherNotice('');
    } finally {
      setIsSavingCloud(false);
    }
  };

  // 1-Click Fast Multi-Page Paste Parser
  const handleParseAndPublishBatchText = async () => {
    if (!batchFullText.trim()) {
      alert('يرجى لصق نص القصة أولاً!');
      return;
    }

    playClickSound();
    // Split text by empty lines or '---' or numbered chapters
    const rawChunks = batchFullText
      .split(/\n\s*\n|---+|الصفحة\s*\d+:|الفصل\s*\d+:/)
      .map((c) => c.trim())
      .filter((c) => c.length > 5);

    if (rawChunks.length === 0) {
      alert('لم نتمكن من تقسيم النص! يرجى الفصل بين كل صفحة بسطر فارغ.');
      return;
    }

    const newPages = rawChunks.map((chunk, idx) => {
      const matchedImg = CURATED_ILLUSTRATIONS[idx % CURATED_ILLUSTRATIONS.length].url;
      return {
        pageNumber: idx + 1,
        chapterTitle: `الفصل ${idx + 1}: ${chunk.slice(0, 24)}...`,
        image: matchedImg,
        text: chunk,
        tashkeelText: chunk,
      };
    });

    setPagesState(newPages);
    setCurrentPageIdx(0);
    await handleSaveBookToCloud(newPages);
    setShowQuickPublisher(false);
    setBatchFullText('');
  };

  // Add a new empty page
  const handleAddNewPage = () => {
    playPopSound();
    const newPageNum = pagesState.length + 1;
    const newPage = {
      pageNumber: newPageNum,
      chapterTitle: `الفصل ${newPageNum}: مغامرة جديدة`,
      image: CURATED_ILLUSTRATIONS[(newPageNum - 1) % CURATED_ILLUSTRATIONS.length].url,
      text: 'اكتب نص الصفحة الجديدة هنا...',
      tashkeelText: 'اُكْتُبْ نَصَّ الصَّفْحَةِ الجَدِيدَةِ هُنَا...',
    };
    const updated = [...pagesState, newPage];
    setPagesState(updated);
    setCurrentPageIdx(updated.length - 1);
  };

  // Delete current page
  const handleDeleteCurrentPage = () => {
    if (pagesState.length <= 1) {
      alert('يجب أن يحتوي الكتاب على صفحة واحدة على الأقل!');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف الصفحة ${currentPage.pageNumber}؟`)) {
      playPopSound();
      const filtered = pagesState
        .filter((_, idx) => idx !== currentPageIdx)
        .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      setPagesState(filtered);
      setCurrentPageIdx((prev) => Math.min(prev, filtered.length - 1));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xl bg-black/85 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-600/70 bg-gradient-to-b from-[#180f33] via-[#100a26] to-[#080517] text-white my-auto max-h-[96vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 flex-shrink-0 flex-wrap gap-2">
          {/* Close button on Right */}
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

          {/* Book Title & Current Page in Center */}
          <div className="text-center order-2">
            <h2 className="text-xs sm:text-base font-black text-white drop-shadow">
              {bookTitle}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] shadow">
                صفحة {currentPage.pageNumber} من {totalPages}
              </span>
              <span className="text-[10px] font-bold text-purple-200">
                - كتاب مصوّر تفاعلي
              </span>
            </div>
          </div>

          {/* Quick Publisher Action & Controls */}
          <div className="flex items-center gap-2 order-3">
            <button
              onClick={() => {
                playClickSound();
                setShowQuickPublisher(!showQuickPublisher);
              }}
              className={`px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shadow transition-all cursor-pointer ${
                showQuickPublisher
                  ? 'bg-rose-500 text-white'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 hover:brightness-110 active:scale-95'
              }`}
              title="محرر ونشر صفحات الكتاب السريع"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{showQuickPublisher ? 'إغلاق النشر' : 'نشر وتعديل الصفحات ✍️'}</span>
            </button>

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
          </div>
        </div>

        {/* QUICK PICTURE BOOK PUBLISHER DRAWER (Special Owner Super-Tool!) */}
        {showQuickPublisher && (
          <div className="p-4 bg-[#140b2b] border-b-2 border-amber-400/60 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150 flex-shrink-0 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-400 text-amber-950">
                  <Zap className="w-4 h-4 fill-current" />
                </span>
                <h4 className="text-xs sm:text-sm font-black text-amber-300">
                  معالج نشر وتحرير صفحات الكتاب المصور الفوري 🚀
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPublisherTab('editPage')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    publisherTab === 'editPage'
                      ? 'bg-amber-400 text-amber-950 font-black'
                      : 'bg-white/10 text-purple-200'
                  }`}
                >
                  تعديل الصفحات
                </button>
                <button
                  type="button"
                  onClick={() => setPublisherTab('pasteFullBook')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    publisherTab === 'pasteFullBook'
                      ? 'bg-amber-400 text-amber-950 font-black'
                      : 'bg-white/10 text-purple-200'
                  }`}
                >
                  لصق كتاب كامل دفعة واحدة ✨
                </button>
              </div>
            </div>

            {publisherNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{publisherNotice}</span>
              </div>
            )}

            {/* TAB 1: EDIT INDIVIDUAL PAGES & THUMBNAIL GALLERY */}
            {publisherTab === 'editPage' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-sm">
                    {pagesState.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPageIdx(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                          currentPageIdx === idx
                            ? 'bg-amber-400 text-amber-950 font-black scale-110 shadow'
                            : 'bg-white/10 text-purple-200 hover:bg-white/20'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleAddNewPage}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة صفحة (+{totalPages + 1})</span>
                    </button>
                    {totalPages > 1 && (
                      <button
                        onClick={handleDeleteCurrentPage}
                        className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-[11px] cursor-pointer"
                        title="حذف هذه الصفحة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-400">عنوان الصفحة {currentPage.pageNumber}:</label>
                    <input
                      type="text"
                      value={currentPage.chapterTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPagesState((prev) => {
                          const copy = [...prev];
                          copy[currentPageIdx] = { ...copy[currentPageIdx], chapterTitle: val };
                          return copy;
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-400">اختر صورة الصفحة بنقرة واحدة:</label>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {CURATED_ILLUSTRATIONS.map((ill) => (
                        <button
                          key={ill.id}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setPagesState((prev) => {
                              const copy = [...prev];
                              copy[currentPageIdx] = { ...copy[currentPageIdx], image: ill.url };
                              return copy;
                            });
                          }}
                          className={`w-10 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer ${
                            currentPage.image === ill.url ? 'border-amber-400 scale-105 shadow' : 'border-white/20 opacity-70'
                          }`}
                          title={ill.title}
                        >
                          <img src={ill.url} alt={ill.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-300">نص الصفحة مع التشكيل:</label>
                  <textarea
                    rows={2}
                    value={currentPage.tashkeelText || currentPage.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPagesState((prev) => {
                        const copy = [...prev];
                        copy[currentPageIdx] = { ...copy[currentPageIdx], text: val, tashkeelText: val };
                        return copy;
                      });
                    }}
                    className="w-full p-2 rounded-xl bg-white/10 border border-purple-700 text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-purple-300/80">
                    يمكنك تعديل أي صفحة وسيتم حفظها مباشرة في السحابة.
                  </span>
                  <button
                    onClick={() => handleSaveBookToCloud()}
                    disabled={isSavingCloud}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {isSavingCloud ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>حفظ وتحديث في Firebase 🚀</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PASTE ENTIRE BOOK AT ONCE */}
            {publisherTab === 'pasteFullBook' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>الصق نص القصة بالكامل هنا (افصل بين كل صفحة بسطر فارغ أو علامة ---):</span>
                  </label>
                  <textarea
                    rows={5}
                    value={batchFullText}
                    onChange={(e) => setBatchFullText(e.target.value)}
                    placeholder="الصفحة 1: في قديم الزمان كان هناك فتى شجاع يدعى رائد...&#10;&#10;الصفحة 2: انطلق رائد نحو الجبل السحري بحثاً عن سر الكواكب...&#10;&#10;الصفحة 3: وعند قمة الجبل وجد مفتاح النجوم..."
                    className="w-full p-3 rounded-2xl bg-white/10 border border-purple-600 text-xs leading-relaxed font-sans"
                  />
                </div>

                <button
                  onClick={handleParseAndPublishBatchText}
                  disabled={isSavingCloud}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                >
                  {isSavingCloud ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جارٍ إنشاء الصفحات والحفظ على Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>تقسيم النص لصفحات ونشر الكتاب فوراً إلى Firebase 🚀</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-grow">
          {/* Main Book Card Container */}
          <div className="rounded-3xl border-4 border-[#ff2a85] bg-gradient-to-b from-[#2d0e3a] via-[#1a0826] to-[#10041a] p-3 sm:p-4 shadow-[0_0_35px_rgba(255,42,133,0.3)] space-y-3">
            {/* 1. Illustration Area */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-white/20 shadow-md">
              <img
                src={currentPage.image}
                alt={currentPage.chapterTitle}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />

              {/* Tag Header in Image */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-black/75 text-amber-300 border border-amber-300/40 backdrop-blur-md shadow">
                  {currentPage.chapterTitle}
                </span>
              </div>

              {/* Raed Emblem in Image */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 shadow">
                  رائد 📖
                </span>
              </div>

              {/* Narrator Voice Indicator */}
              {isPlayingNarrator && (
                <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 backdrop-blur-md border border-purple-400/50 text-xs text-purple-200">
                  <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>الراوي يقرأ بصوت واضح...</span>
                </div>
              )}
            </div>

            {/* 2. Text Area with full vocalization */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <p
                className="text-sm sm:text-base leading-loose font-bold text-amber-100 text-right select-text"
                style={{ fontSize: `${15 + fontSizeOffset}px` }}
              >
                {currentPage.tashkeelText || currentPage.text}
              </p>
            </div>

            {/* 3. Page Navigation (Next / Prev) */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => {
                  playClickSound();
                  setCurrentPageIdx((prev) => Math.min(prev + 1, totalPages - 1));
                }}
                disabled={currentPageIdx >= totalPages - 1}
                className={`py-2 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentPageIdx >= totalPages - 1
                    ? 'opacity-40 bg-white/5 text-purple-300 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>الصفحة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-purple-300">
                {currentPage.pageNumber} / {totalPages}
              </span>

              <button
                onClick={() => {
                  playClickSound();
                  setCurrentPageIdx((prev) => Math.max(prev - 1, 0));
                }}
                disabled={currentPageIdx <= 0}
                className={`py-2 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentPageIdx <= 0
                    ? 'opacity-40 bg-white/5 text-purple-300 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span>الصفحة السابقة</span>
              </button>
            </div>

            {/* 4. Dual Audio Narration Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleToggleNarrator}
                className={`py-3 px-4 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isPlayingNarrator && !isPlayingWholeBook
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/50'
                }`}
              >
                {isPlayingNarrator && !isPlayingWholeBook ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>إيقاف قراءة الصفحة {currentPage.pageNumber}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>استمع لصفحة {currentPage.pageNumber} 🔊</span>
                  </>
                )}
              </button>

              <button
                onClick={handleToggleWholeBookAudio}
                className={`py-3 px-4 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isPlayingWholeBook
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse shadow-rose-900/50'
                    : 'bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 hover:brightness-110 shadow-pink-900/40'
                }`}
              >
                {isPlayingWholeBook ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>إيقاف القراءة الكاملة للكتاب ⏹️</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>قراءة الكتاب كاملاً تلقائياً 🎧✨</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5. Section: استوديو تسجيل صوتك لقراءة الصفحة */}
          <div className="p-4 sm:p-5 rounded-3xl border border-pink-600/70 bg-gradient-to-r from-[#2c0e3a] to-[#3a1040] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-black text-xs sm:text-sm text-pink-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-pink-400 animate-pulse" />
                  <span>استوديو تسجيل صوتك لقراءة صفحات الكتاب المصور</span>
                </h4>
                <p className="text-[10px] text-pink-200/80">
                  اقرأ بصوتك الجميل وسجّل تلاوتك لتنال +40 نقطة خيال وتُنشر في نادي القراءة العام! ⭐
                </p>
              </div>

              {pageRecordings[currentPage.pageNumber] && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                  <Check className="w-3 h-3" /> تم الحفظ في حسابك ونادي القراءة
                </span>
              )}
            </div>

            {recordingError && (
              <div className="p-2.5 rounded-xl bg-rose-900/60 border border-rose-500/50 text-rose-200 text-xs">
                {recordingError}
              </div>
            )}

            {/* Record / Stop / Playback Controls */}
            {!isRecording && !pageRecordings[currentPage.pageNumber] && (
              <button
                onClick={handleStartRecording}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#ff2a85] via-[#ff4081] to-[#e91e63] hover:from-[#f51f7b] hover:to-[#d81b60] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/40 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer border border-pink-300/40"
              >
                <Mic className="w-5 h-5 animate-bounce" />
                <span>ابدأ تسجيل قراءتك لصفحة {currentPage.pageNumber} بصوتك</span>
              </button>
            )}

            {isRecording && (
              <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/60 flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-white">
                    جارٍ تسجيل صوتك الآن: {recordingSeconds} ثانية
                  </span>
                </div>

                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1 shadow cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>إنهاء وحفظ التسجيل</span>
                </button>
              </div>
            )}

            {pageRecordings[currentPage.pageNumber] && (
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
                    <span>إعادة التسجيل</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-amber-300 font-bold hidden sm:inline">
                    ✓ محفوظ في مكتبتك الصوتية
                  </span>
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

          {/* 6. Section: تسجيلات القراء الصغار لهذا الكتاب (نادي القراءة) */}
          <div className="p-4 sm:p-5 rounded-3xl border border-purple-700/60 bg-gradient-to-r from-[#170e30] to-[#20113f] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
                  <Users className="w-4 h-4 text-pink-400" />
                </span>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-amber-300">
                    تسجيلات القراء الصغار لهذا الكتاب (نادي القراءة) 🎙️👥
                  </h4>
                  <p className="text-[10px] text-purple-200/80">
                    استمع لتسجيلات الأطفال والأصدقاء الذين قرأوا صفحات هذا الكتاب وسجلوا أصواتهم!
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 text-[10px] font-bold">
                {existingRecordings.length} تسجيل
              </span>
            </div>

            {existingRecordings.length > 0 ? (
              <div className="space-y-2 max-h-44 overflow-y-auto no-scrollbar">
                {existingRecordings.map((rec) => {
                  const isPlaying = playingCommunityRecId === rec.id;
                  return (
                    <div
                      key={rec.id}
                      className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-sm font-black flex-shrink-0">
                          🎙️
                        </span>
                        <div className="min-w-0">
                          <h5 className="text-xs font-black text-white truncate">{rec.title}</h5>
                          <span className="text-[10px] text-purple-300/80 block">
                            ⏱️ {rec.durationSec} ثانية • {rec.createdAt}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTogglePlayCommunityRec(rec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black hover:brightness-110 shadow'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isPlaying ? 'إيقاف' : 'استمع'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 text-center space-y-1">
                <p className="text-xs text-purple-200">
                  سجل قراءتك لصفحات الكتاب عبر الزر الوردي بالأعلى، وسيظهر تسجيلك هنا وفي نادي القراءة ليستمع له الأصدقاء! 🌟
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
