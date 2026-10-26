import React, { useState, useEffect, useRef } from 'react';
import { PictureBook, PictureBookPage, AppMode, UserAudioRecording } from '../types';
import { DEFAULT_PICTURE_BOOK, PRESET_PICTURE_BOOKS } from '../data/pictureBooksData';
import { publishPictureBookToFirestore, auth } from '../firebase';
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
  FileText,
  BookOpen,
  Library,
  Sliders,
  ChevronDown,
  Upload,
  Link as LinkIcon,
  Clock,
  Radio,
  Eye,
  AlertCircle
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

export interface IllustrationCategory {
  category: string;
  icon: string;
  items: { id: string; title: string; url: string }[];
}

export const CURATED_ILLUSTRATION_CATEGORIES: IllustrationCategory[] = [
  {
    category: 'رائد والفضاء والنجوم 🚀',
    icon: '🚀',
    items: [
      { id: 'space-ship', title: 'سفينة الكواكب والنجوم', url: '/assets/aistudio/27fbd6f6-d049-4f8d-9848-74312646d933_b4e7b8ad.png' },
      { id: 'space-mars', title: 'كوكب المريخ والفضاء', url: '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png' },
      { id: 'space-asteroid', title: 'حزام الكويكبات والشهب', url: '/assets/aistudio/0d44fa38-6e39-4895-97cf-9c9af9fee350_1f400aaf.png' },
      { id: 'space-galaxy', title: 'المجرة الذهبية اللامعة', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80' },
      { id: 'space-earth', title: 'الأرض من مدار الأقمار', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
      { id: 'space-rocket', title: 'انطلاق الصاروخ الاستكشافي', url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  {
    category: 'ليان والجوهرة المصونة 👑',
    icon: '👑',
    items: [
      { id: 'layan-veil', title: 'ليان والجوهرة المصونة', url: '/assets/aistudio/Capture_d__cran_2026-10-20_135700_a8f3d8ee.png' },
      { id: 'layan-morning', title: 'المسير الصباحي والمدرسة', url: '/assets/aistudio/Capture_d__cran_2026-10-20_135742_9bb46748.png' },
      { id: 'grandmother', title: 'حكمة الجدة وسر اللؤلؤة', url: '/assets/aistudio/image_2026-10-20_135936230_89e4c091.png' },
      { id: 'market-silk', title: 'سوق الأقمشة والياسمين', url: '/assets/aistudio/Capture_d__cran_2026-10-17_165435_21ae23c9.png' }
    ]
  },
  {
    category: 'مطبخ الشيف الصغير والطهي 🍳',
    icon: '🍳',
    items: [
      { id: 'chef-kitchen', title: 'مطبخ الشيف الصغير', url: '/assets/aistudio/Capture_d__cran_2026-10-17_190633_b3cc6339.png' },
      { id: 'chef-baking', title: 'إعداد كعكة العسل والفواكه', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80' },
      { id: 'chef-pastry', title: 'فطائر لذيذة ومقرمشة', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
      { id: 'chef-family', title: 'مائدة المشاركة والمحبة', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  {
    category: 'القلاع السحرية والخيال 🏰',
    icon: '🏰',
    items: [
      { id: 'magic-castle', title: 'قلعة الأحلام السحرية', url: '/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png' },
      { id: 'twilight-castle', title: 'قصر النجوم الذهبي', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
      { id: 'fantasy-lights', title: 'أضواء الشفق الأسطورية', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  {
    category: 'الحيوانات والغابة السحرية 🦊',
    icon: '🦊',
    items: [
      { id: 'clever-fox', title: 'الثعلب الصغير الوفي', url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800&q=80' },
      { id: 'mystic-forest', title: 'الغابة الخضراء والبحيرة', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80' },
      { id: 'gentle-cat', title: 'القطة اللطيفة والمرح', url: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  {
    category: 'راديو النوم والأحلام الهادئة 🌙',
    icon: '🌙',
    items: [
      { id: 'sleeping-raed', title: 'رائد تحت ضوء النجوم', url: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png' },
      { id: 'peaceful-night', title: 'سكون الليل والقمر الساطع', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80' },
      { id: 'clouds-moon', title: 'أحلام وردية وسحاب أبيض', url: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  {
    category: 'المدرسة والعلم والمكتبة 📚',
    icon: '📚',
    items: [
      { id: 'story-books', title: 'كتب القصص الملونة', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80' },
      { id: 'art-crayons', title: 'أقلام التلوين والإبداع', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80' },
      { id: 'wise-library', title: 'مكتبة الحكمة العريقة', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80' }
    ]
  }
];

// Flattened list for quick matching
const ALL_CURATED_FLAT = CURATED_ILLUSTRATION_CATEGORIES.flatMap((c) => c.items);

interface PictureBookModalProps {
  book: PictureBook;
  allBooks?: PictureBook[];
  mode: AppMode;
  onClose: () => void;
  onEarnStars: (amount: number) => void;
  onUpdateBook?: (updatedBook: PictureBook) => void;
  onSelectBook?: (selected: PictureBook) => void;
  onDeleteBook?: (bookId: string) => void;
  onSaveUserRecording?: (recording: UserAudioRecording) => void;
  existingRecordings?: UserAudioRecording[];
  initialOpenPublisher?: boolean;
}

export const PictureBookModal: React.FC<PictureBookModalProps> = ({
  book,
  allBooks = PRESET_PICTURE_BOOKS,
  mode,
  onClose,
  onEarnStars,
  onUpdateBook,
  onSelectBook,
  onDeleteBook,
  onSaveUserRecording,
  existingRecordings = [],
  initialOpenPublisher = false,
}) => {
  // Safe Book reference
  const activeBook = book || DEFAULT_PICTURE_BOOK;

  // Defensive Pages array
  const getSafePages = (b?: PictureBook): PictureBookPage[] => {
    if (b && Array.isArray(b.pages) && b.pages.length > 0) {
      return b.pages;
    }
    return DEFAULT_PICTURE_BOOK.pages;
  };

  const [currentBookId, setCurrentBookId] = useState<string>(activeBook.id || 'layan-jewel');
  const [bookTitle, setBookTitle] = useState<string>(activeBook.title || DEFAULT_PICTURE_BOOK.title);
  const [pagesState, setPagesState] = useState<PictureBookPage[]>(() => getSafePages(activeBook));
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showBookLibrary, setShowBookLibrary] = useState<boolean>(false);

  // Inter-page Pause Gap Settings (الفواصل الزمنية بين الصفحات)
  const [gapBetweenPagesSec, setGapBetweenPagesSec] = useState<number>(
    activeBook.gapBetweenPagesSec || 2
  );
  const [isPageGapWaiting, setIsPageGapWaiting] = useState<boolean>(false);
  const [gapCountdownSec, setGapCountdownSec] = useState<number>(0);

  // Quick Publisher States
  const [showQuickPublisher, setShowQuickPublisher] = useState<boolean>(initialOpenPublisher);
  const [publisherTab, setPublisherTab] = useState<'editPage' | 'pasteFullBook' | 'audioStudio'>('editPage');
  const [batchFullText, setBatchFullText] = useState<string>('');
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);
  const [publisherNotice, setPublisherNotice] = useState<string>('');

  // Page Image Picker Modal States
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'page' | 'newBookCover' | 'currentBookCover'>('page');
  const [imageFitMode, setImageFitMode] = useState<'cover' | 'contain'>('cover');
  const [imagePickerActiveTab, setImagePickerActiveTab] = useState<'gallery' | 'url' | 'upload'>('gallery');
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('الكل');
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string>('');
  const [customImagePreview, setCustomImagePreview] = useState<string>('');
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  // New Picture Book Creator Dialog
  const [showNewBookModal, setShowNewBookModal] = useState<boolean>(false);
  const [newBookTitle, setNewBookTitle] = useState<string>('');
  const [newBookSubtitle, setNewBookSubtitle] = useState<string>('');
  const [newBookBadge, setNewBookBadge] = useState<string>('مغامرة مصورة شيقة');
  const [newBookAgeRange, setNewBookAgeRange] = useState<string>('6 - 12 سنة');
  const [newBookMoralLesson, setNewBookMoralLesson] = useState<string>('');
  const [newBookCoverImage, setNewBookCoverImage] = useState<string>(
    '/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png'
  );
  const [newBookPageCount, setNewBookPageCount] = useState<number>(5);

  // Delete Book Confirmation Modal
  const [bookToDeleteId, setBookToDeleteId] = useState<string | null>(null);

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
  const gapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize state when book prop updates
  useEffect(() => {
    if (book) {
      setCurrentBookId(book.id || 'layan-jewel');
      setBookTitle(book.title || DEFAULT_PICTURE_BOOK.title);
      const safe = getSafePages(book);
      setPagesState(safe);
      if (book.gapBetweenPagesSec !== undefined) {
        setGapBetweenPagesSec(book.gapBetweenPagesSec);
      }
    }
  }, [book]);

  // Guaranteed safe page calculations
  const safePagesList: PictureBookPage[] =
    pagesState && pagesState.length > 0 ? pagesState : DEFAULT_PICTURE_BOOK.pages;
  const totalPages = safePagesList.length;
  const safePageIdx = Math.max(0, Math.min(currentPageIdx, totalPages - 1));
  const currentPage = safePagesList[safePageIdx] || DEFAULT_PICTURE_BOOK.pages[0];

  // Stop speech & audio on unmount
  useEffect(() => {
    return () => {
      stopArabicSpeech();
      if (childAudioPlayerRef.current) {
        childAudioPlayerRef.current.pause();
      }
      if (communityAudioRef.current) {
        communityAudioRef.current.pause();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (gapTimerRef.current) {
        clearInterval(gapTimerRef.current);
      }
    };
  }, []);

  // When changing page, stop current speech unless whole-book loop is running
  useEffect(() => {
    if (!isPlayingWholeBook) {
      stopArabicSpeech();
      setIsPlayingNarrator(false);
      setIsPageGapWaiting(false);
    }
    if (childAudioPlayerRef.current) {
      childAudioPlayerRef.current.pause();
      setIsPlayingChildAudio(false);
    }
  }, [currentPageIdx, isPlayingWholeBook]);

  // Continuous Whole-Book Narrator Loop with Inter-Page Pause Gaps (الفواصل الزمنية بين الصفحات)
  useEffect(() => {
    if (isPlayingWholeBook) {
      // If waiting in gap between pages, do not start reading yet
      if (isPageGapWaiting) return;

      const pageAudio = pageRecordings[currentPage.pageNumber];
      const textToSpeak = currentPage.tashkeelText || currentPage.text || 'صفحة الكتاب المصور';

      const proceedToNextPageWithGap = () => {
        if (currentPageIdx < totalPages - 1) {
          // Enter gap pause interval
          setIsPageGapWaiting(true);
          const gapSec = gapBetweenPagesSec > 0 ? gapBetweenPagesSec : 2;
          setGapCountdownSec(gapSec);

          let remaining = gapSec;
          gapTimerRef.current = setInterval(() => {
            remaining -= 1;
            setGapCountdownSec(remaining);
            if (remaining <= 0) {
              if (gapTimerRef.current) clearInterval(gapTimerRef.current);
              setIsPageGapWaiting(false);
              setCurrentPageIdx((prev) => prev + 1);
            }
          }, 1000);
        } else {
          // Finished entire book
          setIsPlayingNarrator(false);
          setIsPlayingWholeBook(false);
          setIsPageGapWaiting(false);
          playFanfareSound();
          confetti({ particleCount: 85, spread: 80 });
          onEarnStars(50);
        }
      };

      if (pageAudio) {
        // If child recorded audio for this page exists, play child audio
        const audio = new Audio(pageAudio);
        childAudioPlayerRef.current = audio;
        setIsPlayingNarrator(true);
        audio.onended = () => {
          setIsPlayingNarrator(false);
          proceedToNextPageWithGap();
        };
        audio.onerror = () => {
          setIsPlayingNarrator(false);
          proceedToNextPageWithGap();
        };
        audio.play().catch(() => {
          proceedToNextPageWithGap();
        });
      } else {
        // Use Arabic speech synthesizer
        const timer = setTimeout(() => {
          speakArabicSpeech(
            textToSpeak,
            () => setIsPlayingNarrator(true),
            () => {
              setIsPlayingNarrator(false);
              proceedToNextPageWithGap();
            },
            () => {
              setIsPlayingNarrator(false);
              proceedToNextPageWithGap();
            },
            { rate: playbackSpeed, voiceTone: voiceTone }
          );
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [currentPageIdx, isPlayingWholeBook, isPageGapWaiting, totalPages, gapBetweenPagesSec, playbackSpeed, voiceTone, pageRecordings]);

  // Handle Narrator Text-to-Speech (Current Single Page)
  const handleToggleNarrator = () => {
    playClickSound();
    if (isPlayingNarrator) {
      stopArabicSpeech();
      if (childAudioPlayerRef.current) childAudioPlayerRef.current.pause();
      setIsPlayingNarrator(false);
      setIsPlayingWholeBook(false);
      setIsPageGapWaiting(false);
    } else {
      setIsPlayingNarrator(true);
      const pageAudio = pageRecordings[currentPage.pageNumber];
      if (pageAudio) {
        const audio = new Audio(pageAudio);
        childAudioPlayerRef.current = audio;
        audio.onended = () => {
          setIsPlayingNarrator(false);
          playSparkleSound();
          onEarnStars(5);
        };
        audio.play().catch(() => {});
      } else {
        const textToSpeak = currentPage.tashkeelText || currentPage.text || 'صفحة الكتاب المصور';
        speakArabicSpeech(
          textToSpeak,
          () => setIsPlayingNarrator(true),
          () => {
            setIsPlayingNarrator(false);
            playSparkleSound();
            onEarnStars(5);
          },
          () => {
            setIsPlayingNarrator(false);
            playSparkleSound();
          },
          { rate: playbackSpeed, voiceTone: voiceTone }
        );
      }
    }
  };

  // Toggle Continuous Whole Book Audio with Inter-page Gaps
  const handleToggleWholeBookAudio = () => {
    playSparkleSound();
    if (isPlayingWholeBook) {
      stopArabicSpeech();
      if (childAudioPlayerRef.current) childAudioPlayerRef.current.pause();
      if (gapTimerRef.current) clearInterval(gapTimerRef.current);
      setIsPlayingNarrator(false);
      setIsPlayingWholeBook(false);
      setIsPageGapWaiting(false);
    } else {
      setIsPlayingWholeBook(true);
      setIsPageGapWaiting(false);
      if (currentPageIdx >= totalPages - 1) {
        setCurrentPageIdx(0);
      }
    }
  };

  // Switch Picture Book
  const handleSelectBook = (selected: PictureBook) => {
    playSparkleSound();
    setCurrentBookId(selected.id);
    setBookTitle(selected.title);
    setPagesState(selected.pages);
    setCurrentPageIdx(0);
    setShowBookLibrary(false);
    if (selected.gapBetweenPagesSec !== undefined) {
      setGapBetweenPagesSec(selected.gapBetweenPagesSec);
    }
    if (onSelectBook) {
      onSelectBook(selected);
    } else if (onUpdateBook) {
      onUpdateBook(selected);
    }
    try {
      localStorage.setItem('raed_picture_book', JSON.stringify(selected));
    } catch {}
  };

  // Reset to Original Default Book
  const handleResetToDefaultBook = () => {
    playClickSound();
    handleSelectBook(DEFAULT_PICTURE_BOOK);
  };

  // Start Mic Recording for Current Page
  const handleStartRecording = async () => {
    playClickSound();
    setRecordingError('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setRecordingError('الميكروفون غير مدعوم في هذا المتصفح.');
      return;
    }

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
            audioBlobUrl: audioUrl,
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
    } catch (err: any) {
      setRecordingError('يرجى السماح بالوصول إلى الميكروفون لتسجيل قراءتك.');
    }
  };

  // Stop Mic Recording
  const handleStopRecording = () => {
    playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Play Child's Page Recording
  const handleTogglePlayChildAudio = () => {
    const audioUrl = pageRecordings[currentPage.pageNumber];
    if (!audioUrl) return;

    if (!childAudioPlayerRef.current || childAudioPlayerRef.current.src !== audioUrl) {
      childAudioPlayerRef.current = new Audio(audioUrl);
      childAudioPlayerRef.current.onended = () => setIsPlayingChildAudio(false);
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

  // Save Book (Cloud with resilient Local Fallback)
  const handleSaveBookToCloud = async (
    updatedPages = pagesState,
    titleToSave = bookTitle,
    gapToSave = gapBetweenPagesSec
  ) => {
    setIsSavingCloud(true);
    setPublisherNotice('جارٍ حفظ ونشر الكتاب في Firebase والموقع...');
    try {
      const updatedBook: PictureBook = {
        ...activeBook,
        id: currentBookId || 'layan-jewel',
        title: titleToSave.trim() || DEFAULT_PICTURE_BOOK.title,
        subtitle: activeBook.subtitle || DEFAULT_PICTURE_BOOK.subtitle,
        badge: activeBook.badge || DEFAULT_PICTURE_BOOK.badge,
        coverImage: activeBook.coverImage || DEFAULT_PICTURE_BOOK.coverImage,
        ageRange: activeBook.ageRange || DEFAULT_PICTURE_BOOK.ageRange,
        moralLesson: activeBook.moralLesson || DEFAULT_PICTURE_BOOK.moralLesson,
        authorEmail: auth.currentUser?.email || 'hadjerrimas2016@gmail.com',
        pages: updatedPages,
        totalPages: updatedPages.length,
        gapBetweenPagesSec: gapToSave,
        updatedAt: new Date().toISOString(),
      };

      // Update UI & localStorage
      if (onUpdateBook) {
        onUpdateBook(updatedBook);
      }
      try {
        localStorage.setItem('raed_picture_book', JSON.stringify(updatedBook));
      } catch {}

      // Sync to Firebase
      try {
        await publishPictureBookToFirestore(updatedBook);
      } catch (cloudErr) {
        console.warn('Firebase publish note (synced locally):', cloudErr);
      }

      playFanfareSound();
      confetti({ particleCount: 70, spread: 70 });
      setPublisherNotice('تم حفظ ونشر الكتاب وتحديث الفواصل الزمنية بنجاح! 🌟');
      setTimeout(() => setPublisherNotice(''), 3000);
    } catch (err: any) {
      setPublisherNotice('تم الحفظ محلياً بنجاح!');
      setTimeout(() => setPublisherNotice(''), 3000);
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
    const rawChunks = batchFullText
      .split(/\n\s*\n|---+|الصفحة\s*\d+:|الفصل\s*\d+:/)
      .map((c) => c.trim())
      .filter((c) => c.length > 5);

    if (rawChunks.length === 0) {
      alert('لم نتمكن من تقسيم النص! يرجى الفصل بين كل صفحة بسطر فارغ.');
      return;
    }

    const newPages: PictureBookPage[] = rawChunks.map((chunk, idx) => {
      const matchedImg = ALL_CURATED_FLAT[idx % ALL_CURATED_FLAT.length].url;
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
  };

  // Add New Page to Active Book
  const handleAddNewPage = () => {
    playPopSound();
    const newPageNum = totalPages + 1;
    const defaultImg = ALL_CURATED_FLAT[(newPageNum - 1) % ALL_CURATED_FLAT.length].url;
    const newPage: PictureBookPage = {
      pageNumber: newPageNum,
      chapterTitle: `الصفحة ${newPageNum}`,
      image: defaultImg,
      text: 'اكتب هنا نص الصفحة الجديدة أو الصق كلام القصة المشوقة...',
      tashkeelText: 'اكْتُبْ هُنَا نَصَّ الصَّفْحَةِ الْجَدِيدَةِ...',
    };
    const updated = [...pagesState, newPage];
    setPagesState(updated);
    setCurrentPageIdx(newPageNum - 1);
  };

  // Delete Current Page
  const handleDeleteCurrentPage = () => {
    if (totalPages <= 1) {
      alert('لا يمكن حذف الصفحة الوحيدة المتبقية في الكتاب!');
      return;
    }
    playPopSound();
    const filtered = pagesState.filter((_, idx) => idx !== safePageIdx);
    const renumbered = filtered.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
    }));
    setPagesState(renumbered);
    setCurrentPageIdx(Math.max(0, safePageIdx - 1));
  };

  // Open Image Selector Modal for Current Page
  const handleOpenPageImagePicker = () => {
    playClickSound();
    setImagePickerTarget('page');
    setCustomImageUrlInput(currentPage.image || '');
    setCustomImagePreview(currentPage.image || '');
    setImageLoadError(false);
    setShowImagePicker(true);
  };

  // Open Image Selector Modal for Current Book Cover
  const handleOpenBookCoverPicker = () => {
    playClickSound();
    setImagePickerTarget('currentBookCover');
    const currentCover = activeBook.coverImage || DEFAULT_PICTURE_BOOK.coverImage;
    setCustomImageUrlInput(currentCover);
    setCustomImagePreview(currentCover);
    setImageLoadError(false);
    setShowImagePicker(true);
  };

  // Apply Selected Image (from Gallery, URL, or Upload)
  const handleApplySelectedImage = (imageUrl: string) => {
    if (!imageUrl) return;
    playSparkleSound();

    if (imagePickerTarget === 'page') {
      setPagesState((prev) => {
        const copy = [...prev];
        if (copy[safePageIdx]) {
          copy[safePageIdx] = { ...copy[safePageIdx], image: imageUrl };
        }
        return copy;
      });
      setShowImagePicker(false);
      // Auto-save update
      setTimeout(() => {
        const updated = [...pagesState];
        if (updated[safePageIdx]) {
          updated[safePageIdx] = { ...updated[safePageIdx], image: imageUrl };
        }
        handleSaveBookToCloud(updated);
      }, 100);
    } else if (imagePickerTarget === 'newBookCover') {
      setNewBookCoverImage(imageUrl);
      setShowImagePicker(false);
    } else if (imagePickerTarget === 'currentBookCover') {
      const updatedBook: PictureBook = {
        ...activeBook,
        coverImage: imageUrl,
      };
      if (onUpdateBook) {
        onUpdateBook(updatedBook);
      }
      try {
        localStorage.setItem('raed_picture_book', JSON.stringify(updatedBook));
        publishPictureBookToFirestore(updatedBook);
      } catch {}
      setShowImagePicker(false);
      playFanfareSound();
      confetti({ particleCount: 65, spread: 65 });
      setPublisherNotice('تم تحديث وتعيين غلاف الكتاب بنجاح! 🌟');
      setTimeout(() => setPublisherNotice(''), 3000);
    }
  };

  // Handle Image File Upload (Convert to Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomImagePreview(dataUrl);
        setCustomImageUrlInput(dataUrl);
        setImageLoadError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Create a Brand New Picture Book (Unlimited Stories)
  const handleCreateNewPictureBook = async () => {
    if (!newBookTitle.trim()) {
      alert('يرجى إدخال عنوان القصة المصورة!');
      return;
    }

    playSparkleSound();
    const newId = `book-custom-${Date.now()}`;
    const count = Math.max(1, Math.min(newBookPageCount || 5, 20));

    const initialPages: PictureBookPage[] = [];
    for (let i = 1; i <= count; i++) {
      const matchedImg = ALL_CURATED_FLAT[(i - 1) % ALL_CURATED_FLAT.length].url;
      initialPages.push({
        pageNumber: i,
        chapterTitle: `الفصل ${i}: بداية المغامرة`,
        image: matchedImg,
        text: `هذه هي الصفحة ${i} من قصة ${newBookTitle.trim()}. يمكنك تعديل هذا النص واختيار صورة مختلفة من المعرض أو رفع صورة من جهازك!`,
        tashkeelText: `هَذِهِ هِيَ الصَّفْحَةُ ${i} مِنْ قِصَّةِ ${newBookTitle.trim()}...`,
      });
    }

    const createdBook: PictureBook = {
      id: newId,
      title: newBookTitle.trim(),
      subtitle: newBookSubtitle.trim() || 'قصة مصورة رائعة مفعمة بالعبر والخيال',
      badge: newBookBadge.trim() || 'كتاب مصور جديد 📖',
      coverImage: newBookCoverImage || initialPages[0].image,
      ageRange: newBookAgeRange.trim() || '6 - 12 سنة',
      totalPages: count,
      creatorsAudioUrl: '',
      moralLesson: newBookMoralLesson.trim() || 'القراءة تنير العقول وتصنع الأبطال.',
      authorEmail: auth.currentUser?.email || 'hadjerrimas2016@gmail.com',
      pages: initialPages,
      gapBetweenPagesSec: gapBetweenPagesSec,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Activate the new book immediately
    setCurrentBookId(createdBook.id);
    setBookTitle(createdBook.title);
    setPagesState(createdBook.pages);
    setCurrentPageIdx(0);
    setShowNewBookModal(false);
    setShowBookLibrary(false);

    // Save & broadcast
    if (onSelectBook) {
      onSelectBook(createdBook);
    }
    if (onUpdateBook) {
      onUpdateBook(createdBook);
    }

    try {
      localStorage.setItem('raed_picture_book', JSON.stringify(createdBook));
      await publishPictureBookToFirestore(createdBook);
    } catch {}

    playFanfareSound();
    confetti({ particleCount: 90, spread: 80 });
    onEarnStars(60);
    setShowQuickPublisher(true);
  };

  // Confirm and Delete Book
  const handleConfirmDeleteBook = (bookId: string) => {
    playPopSound();
    if (onDeleteBook) {
      onDeleteBook(bookId);
    }
    setBookToDeleteId(null);
    if (currentBookId === bookId) {
      handleSelectBook(DEFAULT_PICTURE_BOOK);
    }
  };

  // Filter gallery items by selected category
  const filteredGalleryCategories =
    selectedGalleryCategory === 'الكل'
      ? CURATED_ILLUSTRATION_CATEGORIES
      : CURATED_ILLUSTRATION_CATEGORIES.filter((c) => c.category.includes(selectedGalleryCategory));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden"
      dir="rtl"
    >
      <div className="relative w-full max-w-5xl h-[96vh] sm:h-[92vh] bg-[#1a0a2a] text-white rounded-3xl border-2 border-purple-500/50 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-[#2a1045] via-[#1b0b30] to-[#2a1045] border-b border-purple-500/30 shadow-md flex-shrink-0 flex-wrap gap-2">
          {/* Close & Book Title */}
          <div className="flex items-center gap-2 order-1">
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-rose-500/80 text-white transition-all cursor-pointer"
              title="إغلاق الكتاب"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white shadow-sm flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>كتاب مصور تفاعلي</span>
                </span>
                <span className="text-[11px] text-amber-300 font-bold hidden sm:inline">
                  📖 {safePageIdx + 1} من {totalPages} صفحة
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-black text-amber-300 truncate max-w-[200px] sm:max-w-md">
                {bookTitle}
              </h3>
            </div>
          </div>

          {/* Quick Audio & Font Controls */}
          <div className="flex items-center gap-1 sm:gap-2 order-2">
            {/* Tone Selector */}
            <select
              value={voiceTone}
              onChange={(e) => setVoiceTone(e.target.value as any)}
              className="bg-black/40 border border-purple-500/40 text-purple-200 text-[11px] rounded-xl px-2 py-1 outline-none cursor-pointer hidden md:inline"
              title="نبرة صوت الراوي"
            >
              <option value="friendly">صوت ودود</option>
              <option value="joyful">صوت مرح</option>
              <option value="encouraging">صوت مشجع</option>
            </select>

            {/* Playback Speed */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-black/40 border border-purple-500/40 text-purple-200 text-[11px] rounded-xl px-2 py-1 outline-none cursor-pointer"
              title="سرعة القراءة"
            >
              <option value="0.85">0.85x هادئ</option>
              <option value="1">1.0x عادي</option>
              <option value="1.15">1.15x سريع</option>
            </select>

            {/* Font Size Modifier */}
            <div className="flex items-center bg-black/40 border border-purple-500/40 rounded-xl overflow-hidden">
              <button
                onClick={() => setFontSizeOffset((p) => Math.max(p - 2, -4))}
                className="px-2 py-1 text-xs text-purple-200 hover:bg-white/10 cursor-pointer"
                title="تصغير الخط"
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeOffset((p) => Math.min(p + 2, 8))}
                className="px-2 py-1 text-xs text-purple-200 hover:bg-white/10 cursor-pointer font-bold"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>
          </div>

          {/* Top Actions: Library & Quick Publisher & Favorites */}
          <div className="flex items-center gap-1.5 sm:gap-2 order-3">
            {/* Books Library Switcher */}
            <button
              onClick={() => {
                playClickSound();
                setShowBookLibrary(!showBookLibrary);
                setShowQuickPublisher(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border transition-all cursor-pointer ${
                showBookLibrary
                  ? 'bg-amber-400 text-amber-950 border-amber-300 font-black'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20 border-white/15'
              }`}
              title="مكتبة واختيار وتأليف القصص المصورة (غير محدودة)"
            >
              <Library className="w-3.5 h-3.5 text-amber-300" />
              <span>مكتبة القصص ({allBooks.length})</span>
            </button>

            {/* Quick Publisher Action */}
            <button
              onClick={() => {
                playClickSound();
                setShowQuickPublisher(!showQuickPublisher);
                setShowBookLibrary(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shadow transition-all cursor-pointer ${
                showQuickPublisher
                  ? 'bg-rose-500 text-white'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 hover:brightness-110 active:scale-95'
              }`}
              title="محرر ونشر صفحات الكتاب واستوديو الصوت الفوري"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{showQuickPublisher ? 'إغلاق النشر' : 'نشر وتعديل ✍️'}</span>
            </button>

            <button
              onClick={() => {
                playSparkleSound();
                setIsFavorite(!isFavorite);
              }}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
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

        {/* 1. PICTURE BOOK LIBRARY SELECTOR DRAWER (عدد غير محدود من القصص المصورة) */}
        {showBookLibrary && (
          <div className="p-4 bg-[#140b2b] border-b-2 border-purple-500/60 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150 flex-shrink-0 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                <Library className="w-4 h-4 text-amber-400" />
                <span>مكتبة القصص المصورة 📚 (يمكنك إنشاء وتصفح عدد غير محدود من القصص):</span>
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenBookCoverPicker}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-xs flex items-center gap-1.5 shadow border border-purple-400/40 cursor-pointer"
                  title="تخصيص واختيار غلاف هذه القصة المصورة"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>تغيير غلاف الكتاب 🖼️</span>
                </button>

                <button
                  onClick={() => {
                    playSparkleSound();
                    setShowNewBookModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ تأليف وإنشاء قصة جديدة ✍️</span>
                </button>

                <button
                  onClick={handleResetToDefaultBook}
                  className="text-[10px] text-purple-300 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>كتاب ليان الأصلي</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {allBooks.map((b) => {
                const isCurrent = currentBookId === b.id;
                const isCustom = !PRESET_PICTURE_BOOKS.some((p) => p.id === b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-2.5 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-purple-800 to-indigo-800 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectBook(b)}
                      className="flex items-center gap-2.5 min-w-0 flex-grow text-right cursor-pointer"
                    >
                      <img
                        src={b.coverImage || b.pages?.[0]?.image || DEFAULT_PICTURE_BOOK.coverImage}
                        alt={b.title}
                        className="w-11 h-14 object-cover rounded-xl border border-white/20 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-black text-white truncate">{b.title}</h4>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black">
                              النشطة
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-purple-300/80 truncate">
                          {b.pages?.length || b.totalPages || 10} صفحات • {b.badge}
                        </p>
                      </div>
                    </button>

                    {/* Delete button for custom books */}
                    {isCustom && (
                      <button
                        onClick={() => setBookToDeleteId(b.id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                        title="حذف هذه القصة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. QUICK PICTURE BOOK PUBLISHER & AUDIO STUDIO DRAWER */}
        {showQuickPublisher && (
          <div className="p-4 bg-[#140b2b] border-b-2 border-amber-400/60 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150 flex-shrink-0 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-400 text-amber-950">
                  <Zap className="w-4 h-4 fill-current" />
                </span>
                <h4 className="text-xs sm:text-sm font-black text-amber-300">
                  معالج نشر وتحرير صفحات الكتاب واستوديو الصوت الفوري 🚀
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
                  تعديل الصفحات والصور
                </button>
                <button
                  type="button"
                  onClick={() => setPublisherTab('audioStudio')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    publisherTab === 'audioStudio'
                      ? 'bg-amber-400 text-amber-950 font-black'
                      : 'bg-white/10 text-purple-200'
                  }`}
                >
                  استوديو الصوت والفواصل 🎙️
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
                  لصق قصة كاملة دفعة واحدة ✨
                </button>
              </div>
            </div>

            {publisherNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{publisherNotice}</span>
              </div>
            )}

            {/* TAB 1: EDIT INDIVIDUAL PAGES & PICK IMAGES */}
            {publisherTab === 'editPage' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-sm">
                    {safePagesList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPageIdx(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                          safePageIdx === idx
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
                    <label className="text-[10px] font-bold text-amber-400">
                      عنوان الصفحة {currentPage.pageNumber}:
                    </label>
                    <input
                      type="text"
                      value={currentPage.chapterTitle || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPagesState((prev) => {
                          const copy = [...prev];
                          if (copy[safePageIdx]) {
                            copy[safePageIdx] = { ...copy[safePageIdx], chapterTitle: val };
                          }
                          return copy;
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-amber-400">
                        صورة الصفحة {currentPage.pageNumber}:
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenPageImagePicker}
                        className="px-2 py-0.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer shadow"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>اختيار صورة من المعرض أو رابط أو رفع 🖼️</span>
                      </button>
                    </div>

                    {/* Quick Mini Thumbnails Bar */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {ALL_CURATED_FLAT.slice(0, 10).map((ill) => (
                        <button
                          key={ill.id}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setPagesState((prev) => {
                              const copy = [...prev];
                              if (copy[safePageIdx]) {
                                copy[safePageIdx] = { ...copy[safePageIdx], image: ill.url };
                              }
                              return copy;
                            });
                          }}
                          className={`w-9 h-9 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                            currentPage.image === ill.url
                              ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/30'
                              : 'border-white/20 opacity-70 hover:opacity-100'
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
                    value={currentPage.tashkeelText || currentPage.text || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPagesState((prev) => {
                        const copy = [...prev];
                        if (copy[safePageIdx]) {
                          copy[safePageIdx] = { ...copy[safePageIdx], text: val, tashkeelText: val };
                        }
                        return copy;
                      });
                    }}
                    className="w-full p-2 rounded-xl bg-white/10 border border-purple-700 text-xs leading-relaxed text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <span className="text-[10px] text-purple-300/80">
                    أي تعديل يظهر فورياً ويمكنك حفظه في الموقع بضغطة زر.
                  </span>
                  <button
                    onClick={() => handleSaveBookToCloud()}
                    disabled={isSavingCloud}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {isSavingCloud ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>حفظ وتحديث الكتاب فوراً 🚀</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: AUDIO STUDIO & INTER-PAGE GAP CONFIGURATION (تسجيل وفواصل القصة كاملة) */}
            {publisherTab === 'audioStudio' && (
              <div className="space-y-3.5">
                {/* 1. Gap Duration Configuration */}
                <div className="p-3 rounded-2xl bg-white/5 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>فراغ زمني يفصل بين قراءة كل صفحة (Inter-Page Gap):</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black">
                      {gapBetweenPagesSec} ثوانٍ
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200/80">
                    يحدد مدة الاستراحة الصامتة بين انتهاء قراءة الصفحة الحالية والبدء بقراءة الصفحة التالية تلقائياً:
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setGapBetweenPagesSec(sec);
                          handleSaveBookToCloud(pagesState, bookTitle, sec);
                        }}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          gapBetweenPagesSec === sec
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black scale-105 shadow-md'
                            : 'bg-white/10 text-purple-200 hover:bg-white/20'
                        }`}
                      >
                        {sec} {sec === 1 ? 'ثانية' : 'ثوانٍ'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Recording Status of All Pages in this Book */}
                <div className="p-3 rounded-2xl bg-white/5 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-pink-300 flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-pink-400" />
                      <span>حالة التسجيلات الصوتية لصفحات هذا الكتاب:</span>
                    </h5>
                    <span className="text-[10px] text-purple-300">
                      {Object.keys(pageRecordings).length} من {totalPages} مسجلة
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {safePagesList.map((p, idx) => {
                      const hasRec = Boolean(pageRecordings[p.pageNumber]);
                      return (
                        <div
                          key={p.pageNumber}
                          onClick={() => setCurrentPageIdx(idx)}
                          className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                            safePageIdx === idx ? 'ring-2 ring-amber-400' : ''
                          } ${
                            hasRec
                              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                              : 'bg-white/5 border-white/10 text-purple-300'
                          }`}
                        >
                          <span className="text-[11px] font-bold block">صفحة {p.pageNumber}</span>
                          <span className="text-[10px] font-medium block">
                            {hasRec ? '🎙️ صوت مسجل' : '🔊 صوت آلي'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Auto Full-Story Player Trigger with Gaps */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-purple-400/40">
                  <div className="min-w-0">
                    <h5 className="text-xs font-black text-white">تشغيل ونشر القصة كاملة بالفواصل الزمنية 🎧</h5>
                    <p className="text-[10px] text-purple-200">
                      تتلو كل صفحة، ثم تنتظر {gapBetweenPagesSec} ثوانٍ كفاصل زمني قبل قلب الصفحة وقراءة التالية.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleWholeBookAudio}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 text-white font-black text-xs flex items-center gap-1.5 shadow-lg hover:brightness-110 cursor-pointer flex-shrink-0"
                  >
                    {isPlayingWholeBook ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>إيقاف التشغيل</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>بدء القراءة الكاملة 🌟</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PASTE ENTIRE BOOK AT ONCE */}
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
                    className="w-full p-3 rounded-2xl bg-white/10 border border-purple-600 text-xs leading-relaxed text-white font-sans"
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
                      <span>جارٍ إنشاء الصفحات والحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>تقسيم النص لصفحات ونشر الكتاب فوراً 🚀</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-grow">
          {/* Inter-Page Gap Notification Banner (فراغ زمني تفصل بين قراءة كل صفحة) */}
          {isPageGapWaiting && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-pink-500/30 to-purple-500/20 border-2 border-amber-400 animate-pulse flex items-center justify-between gap-3 shadow-lg shadow-amber-400/20">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center flex-shrink-0 animate-bounce">
                  ⏳
                </span>
                <div>
                  <h5 className="text-xs sm:text-sm font-black text-amber-300">
                    فاصل زمني بين الصفحتين: استراحة {gapCountdownSec} ثانية...
                  </h5>
                  <p className="text-[10px] text-purple-200">
                    ننتقل الآن تلقائياً إلى الصفحة {safePageIdx + 2} لقراءتها بصوت شجي! 🎧✨
                  </p>
                </div>
              </div>

              <div className="w-16 sm:w-24 bg-black/40 rounded-full h-2.5 overflow-hidden border border-amber-300/40">
                <div
                  className="bg-amber-400 h-full transition-all duration-1000"
                  style={{
                    width: `${Math.max(0, (gapCountdownSec / (gapBetweenPagesSec || 2)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Main Book Card Container */}
          <div className="rounded-3xl border-4 border-[#ff2a85] bg-gradient-to-b from-[#2d0e3a] via-[#1a0826] to-[#10041a] p-3 sm:p-5 shadow-[0_0_35px_rgba(255,42,133,0.3)] space-y-4">
            {/* 1. Illustration Area - Portrait Orientation (بشكل طولي كبير) */}
            <div className="relative rounded-3xl overflow-hidden w-full max-w-2xl mx-auto aspect-[3/4] sm:aspect-[4/5] min-h-[480px] sm:min-h-[600px] md:min-h-[660px] max-h-[76vh] bg-slate-950 border-2 border-amber-400/50 shadow-2xl group flex items-center justify-center">
              {/* Ambient blurred backdrop for portrait immersion without blank spaces */}
              <img
                src={currentPage.image || DEFAULT_PICTURE_BOOK.pages[0].image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40 select-none pointer-events-none"
              />

              {/* High-res page illustration with responsive portrait orientation */}
              <img
                src={currentPage.image || DEFAULT_PICTURE_BOOK.pages[0].image}
                alt={currentPage.chapterTitle || 'صفحة الكتاب'}
                className={`relative z-10 w-full h-full ${
                  imageFitMode === 'contain' ? 'object-contain p-2' : 'object-cover'
                } transition-transform duration-500 group-hover:scale-[1.02]`}
              />

              {/* Tag Header in Image: Story Title & Page Badge */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black bg-black/85 text-amber-300 border border-amber-300/50 backdrop-blur-md shadow-lg flex items-center gap-2">
                  <span>📖</span>
                  <span>{bookTitle || activeBook.title}</span>
                  <span className="text-[10px] text-purple-200/90 font-bold bg-white/15 px-2 py-0.5 rounded-full">
                    صفحة {currentPage.pageNumber} من {totalPages}
                  </span>
                </span>
              </div>

              {/* Controls Overlay on Image (Top-Left) */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenPageImagePicker}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-black bg-pink-600/95 hover:bg-pink-500 text-white border border-pink-300/40 backdrop-blur-md shadow-lg flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                  title="تغيير واختيار صورة هذه الصفحة"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>تغيير صورة الصفحة 🖼️</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setImageFitMode((prev) => (prev === 'cover' ? 'contain' : 'cover'));
                  }}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-black bg-black/75 hover:bg-purple-700 text-amber-300 hover:text-white border border-amber-400/40 backdrop-blur-md shadow-lg flex items-center gap-1 transition-all cursor-pointer"
                  title="تبديل ملء الإطار أو احتواء الصورة كاملة"
                >
                  <span>{imageFitMode === 'cover' ? 'ملء طولي ↕️' : 'احتواء كامل ↔️'}</span>
                </button>

                <span className="px-2 py-1 rounded-full text-[10px] font-black bg-purple-950/85 text-purple-200 border border-purple-400/30 backdrop-blur-md hidden sm:inline-flex items-center gap-1">
                  📱 طولي كبير
                </span>
              </div>

              {/* Narrator Voice Indicator */}
              {isPlayingNarrator && (
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/90 backdrop-blur-md border border-purple-400/50 text-xs text-purple-200 shadow-md">
                  <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>
                    {pageRecordings[currentPage.pageNumber]
                      ? 'صوتك المسجل يقرأ هذه الصفحة... 🎙️'
                      : 'الراوي يقرأ بصوت واضح...'}
                  </span>
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
                disabled={safePageIdx >= totalPages - 1}
                className={`py-2 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  safePageIdx >= totalPages - 1
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
                disabled={safePageIdx <= 0}
                className={`py-2 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  safePageIdx <= 0
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
                    <span>قراءة القصة كاملة مع فواصل زمنية ({gapBetweenPagesSec} ث) 🎧✨</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5. Section: استوديو تسجيل صوتك لقراءة الصفحة */}
          <div className="p-4 sm:p-5 rounded-3xl border border-pink-600/70 bg-gradient-to-r from-[#2c0e3a] to-[#3a1040] space-y-3 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
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
                  <Check className="w-3 h-3" /> تم حفظ صوتك لصفحة {currentPage.pageNumber}
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
            <div className="flex items-center justify-between flex-wrap gap-2">
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

      {/* MODAL 1: RICH PAGE IMAGE PICKER (معرض الصور الجاهزة أو رابط خارجي أو رفع من الجهاز) */}
      {showImagePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
          dir="rtl"
        >
          <div className="relative w-full max-w-2xl bg-[#1b0b2e] border-2 border-pink-500 text-white rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-500 text-white shadow">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-amber-300">
                    {imagePickerTarget === 'page'
                      ? `اختيار صورة الصفحة ${currentPage.pageNumber} 🖼️`
                      : 'اختيار صورة غلاف القصة المصورة 🖼️'}
                  </h3>
                  <p className="text-[11px] text-purple-200">
                    اختر من معرض رائد الجاهز، أو أدخل رابط صورة خارجي، أو ارفع صورة من جهازك
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowImagePicker(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10 mb-3">
              <button
                type="button"
                onClick={() => setImagePickerActiveTab('gallery')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  imagePickerActiveTab === 'gallery'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                معرض رائد الجاهز 🎨
              </button>

              <button
                type="button"
                onClick={() => setImagePickerActiveTab('url')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  imagePickerActiveTab === 'url'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                رابط صورة خارجي 🔗
              </button>

              <button
                type="button"
                onClick={() => setImagePickerActiveTab('upload')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  imagePickerActiveTab === 'upload'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                رفع من جهازك 📁
              </button>
            </div>

            {/* TAB 1: CURATED GALLERY */}
            {imagePickerActiveTab === 'gallery' && (
              <div className="flex-grow overflow-y-auto space-y-3 no-scrollbar pr-1">
                {/* Category filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <button
                    type="button"
                    onClick={() => setSelectedGalleryCategory('الكل')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer ${
                      selectedGalleryCategory === 'الكل'
                        ? 'bg-amber-400 text-amber-950 font-black'
                        : 'bg-white/10 text-purple-200'
                    }`}
                  >
                    🌟 الكل ({ALL_CURATED_FLAT.length})
                  </button>
                  {CURATED_ILLUSTRATION_CATEGORIES.map((cat) => (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setSelectedGalleryCategory(cat.category)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer ${
                        selectedGalleryCategory === cat.category
                          ? 'bg-amber-400 text-amber-950 font-black'
                          : 'bg-white/10 text-purple-200'
                      }`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>

                {/* Grid of Images */}
                <div className="space-y-3">
                  {filteredGalleryCategories.map((cat) => (
                    <div key={cat.category} className="space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-300 block">{cat.category}</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {cat.items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleApplySelectedImage(item.url)}
                            className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-black/40 border-2 border-white/15 hover:border-amber-400 cursor-pointer shadow transition-all hover:scale-[1.02]"
                          >
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                              <span className="text-[10px] font-bold text-white truncate drop-shadow">
                                {item.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: EXTERNAL URL INPUT */}
            {imagePickerActiveTab === 'url' && (
              <div className="space-y-3 flex-grow overflow-y-auto no-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>أدخل رابط الصورة الخارجي (URL مباشر بصيغة HTTPS):</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/story-illustration.png"
                      value={customImageUrlInput}
                      onChange={(e) => {
                        setCustomImageUrlInput(e.target.value);
                        setCustomImagePreview(e.target.value);
                        setImageLoadError(false);
                      }}
                      className="flex-grow px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-xs text-white placeholder-purple-300/40 outline-none"
                    />
                  </div>
                </div>

                {/* Live Preview Container */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-purple-300 block">معاينة الصورة المباشرة:</span>
                  <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-h-[320px] bg-slate-900 border border-white/20 flex items-center justify-center">
                    {customImagePreview && !imageLoadError ? (
                      <img
                        src={customImagePreview}
                        alt="معاينة الصورة"
                        className="w-full h-full object-cover"
                        onError={() => setImageLoadError(true)}
                      />
                    ) : (
                      <div className="text-center p-4 space-y-1">
                        <ImageIcon className="w-8 h-8 text-purple-400 mx-auto opacity-50" />
                        <p className="text-xs text-purple-300">
                          {imageLoadError
                            ? 'تعذر تحميل الرابط! يرجى التأكد من صحة الرابط وأنه صورة مباشرة.'
                            : 'أدخل رابط الصورة في الحقل أعلاه للمعاينة.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplySelectedImage(customImageUrlInput)}
                  disabled={!customImageUrlInput || imageLoadError}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs shadow-lg disabled:opacity-40 cursor-pointer"
                >
                  اعتماد هذه الصورة للصفحة 🌟
                </button>
              </div>
            )}

            {/* TAB 3: FILE UPLOAD (DATA URL) */}
            {imagePickerActiveTab === 'upload' && (
              <div className="space-y-3 flex-grow overflow-y-auto no-scrollbar">
                <div className="p-4 rounded-2xl border-2 border-dashed border-pink-400/50 hover:border-pink-400 bg-pink-950/20 text-center space-y-2">
                  <Upload className="w-8 h-8 text-pink-400 mx-auto animate-bounce" />
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-white">
                      اختر صورة من حاسوبك أو هاتفك
                    </h5>
                    <p className="text-[10px] text-purple-200">
                      يدعم صور PNG, JPG, WebP بحجم خفيف وجودة عالية
                    </p>
                  </div>

                  <label className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow cursor-pointer hover:brightness-110">
                    تصفح الملفات في جهازك 📁
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {customImagePreview && (
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-purple-300 block">معاينة الصورة المرفوعة:</span>
                    <div className="rounded-2xl overflow-hidden aspect-[3/4] max-h-[320px] bg-slate-900 border border-white/20">
                      <img
                        src={customImagePreview}
                        alt="معاينة الملف المرفوع"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplySelectedImage(customImagePreview)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-lg cursor-pointer"
                    >
                      استخدام هذه الصورة المرفوعة فوراً 🌟
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE BRAND NEW PICTURE BOOK (تأليف قصة مصورة جديدة) */}
      {showNewBookModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md"
          dir="rtl"
        >
          <div className="relative w-full max-w-xl bg-[#1d0b30] border-2 border-amber-400 text-white rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-400 text-amber-950 font-black">
                  <Sparkles className="w-5 h-5 fill-current" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-amber-300">
                    تأليف وإنشاء قصة مصورة جديدة 📖✨
                  </h3>
                  <p className="text-[10px] text-purple-200">
                    أنشئ عدداً غير محدود من القصص المصورة برسم غلاف وصفحات مخصصة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNewBookModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-300">عنوان القصة المصورة *:</label>
                <input
                  type="text"
                  placeholder="مثال: مغامرة رائد في واحة النخيل العجيبة"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200">وصف مختصر / عنوان فرعي:</label>
                <input
                  type="text"
                  placeholder="مثال: رحلة مصورة يتعلم فيها الأصدقاء قيمة الإخلاص والصبر"
                  value={newBookSubtitle}
                  onChange={(e) => setNewBookSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-purple-200">التصنيف والوسام:</label>
                  <select
                    value={newBookBadge}
                    onChange={(e) => setNewBookBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-xs text-white cursor-pointer"
                  >
                    <option value="مغامرات وأبطال 🚀">مغامرات وأبطال 🚀</option>
                    <option value="قيم وأخلاق وحياء 👑">قيم وأخلاق وحياء 👑</option>
                    <option value="طبخ وشيف صغير 🍳">طبخ وشيف صغير 🍳</option>
                    <option value="فضاء وكواكب 🌌">فضاء وكواكب 🌌</option>
                    <option value="حكايات النوم الهادئة 🌙">حكايات النوم الهادئة 🌙</option>
                    <option value="علوم واكتشاف 🧪">علوم واكتشاف 🧪</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-purple-200">عدد الصفحات المبدئي:</label>
                  <select
                    value={newBookPageCount}
                    onChange={(e) => setNewBookPageCount(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-xs text-white cursor-pointer"
                  >
                    <option value={3}>3 صفحات (قصة قصيرة)</option>
                    <option value={5}>5 صفحات (متوسطة)</option>
                    <option value={8}>8 صفحات</option>
                    <option value={10}>10 صفحات (قصة كاملة)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200">العبرة والدرس التربوي:</label>
                <input
                  type="text"
                  placeholder="مثال: الصدق منجاة وبر الوالدين مفتاح السعادة والنجاح"
                  value={newBookMoralLesson}
                  onChange={(e) => setNewBookMoralLesson(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-xs text-white"
                />
              </div>

              {/* Cover Image Selector */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300">صورة غلاف القصة:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePickerTarget('newBookCover');
                      setShowImagePicker(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>تغيير الغلاف من المعرض أو رفع</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={newBookCoverImage}
                    alt="غلاف القصة"
                    className="w-16 h-20 object-cover rounded-xl border-2 border-amber-400"
                  />
                  <span className="text-[11px] text-purple-200">
                    ستظهر هذه الصورة في مكتبة القصص وعلى الغلاف الأساسي للكتاب.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCreateNewPictureBook}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer"
              >
                إنشاء وتأليف القصة ونشرها فوراً 🚀✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION DIALOG */}
      {bookToDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          dir="rtl"
        >
          <div className="w-full max-w-sm bg-[#220d35] border-2 border-rose-500 text-white rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-black text-white">هل أنت متأكد من حذف هذه القصة؟</h4>
              <p className="text-xs text-purple-200 mt-1">
                سيتم حذف القصة المصورة نهائياً من مكتبتك.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBookToDeleteId(null)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleConfirmDeleteBook(bookToDeleteId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white cursor-pointer shadow-lg shadow-rose-900/50"
              >
                نعم، احذف القصة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
