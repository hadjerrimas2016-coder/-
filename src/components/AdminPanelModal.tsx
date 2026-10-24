import React, { useState, useEffect } from 'react';
import { Story, PictureBook, AppMode, SunnahItem, SunnahType, HeroVideoSettings, DEFAULT_HERO_VIDEO } from '../types';
import { CATEGORIES_LIST } from '../data/storiesData';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Download,
  Upload,
  Layers,
  Lock,
  LogIn,
  LogOut,
  RefreshCw,
  Music,
  CheckCircle2,
  AlertCircle,
  Database,
  Code2,
  HelpCircle,
  FileText,
  Flame,
  Send,
  Eye,
  Copy,
  Video,
  Globe,
  ExternalLink,
  Film,
  Play,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSparkleSound, playClickSound, playPopSound, playFanfareSound } from '../utils/audio';
import {
  auth,
  isOwnerAdmin,
  loginWithGoogle,
  logoutUser,
  publishStoryToFirestore,
  removeStoryFromFirestore,
  publishPictureBookToFirestore,
  publishSunnahToFirestore,
  removeSunnahFromFirestore,
  publishHeroVideoToFirestore
} from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AdminPanelModalProps {
  mode: AppMode;
  stories: Story[];
  pictureBook: PictureBook;
  sunnahItems?: SunnahItem[];
  heroVideoSettings?: HeroVideoSettings;
  onSaveHeroVideo?: (settings: HeroVideoSettings) => void;
  onClose: () => void;
  onSaveStory: (story: Story) => void;
  onDeleteStory: (storyId: string) => void;
  onSavePictureBook: (book: PictureBook) => void;
  onSaveSunnahItem?: (item: SunnahItem) => void;
  onDeleteSunnahItem?: (id: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  mode,
  stories,
  pictureBook,
  sunnahItems = [],
  heroVideoSettings,
  onSaveHeroVideo,
  onClose,
  onSaveStory,
  onDeleteStory,
  onSavePictureBook,
  onSaveSunnahItem,
  onDeleteSunnahItem,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'firebaseGuide' | 'heroVideo' | 'manage' | 'create' | 'pictureBook' | 'sunnah' | 'rawStudio'>('firebaseGuide');
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    playPopSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Story Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Story['category']>('shahrazad');
  const [ageRange, setAgeRange] = useState('6 - 10 سنوات');
  const [duration, setDuration] = useState('08:00');
  const [badge, setBadge] = useState('قصة مميزة');
  const [coverImage, setCoverImage] = useState('/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png');
  const [description, setDescription] = useState('');
  const [moralLesson, setMoralLesson] = useState('');
  const [page1Text, setPage1Text] = useState('');
  const [page2Text, setPage2Text] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOption1, setQuizOption1] = useState('');
  const [quizOption2, setQuizOption2] = useState('');
  const [quizOption3, setQuizOption3] = useState('');

  // Picture Book Form state
  const [bookTitle, setBookTitle] = useState(pictureBook.title);
  const [bookSubtitle, setBookSubtitle] = useState(pictureBook.subtitle);
  const [bookAudioUrl, setBookAudioUrl] = useState(pictureBook.creatorsAudioUrl || '');
  const [bookMoralLesson, setBookMoralLesson] = useState(pictureBook.moralLesson);
  const [editingPageIndex, setEditingPageIndex] = useState<number>(0);
  const [pagesState, setPagesState] = useState(pictureBook.pages);

  // Raw Firebase JSON Publisher state
  const [targetCollection, setTargetCollection] = useState<string>('stories');
  const [rawDocumentId, setRawDocumentId] = useState(`story_custom_${Date.now().toString().slice(-4)}`);
  const [rawJsonContent, setRawJsonContent] = useState<string>(
    JSON.stringify(
      {
        title: 'مغامرة رائد وسفينة النجوم',
        subtitle: 'رحلة استكشافية خيالية',
        category: 'space',
        categoryLabel: 'مغامرات الفضاء',
        categoryIcon: '🚀',
        ageRange: '5 - 9 سنوات',
        duration: '06:00',
        badge: 'جديد',
        coverImage: '/assets/aistudio/27fbd6f6-d049-4f8d-9848-74312646d933_b4e7b8ad.png',
        description: 'ينطلق رائد في مركبته الفضائية ليكتشف لغز الكواكب اللامعة في مجرة الأحلام.',
        highlightText: 'قصة تفاعلية موثقة للأطفال',
        moralLesson: 'الفضول العلمي وحب الاستكشاف هما سر التقدم.',
        pages: [
          { text: 'عدّ رائد ثلاثة، اثنان، واحد... وانطلق الصاروخ نحو النجوم اللامعة!' },
          { text: 'هناك التقى بنجم صغير أرشده إلى طريق العودة حاملاً أحلى الذكريات.' }
        ],
        quiz: [
          {
            question: 'إلى أين انطلق رائد بمركبته؟',
            options: ['نحو النجوم اللامعة', 'تحت أعماق البحر', 'إلى قمة الشجرة'],
            correctIndex: 0,
            explanation: 'أحسنت! انطلق رائد نحو النجوم الفضائية.'
          }
        ]
      },
      null,
      2
    )
  );

  // Sunnah Corner Form states
  const [sunnahTitle, setSunnahTitle] = useState('');
  const [sunnahSubtitle, setSunnahSubtitle] = useState('');
  const [sunnahType, setSunnahType] = useState<SunnahType>('duaa');
  const [sunnahCategory, setSunnahCategory] = useState<SunnahItem['category']>('daily');
  const [sunnahArabicText, setSunnahArabicText] = useState('');
  const [sunnahExplanation, setSunnahExplanation] = useState('');
  const [sunnahVirtue, setSunnahVirtue] = useState('');
  const [sunnahRepeatCount, setSunnahRepeatCount] = useState<number>(1);
  const [sunnahIcon, setSunnahIcon] = useState('🤲');
  const [sunnahBadge, setSunnahBadge] = useState('دعاء مبارك');
  const [sunnahIsDaily, setSunnahIsDaily] = useState<boolean>(true);
  const [editingSunnahId, setEditingSunnahId] = useState<string | null>(null);

  // Hero Video Banner Form State
  const [videoEnabled, setVideoEnabled] = useState<boolean>(heroVideoSettings?.enabled ?? true);
  const [videoUrl, setVideoUrl] = useState<string>(heroVideoSettings?.videoUrl || DEFAULT_HERO_VIDEO.videoUrl);
  const [videoTitle, setVideoTitle] = useState<string>(heroVideoSettings?.title || DEFAULT_HERO_VIDEO.title);
  const [videoSubtitle, setVideoSubtitle] = useState<string>(heroVideoSettings?.subtitle || DEFAULT_HERO_VIDEO.subtitle);
  const [videoBadge, setVideoBadge] = useState<string>(heroVideoSettings?.badge || DEFAULT_HERO_VIDEO.badge);
  const [videoAutoPlay, setVideoAutoPlay] = useState<boolean>(heroVideoSettings?.autoPlay ?? true);
  const [videoLoop, setVideoLoop] = useState<boolean>(heroVideoSettings?.loop ?? true);

  useEffect(() => {
    if (heroVideoSettings) {
      setVideoEnabled(heroVideoSettings.enabled);
      setVideoUrl(heroVideoSettings.videoUrl);
      setVideoTitle(heroVideoSettings.title);
      setVideoSubtitle(heroVideoSettings.subtitle);
      setVideoBadge(heroVideoSettings.badge);
      setVideoAutoPlay(heroVideoSettings.autoPlay);
      setVideoLoop(heroVideoSettings.loop);
    }
  }, [heroVideoSettings]);

  const handleSaveHeroVideoSettings = async () => {
    if (!isAdmin) {
      alert('فقط مالك المنصة يملك صلاحية تعديل وحفظ إعدادات الفيديو والنطاق!');
      return;
    }
    setIsSavingCloud(true);
    const updatedSettings: HeroVideoSettings = {
      enabled: videoEnabled,
      videoUrl: videoUrl.trim() || DEFAULT_HERO_VIDEO.videoUrl,
      title: videoTitle.trim() || DEFAULT_HERO_VIDEO.title,
      subtitle: videoSubtitle.trim() || DEFAULT_HERO_VIDEO.subtitle,
      badge: videoBadge.trim() || DEFAULT_HERO_VIDEO.badge,
      autoPlay: videoAutoPlay,
      loop: videoLoop,
    };
    try {
      await publishHeroVideoToFirestore(updatedSettings);
      if (onSaveHeroVideo) {
        onSaveHeroVideo(updatedSettings);
      }
      playFanfareSound();
      confetti({ particleCount: 60, spread: 60 });
      setStatusNotice('تم حفظ وتحديث إعدادات الفيديو الترحيبي بنجاح على Firebase والمنصة!');
      setTimeout(() => setStatusNotice(''), 3000);
    } catch (err: any) {
      alert(`حدث خطأ أثناء حفظ الفيديو في Firebase: ${err?.message || err}`);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleResetDefaultVideo = () => {
    playSparkleSound();
    setVideoUrl(DEFAULT_HERO_VIDEO.videoUrl);
    setVideoTitle(DEFAULT_HERO_VIDEO.title);
    setVideoSubtitle(DEFAULT_HERO_VIDEO.subtitle);
    setVideoBadge(DEFAULT_HERO_VIDEO.badge);
    setVideoAutoPlay(true);
    setVideoLoop(true);
    setVideoEnabled(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = isOwnerAdmin(currentUser);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setAuthError('');
      playClickSound();
      const user = await loginWithGoogle();
      setCurrentUser(user);
      if (isOwnerAdmin(user)) {
        playFanfareSound();
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err: any) {
      setAuthError(err?.message || 'تعذر تسجيل الدخول عبر Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      playClickSound();
      await logoutUser();
      setCurrentUser(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const initEditStory = (st: Story) => {
    setEditingStory(st);
    setTitle(st.title);
    setSubtitle(st.subtitle);
    setCategory(st.category);
    setAgeRange(st.ageRange);
    setDuration(st.duration);
    setBadge(st.badge || 'مميز');
    setCoverImage(st.coverImage);
    setDescription(st.description);
    setMoralLesson(st.moralLesson);
    setPage1Text(st.pages[0]?.text || '');
    setPage2Text(st.pages[1]?.text || '');
    if (st.quiz && st.quiz[0]) {
      setQuizQuestion(st.quiz[0].question);
      setQuizOption1(st.quiz[0].options[0] || '');
      setQuizOption2(st.quiz[0].options[1] || '');
      setQuizOption3(st.quiz[0].options[2] || '');
    } else {
      setQuizQuestion('');
      setQuizOption1('');
      setQuizOption2('');
      setQuizOption3('');
    }
    setActiveTab('create');
  };

  const handleResetForm = () => {
    setEditingStory(null);
    setTitle('');
    setSubtitle('');
    setCategory('shahrazad');
    setAgeRange('6 - 10 سنوات');
    setDuration('07:30');
    setBadge('جديد');
    setCoverImage('/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png');
    setDescription('');
    setMoralLesson('');
    setPage1Text('');
    setPage2Text('');
    setQuizQuestion('');
    setQuizOption1('');
    setQuizOption2('');
    setQuizOption3('');
  };

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('عذراً! أنت لست المالك المصرح له بالنشر.');
      return;
    }

    if (!title.trim() || !description.trim() || !page1Text.trim()) {
      alert('يرجى ملء عنوان القصة، الوصف، وصفحة واحدة على الأقل!');
      return;
    }

    setIsSavingCloud(true);
    try {
      const categoryObj = CATEGORIES_LIST.find((c) => c.id === category) || CATEGORIES_LIST[1];

      const newPages = [{ text: page1Text.trim() }];
      if (page2Text.trim()) {
        newPages.push({ text: page2Text.trim() });
      }

      const newQuiz = quizQuestion.trim()
        ? [
            {
              question: quizQuestion.trim(),
              options: [
                quizOption1.trim() || 'الإجابة الأولى',
                quizOption2.trim() || 'الإجابة الثانية',
                quizOption3.trim() || 'الإجابة الثالثة',
              ],
              correctIndex: 0,
              explanation: 'أحسنت يا بطل! إجابة صحيحة.',
            },
          ]
        : [];

      const storyToPublish: Story = {
        id: editingStory ? editingStory.id : `story-${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle.trim() || 'حكاية ممتعة للأبطال الصغار',
        category,
        categoryLabel: categoryObj.label,
        categoryIcon: categoryObj.icon,
        ageRange,
        duration,
        badge,
        coverImage: coverImage.trim() || '/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png',
        description: description.trim(),
        highlightText: 'قصة موثقة على منصة رائد',
        moralLesson: moralLesson.trim() || 'العلم والأخلاق الطيبة ينيران درب المستقبل.',
        pages: newPages,
        quiz: newQuiz,
      };

      // Publish directly to Firebase Firestore
      await publishStoryToFirestore({
        ...storyToPublish,
        authorEmail: currentUser?.email || 'owner@platform.com',
        authorId: currentUser?.uid || 'admin',
        updatedAt: new Date().toISOString(),
      });

      onSaveStory(storyToPublish);

      playFanfareSound();
      confetti({ particleCount: 70, spread: 70 });
      setStatusNotice(editingStory ? 'تم تعديل القصة وحفظها في Firebase Firestore بنجاح!' : 'تم نشر القصة بنجاح على قاعدة بيانات Firebase!');
      setTimeout(() => {
        setStatusNotice('');
        setActiveTab('manage');
        handleResetForm();
      }, 2000);
    } catch (err: any) {
      alert(`فشل النشر على فايربيز: ${err?.message || err}`);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleDeleteWithCloud = async (storyId: string) => {
    if (!isAdmin) {
      alert('فقط المالك يملك صلاحية حذف القصص!');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذه القصة من الموقع وقاعدة بيانات فايربيز؟')) {
      playPopSound();
      try {
        await removeStoryFromFirestore(storyId);
      } catch (err) {
        console.warn('Could not delete from cloud:', err);
      }
      onDeleteStory(storyId);
    }
  };

  const handleSavePictureBookCloud = async () => {
    if (!isAdmin) {
      alert('فقط المالك يملك صلاحية تعديل ونشر الكتاب المصور!');
      return;
    }
    setIsSavingCloud(true);
    try {
      const updatedBook: PictureBook = {
        ...pictureBook,
        title: bookTitle,
        subtitle: bookSubtitle,
        creatorsAudioUrl: bookAudioUrl,
        moralLesson: bookMoralLesson,
        pages: pagesState,
      };

      await publishPictureBookToFirestore({
        ...updatedBook,
        authorEmail: currentUser?.email || 'owner@platform.com',
        updatedAt: new Date().toISOString(),
      });

      onSavePictureBook(updatedBook);
      playSparkleSound();
      confetti({ particleCount: 60, spread: 60 });
      setStatusNotice('تم تحديث ونشر الكتاب المصور وتسجيل MP3 بنجاح على Firebase!');
      setTimeout(() => setStatusNotice(''), 3000);
    } catch (err: any) {
      alert(`خطأ أثناء الحفظ على فايربيز: ${err?.message || err}`);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleDirectJsonPublish = async () => {
    if (!isAdmin) return;
    setIsSavingCloud(true);
    playClickSound();
    try {
      const parsedData = JSON.parse(rawJsonContent);
      const docId = rawDocumentId.trim() || `doc_${Date.now()}`;
      const payload = {
        ...parsedData,
        id: docId,
        authorEmail: currentUser?.email || 'owner@platform.com',
        authorId: currentUser?.uid || 'admin',
        updatedAt: new Date().toISOString(),
      };

      if (targetCollection === 'pictureBooks') {
        await publishPictureBookToFirestore(payload);
        onSavePictureBook(payload as PictureBook);
      } else {
        await publishStoryToFirestore(payload, targetCollection);
        onSaveStory(payload as Story);
      }

      playFanfareSound();
      confetti({ particleCount: 70, spread: 70 });
      setStatusNotice(`تم نشر المستند [${docId}] مباشرة في مجموعة [${targetCollection}] على Firebase!`);
      setTimeout(() => setStatusNotice(''), 3500);
    } catch (err: any) {
      alert(`خطأ في صياغة JSON أو الاتصال بـ Firebase:\n${err?.message || err}`);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleSaveSunnah = async () => {
    if (!isAdmin) return;
    if (!sunnahTitle.trim() || !sunnahArabicText.trim()) {
      alert('يرجى كتابة عنوان السورة أو الدعاء، والنص المشكول.');
      return;
    }
    setIsSavingCloud(true);
    playClickSound();
    try {
      const itemToSave: SunnahItem = {
        id: editingSunnahId || 'sunnah_' + Date.now(),
        title: sunnahTitle.trim(),
        subtitle: sunnahSubtitle.trim() || undefined,
        type: sunnahType,
        category: sunnahCategory,
        arabicText: sunnahArabicText.trim(),
        explanation: sunnahExplanation.trim() || undefined,
        virtue: sunnahVirtue.trim() || undefined,
        repeatCount: Number(sunnahRepeatCount) || 1,
        icon: sunnahIcon.trim() || '🤲',
        badge: sunnahBadge.trim() || undefined,
        isDailyDuaa: sunnahIsDaily,
        isFavorite: false,
        authorEmail: currentUser?.email || 'hadjerrimas2016@gmail.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await publishSunnahToFirestore(itemToSave);
      if (onSaveSunnahItem) onSaveSunnahItem(itemToSave);

      playFanfareSound();
      confetti({ particleCount: 70, spread: 70 });
      setStatusNotice('تم نشر [' + itemToSave.title + '] بنجاح في ركن السُنّة على Firebase! 🕌');
      setTimeout(() => setStatusNotice(''), 3500);

      setSunnahTitle('');
      setSunnahSubtitle('');
      setSunnahArabicText('');
      setSunnahExplanation('');
      setSunnahVirtue('');
      setEditingSunnahId(null);
    } catch (err: any) {
      alert('خطأ أثناء الحفظ على Firebase: ' + (err?.message || err));
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleEditSunnah = (item: SunnahItem) => {
    playClickSound();
    setEditingSunnahId(item.id);
    setSunnahTitle(item.title);
    setSunnahSubtitle(item.subtitle || '');
    setSunnahType(item.type);
    setSunnahCategory(item.category);
    setSunnahArabicText(item.arabicText);
    setSunnahExplanation(item.explanation || '');
    setSunnahVirtue(item.virtue || '');
    setSunnahRepeatCount(item.repeatCount || 1);
    setSunnahIcon(item.icon || '🤲');
    setSunnahBadge(item.badge || '');
    setSunnahIsDaily(!!item.isDailyDuaa);
    setActiveTab('sunnah');
  };

  const handleDeleteSunnah = async (id: string, titleStr: string) => {
    if (!isAdmin) return;
    if (!confirm('هل أنت متأكد من حذف [' + titleStr + '] من ركن السُنّة على Firebase؟')) return;
    setIsSavingCloud(true);
    playClickSound();
    try {
      await removeSunnahFromFirestore(id);
      if (onDeleteSunnahItem) onDeleteSunnahItem(id);
      playPopSound();
      setStatusNotice('تم حذف [' + titleStr + '] بنجاح من Firebase.');
      setTimeout(() => setStatusNotice(''), 3000);
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + (err?.message || err));
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleSeedAllStoriesToCloud = async () => {
    if (!isAdmin) return;
    setIsSavingCloud(true);
    playClickSound();
    try {
      let count = 0;
      for (const st of stories) {
        await publishStoryToFirestore({
          ...st,
          authorEmail: currentUser?.email || 'owner@platform.com',
          authorId: currentUser?.uid || 'admin',
          updatedAt: new Date().toISOString(),
        });
        count++;
      }
      playFanfareSound();
      setStatusNotice(`تمت مزامنة ورفع ${count} قصة إلى السحابة بنجاح!`);
      setTimeout(() => setStatusNotice(''), 3500);
    } catch (err: any) {
      alert(`خطأ أثناء المزامنة: ${err?.message || err}`);
    } finally {
      setIsSavingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/85 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-purple-700 bg-gradient-to-b from-[#18113c] via-[#100d2b] to-[#080517] text-white p-5 sm:p-7 space-y-6 my-auto max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black text-xl shadow-md">
              <Flame className="w-6 h-6 text-amber-950 fill-amber-950" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                <span>بوابة المالك السحابية (Firebase Cloud CMS)</span>
              </h2>
              <p className="text-xs text-purple-300/80">
                إدارة منصة Firebase، هيكلة الحقول، ونشر وتعديل قصص وكتب الموقع
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Gate for Owner Verification (Never exposing emails to public!) */}
        {!currentUser ? (
          <div className="p-6 rounded-3xl bg-white/5 border border-amber-400/30 space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-3xl">
              🔐
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-black text-amber-300">
                تسجيل الدخول كمالك للمنصة
              </h3>
              <p className="text-xs text-purple-200/90 leading-relaxed">
                هذه البوابة مخصصة حصرياً لمالك الموقع للتحكم في قواعد بيانات Firebase ونشر وتعديل المحتوى.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-900/50 border border-red-500/50 text-xs text-red-200">
                {authError}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ التحقق...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول السريع عبر Google</span>
                </>
              )}
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-3 text-center">
            <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-base font-black text-red-300">حساب زائر - صلاحيات النشر محجوبة</h3>
            <p className="text-xs text-red-200">
              أنت مسجل بحساب زائر عادي. لا يمكنك التعديل على محتوى الموقع العام أو النشر في Firebase.
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج والتبديل لحساب المالك</span>
            </button>
          </div>
        ) : (
          /* Authenticated Owner Bar */
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-indigo-950/70 to-purple-950/70 border border-emerald-500/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500 text-emerald-950 font-black">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-emerald-300">
                    أهلاً بك يا مالك المنصة
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    صلاحيات Firebase مفعلة 👑
                  </span>
                </div>
                <span className="text-[11px] text-purple-200 block">
                  قواعد البيانات مرتبطة مع Cloud Firestore
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedAllStoriesToCloud}
                disabled={isSavingCloud}
                className="px-3 py-1.5 rounded-xl bg-purple-700/60 hover:bg-purple-600 border border-purple-400/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="مزامنة جميع القصص التأسيسية وقواعد البيانات مع Firebase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSavingCloud ? 'animate-spin' : ''}`} />
                <span>مزامنة سحابية</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-red-300 flex items-center gap-1 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Notice Toast */}
        {statusNotice && (
          <div className="p-3 rounded-2xl bg-emerald-900/60 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Owner Navigation Tabs */}
        {isAdmin && (
          <>
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 flex-wrap">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('firebaseGuide');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'firebaseGuide'
                    ? 'bg-amber-400 text-amber-950 shadow'
                    : 'hover:bg-white/10 text-amber-300'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>دليل وهيكلة Firebase (أنواع الحقول)</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('heroVideo');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'heroVideo'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow'
                    : 'hover:bg-white/10 text-rose-300'
                }`}
              >
                <Video className="w-4 h-4 text-amber-300" />
                <span>فيديو الواجهة والنطاق (.com) 🎬🌐</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('manage');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'manage'
                    ? 'bg-purple-600 text-white shadow'
                    : 'hover:bg-white/10 text-purple-300'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>إدارة القصص ({stories.length})</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  handleResetForm();
                  setActiveTab('create');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'create'
                    ? 'bg-purple-600 text-white shadow'
                    : 'hover:bg-white/10 text-purple-300'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{editingStory ? 'تعديل القصة' : 'نشر قصة بالاستمارة البصرية'}</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('pictureBook');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pictureBook'
                    ? 'bg-purple-600 text-white shadow'
                    : 'hover:bg-white/10 text-purple-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>الكتاب المصور (10 صفحات + MP3)</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('rawStudio');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'rawStudio'
                    ? 'bg-blue-600 text-white shadow'
                    : 'hover:bg-white/10 text-blue-300'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>استوديو النشر المباشر (JSON Studio)</span>
              </button>
            </div>

            {/* TAB 1: Detailed Firebase Guide & Field Types in Arabic */}
            {activeTab === 'firebaseGuide' && (
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-white/5 border border-amber-400/30 space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-black text-amber-300">
                      دليل إدراج وهيكلة البيانات في منصة Firebase Cloud Firestore
                    </h3>
                  </div>

                  <p className="text-xs text-purple-200 leading-relaxed">
                    تعتمد قاعدة بيانات <strong>Cloud Firestore</strong> على نظام (المجموعات والمستندات):
                    حيث تكون <strong>المجموعة (Collection)</strong> بمثابة مجلد رئيسي، وبداخلها <strong>مستندات (Documents)</strong>، وكل مستند يحتوي على حقول (Fields) بمختلف أنواع البيانات البرمجية.
                  </p>

                  {/* Dedicated Collection IDs Card for Firebase Console */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-purple-900/40 to-sky-900/20 border-2 border-amber-400/60 shadow-xl space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-amber-400 text-amber-950 font-black text-sm shadow">
                          🏷️
                        </span>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-amber-300">
                            معرفات المجموعات (Spécifier un ID pour la collection) في Firebase Console
                          </h4>
                          <p className="text-[11px] text-purple-200/80">
                            عند الضغط على "Démarrer une collection" أو "+ Start collection"، استخدم المعرفات التالية:
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                        ✓ مهيأة وجاهزة في قواعد الأمان Firestore Rules
                      </span>
                    </div>

                    {/* Method 1: The Recommended Unified Pattern */}
                    <div className="p-3.5 rounded-xl bg-white/10 border border-amber-400/40 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-400 text-amber-950 text-[11px] font-black">
                            الخيار 1 (الموصى به والأسهل)
                          </span>
                          <span className="text-xs font-bold text-white">
                            مجموعة موحدة لجميع القصص مع فلتر category
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('stories', 'stories')}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedId === 'stories' ? 'تم النسخ! ✓' : 'نسخ: stories'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        اكتب في خانة <strong>ID de la collection</strong> المعرف <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">stories</code>، وداخل كل مستند قصة أضف حقلاً من نوع string باسم <code className="px-1.5 py-0.5 rounded bg-black/40 text-emerald-300 font-mono">category</code> واكتب فيه أحد رموز التصنيفات أدناه.
                      </p>
                    </div>

                    {/* Method 2: Individual Collections for Each Category */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[11px] font-black">
                            الخيار 2
                          </span>
                          <span className="text-xs font-bold text-purple-200">
                            مجموعات مستقلة لكل تصنيف (Separate Collections)
                          </span>
                        </div>
                        <span className="text-[10px] text-purple-300/80">
                          انقر على الزر لنسخ المعرف فوراً ولصقه في Firebase
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {[
                          {
                            id: 'stories_languages',
                            catKey: 'languages',
                            title: 'قصص باللغات (Languages)',
                            icon: '🌍',
                            color: 'from-emerald-900/60 to-teal-900/40 border-emerald-500/40'
                          },
                          {
                            id: 'stories_shahrazad',
                            catKey: 'shahrazad',
                            title: 'عالم شهرزاد (ألف ليلة وليلة)',
                            icon: '👸',
                            color: 'from-purple-900/60 to-indigo-900/40 border-purple-500/40'
                          },
                          {
                            id: 'stories_knowledge',
                            catKey: 'knowledge',
                            title: 'مستكشفو المعرفة والعلوم',
                            icon: '🚀',
                            color: 'from-blue-900/60 to-cyan-900/40 border-blue-500/40'
                          },
                          {
                            id: 'stories_heritage',
                            catKey: 'heritage',
                            title: 'كنوز التراث والشعبيات',
                            icon: '📜',
                            color: 'from-amber-900/60 to-yellow-900/40 border-amber-500/40'
                          },
                          {
                            id: 'stories_fantasy',
                            catKey: 'fantasy',
                            title: 'عالم القصص الخيالية',
                            icon: '✨',
                            color: 'from-pink-900/60 to-purple-900/40 border-pink-500/40'
                          },
                          {
                            id: 'stories_sleep',
                            catKey: 'sleep',
                            title: 'راديو النوم وقصص الاسترخاء',
                            icon: '🌙',
                            color: 'from-indigo-950/70 to-slate-900/50 border-indigo-500/40'
                          },
                          {
                            id: 'sunnah',
                            catKey: 'sunnah',
                            title: 'ركن السُنّة (سور قصيرة وأهم الأدعية)',
                            icon: '🕌',
                            color: 'from-emerald-950/80 to-teal-900/50 border-emerald-400/50'
                          },
                          {
                            id: 'pictureBooks',
                            catKey: 'book',
                            title: 'الكتاب المصور التفاعلي (10+ صفحات)',
                            icon: '📖',
                            color: 'from-amber-900/70 to-orange-950/50 border-amber-400/50 sm:col-span-2'
                          }
                        ].map((catItem) => (
                          <div
                            key={catItem.id}
                            className={"p-3 rounded-xl bg-gradient-to-r " + catItem.color + " border flex items-center justify-between gap-2"}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                                <span>{catItem.icon}</span>
                                <span className="truncate">{catItem.title}</span>
                              </div>
                              <div className="font-mono text-[11px] text-amber-300 font-bold dir-ltr text-left">
                                {catItem.id}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(catItem.id, catItem.title)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/25 active:scale-95 text-xs font-black text-amber-300 flex items-center gap-1 transition-all cursor-pointer flex-shrink-0 border border-white/10"
                              title="نسخ المعرف"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedId === catItem.id ? 'تم! ✓' : 'نسخ'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step-by-Step in Firebase Console */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/30 space-y-2 text-xs">
                      <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                        <span>⚙️</span>
                        <span>الخطوات في لوحة تحكم Firebase Console:</span>
                      </h5>
                      <ol className="space-y-1.5 text-purple-200/90 list-decimal list-inside pr-1">
                        <li>
                          <strong>Étape 1 (Spécifier un ID pour la collection):</strong> ضع معرف المجموعة (مثلاً <code className="font-mono text-amber-300">stories</code> أو <code className="font-mono text-amber-300">stories_languages</code>).
                        </li>
                        <li>
                          <strong>Étape 2 (ID du document):</strong> اضغط على زر <em>"ID automatique"</em> لتوليد معرف تلقائي، أو اكتب معرفاً باللغة الإنجليزية مثل <code className="font-mono text-emerald-300">story-01</code>.
                        </li>
                        <li>
                          <strong>Étape 3 (Champs / الحقول):</strong> أضف الحقول الإلزامية مثل: <code className="font-mono text-cyan-300">title</code> (string)، <code className="font-mono text-cyan-300">category</code> (string)، <code className="font-mono text-cyan-300">coverImage</code> (string)، <code className="font-mono text-cyan-300">moralLesson</code> (string)، و <code className="font-mono text-cyan-300">authorEmail</code> (string = hadjerrimas2016@gmail.com).
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* Field Types Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">1. النوع النصي: string</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">"text"</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        يُستخدم للنصوص، العناوين، الوصف، روابط الصور والملفات الصوتية.
                      </p>
                      <div className="p-2 rounded-xl bg-black/40 font-mono text-[11px] text-emerald-300 dir-ltr text-left">
                        title: "رحلة رائد إلى المريخ"<br />
                        coverImage: "/assets/..."<br />
                        category: "space"
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">2. النوع الرقمي: number</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">123</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        يُستخدم لعدد الصفحات، الترتيب، النقاط، ومؤشر الإجابة الصحيحة.
                      </p>
                      <div className="p-2 rounded-xl bg-black/40 font-mono text-[11px] text-emerald-300 dir-ltr text-left">
                        totalPages: 10<br />
                        pageNumber: 1<br />
                        correctIndex: 0
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">3. النوع المصفوفي: array</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">[ ... ]</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        قائمة متسلسلة من العناصر (نصوص، أو كائنات مركبة).
                      </p>
                      <div className="p-2 rounded-xl bg-black/40 font-mono text-[11px] text-emerald-300 dir-ltr text-left">
                        options: ["كوكب المريخ", "القمر", "الشمس"]
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">4. خريطة كائن مركب: map</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">&#123; ... &#125;</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        كائن يجمع حقولاً بداخله، مثل صفحة الكتاب (تحتوي نصاً، صورة، وعنواناً).
                      </p>
                      <div className="p-2 rounded-xl bg-black/40 font-mono text-[11px] text-emerald-300 dir-ltr text-left">
                        pages: [ &#123; pageNumber: 1, text: "..." &#125; ]
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">5. النوع المنطقي: boolean</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">true / false</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        يُستخدم للشروط الثنائية (نعم/لا)، مثل: هل هو دعاء يومي؟ أو هل هو في المفضلة؟
                      </p>
                      <div className="p-2 rounded-xl bg-black/40 font-mono text-[11px] text-emerald-300 dir-ltr text-left">
                        isDailyDuaa: true<br />
                        isFavorite: false<br />
                        verified: true
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">6. الطابع الزمني: timestamp</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">Timestamp</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        لتسجيل تاريخ ووقت الإضافة بالساعة والدقيقة، ويتيح ترتيب المحتوى زمنياً.
                      </p>
                      <div className="p-2 rounded-xl bg-black/40 font-mono text-[11px] text-emerald-300 dir-ltr text-left">
                        createdAt: Timestamp.now()<br />
                        publishedAt: 2026-10-21
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">7. القيمة الفارغة: null</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">null</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        تُستخدم عندما يكون الحقل اختيارياً ولا توجد له قيمة حالياً (مثل دعاء بدون تسجيل صوتي بعد).
                      </p>
                      <div className="p-2 rounded-xl bg-black/40 font-mono text-[11px] text-emerald-300 dir-ltr text-left">
                        audioUrl: null<br />
                        badge: null
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">8. إحداثيات جغرافية: geopoint</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">[lat, lng]</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        لتحديد موقع جغرافي على الخريطة (خط العرض وخط الطول).
                      </p>
                      <div className="p-2 rounded-xl bg-black/40 font-mono text-[11px] text-emerald-300 dir-ltr text-left">
                        location: [21.4225, 39.8262] // مكة المكرمة
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">9. المرجع الرابط: reference</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">DocRef</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">
                        للربط المباشر بين مستندين مختلفين (مثلاً ربط دعاء بقصة ذُكر فيها).
                      </p>
                      <div className="p-2 rounded-xl bg-black/40 font-mono text-[11px] text-emerald-300 dir-ltr text-left">
                        relatedStory: /stories/raed-mars
                      </div>
                    </div>
                  </div>

                  
                  {/* Structure of Sunnah Entity in Firebase */}
                  <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 space-y-3">
                    <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                      <span>🕌</span>
                      <span>كيف يتكون مستند ركن السُنّة (أدعية وسور) في Firebase يدوياً:</span>
                    </h4>
                    <p className="text-xs text-purple-200 leading-relaxed">
                      عند الضغط على <strong>Démarrer une collection</strong>، ضع المعرف <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">sunnah</code>. ثم في <strong>ID du document</strong> اكتب مثلاً <code className="px-1.5 py-0.5 rounded bg-black/40 text-emerald-300 font-mono">duaa-sleep</code>، وأدخل الحقول التالية:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/20">
                        <span className="font-bold text-amber-300">title (string):</span> عنوان الدعاء أو السورة مثل «دعاء النوم».
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/20">
                        <span className="font-bold text-amber-300">type (string):</span> أحد الخيارات: <code className="text-emerald-300">surah</code> أو <code className="text-emerald-300">duaa</code> أو <code className="text-emerald-300">dhikr</code>.
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/20">
                        <span className="font-bold text-amber-300">arabicText (string):</span> نص السورة أو الدعاء بالتشكيل التام.
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/20">
                        <span className="font-bold text-amber-300">repeatCount (number):</span> عدد التكرار للأطفال (مثلاً <code className="text-emerald-300">1</code> أو <code className="text-emerald-300">3</code> أو <code className="text-emerald-300">33</code>).
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/20">
                        <span className="font-bold text-amber-300">isDailyDuaa (boolean):</span> قيمة <code className="text-emerald-300">true</code> أو <code className="text-emerald-300">false</code>.
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/20">
                        <span className="font-bold text-amber-300">explanation (string):</span> شرح مبسط ولطيف لعقل الأطفال.
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/20">
                        <span className="font-bold text-amber-300">authorEmail (string):</span> بريدك كمالك (<code className="text-emerald-300">hadjerrimas2016@gmail.com</code>).
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/20">
                        <span className="font-bold text-amber-300">icon (string):</span> رمز تعبيري مناسب مثل 🤲 أو 📖 أو 🌙 أو ☀️.
                      </div>
                    </div>
                  </div>

                  {/* Structure of Book Entity */}
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                    <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>كيف يتكون نموذج الكتاب (Book Structure) في Firebase:</span>
                    </h4>
                    <ul className="text-xs space-y-1 text-purple-200/90 list-disc list-inside">
                      <li><strong>title (string):</strong> عنوان الكتاب مثل "قصة ليان وسر الجوهرة المصونة".</li>
                      <li><strong>totalPages (number):</strong> عدد الصفحات الممتدة (10 صفحات أو أكثر).</li>
                      <li><strong>creatorsAudioUrl (string):</strong> رابط ملف الـ MP3 الصوتي المسجل بأصواتكم كصناع العمل.</li>
                      <li><strong>pages (array of maps):</strong> مصفوفة من 10 كائنات، كل كائن يمثل صفحة بها نص مشكول وصورة ورقم الصفحة.</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-purple-300/80">
                      يمكنك النشر فوراً إما باستخدام استمارة النشر البصرية، أو عبر استوديو JSON المباشر!
                    </span>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-amber-950 font-black text-xs hover:scale-105 transition-all cursor-pointer"
                    >
                      بدء نشر قصة الآن 🚀
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Hero Video & Custom .COM Domain Configuration */}
            {activeTab === 'heroVideo' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Section 1: Hero Video Settings */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-rose-500/40 space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-base shadow">
                        <Video className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-rose-300">
                          فيديو الواجهة الترحيبي المتحرك للأطفال (Animated Hero Cinema)
                        </h3>
                        <p className="text-xs text-purple-200/80">
                          هذا الفيديو يعرض في أعلى واجهة الموقع كي لا يمل الأطفال أثناء الانتظار والتصفح
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>متصل بـ Firebase Firestore</span>
                    </span>
                  </div>

                  {/* Live Video Preview Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>معاينة حية فورية لمشغل الفيديو في الواجهة:</span>
                      </span>
                      <span className="text-[11px] text-purple-300/80">
                        الأطفال يستطيعون تشغيل الصوت وإيقافه وعرضه بملء الشاشة
                      </span>
                    </div>

                    <div className="relative aspect-[16/9] max-h-72 rounded-2xl overflow-hidden bg-black border-2 border-amber-400/40 shadow-xl">
                      <video
                        src={videoUrl || DEFAULT_HERO_VIDEO.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Form Fields for Video */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Video URL / Path */}
                    <div className="space-y-1.5 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-purple-200">
                          رابط أو مسار ملف الفيديو (Video URL / Path):
                        </label>
                        <button
                          type="button"
                          onClick={() => setVideoUrl(DEFAULT_HERO_VIDEO.videoUrl)}
                          className="text-[11px] font-bold text-amber-300 hover:underline cursor-pointer"
                        >
                          استخدام الفيديو المرفق (رائد وثعلبه في القلعة) 🏰
                        </button>
                      </div>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="/assets/aistudio/video_z5xqdjk5_20261021184400_87b84f16.mp4"
                        className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-xs font-mono text-amber-300 focus:outline-none focus:ring-2 focus:ring-rose-500 dir-ltr text-left"
                      />
                      <span className="text-[10px] text-purple-300/70 block">
                        يمكنك إدخال مسار محلي في مجلد assets أو رابط MP4 مباشر من أي خادم أو استضافة سحابية.
                      </span>
                    </div>

                    {/* Video Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-purple-200">
                        عنوان الفيديو الترحيبي في الواجهة:
                      </label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="مرحبًا بكم في عالم رائد السحري"
                        className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    {/* Video Badge */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-purple-200">
                        الشارة المتحركة (Badge):
                      </label>
                      <input
                        type="text"
                        value={videoBadge}
                        onChange={(e) => setVideoBadge(e.target.value)}
                        placeholder="سينما رائد التفاعلية ✨"
                        className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    {/* Video Subtitle */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-black text-purple-200">
                        النص / الوصف الترحيبي للأطفال:
                      </label>
                      <textarea
                        rows={2}
                        value={videoSubtitle}
                        onChange={(e) => setVideoSubtitle(e.target.value)}
                        placeholder="شاهد رائد وثعلبه الأليف في عرض سينمائي ممتع بانتظار رحلتك القادمة كي لا تشعر بأي ملل!"
                        className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6 md:col-span-2 flex-wrap p-3 rounded-2xl bg-white/5 border border-white/10">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                        <input
                          type="checkbox"
                          checked={videoEnabled}
                          onChange={(e) => setVideoEnabled(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                        />
                        <span>تفعيل مشغل الفيديو في أعلى الواجهة</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                        <input
                          type="checkbox"
                          checked={videoAutoPlay}
                          onChange={(e) => setVideoAutoPlay(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                        />
                        <span>تشغيل تلقائي فوري (Autoplay)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                        <input
                          type="checkbox"
                          checked={videoLoop}
                          onChange={(e) => setVideoLoop(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                        />
                        <span>تكرار العرض تلقائياً (Loop)</span>
                      </label>
                    </div>
                  </div>

                  {/* Video Save Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleResetDefaultVideo}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-purple-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استعادة الإعدادات الافتراضية للفيديو</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveHeroVideoSettings}
                      disabled={isSavingCloud}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingCloud ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جارٍ الحفظ والمزامنة...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>حفظ ومزامنة فيديو الواجهة في Firebase Firestore 💾</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Section 2: Custom .COM Domain Configuration Guide */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/60 to-slate-950/60 border-2 border-amber-400/50 space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-base shadow">
                        <Globe className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-amber-300">
                          ربط وإعداد النطاق الاحترافي للموقع (.COM Domain)
                        </h3>
                        <p className="text-xs text-purple-200/90">
                          نطاق رسمي موثق ينتهي بـ .com مع شهادة SSL مشفرة مجانية
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                      🌐 raedstories.com
                    </span>
                  </div>

                  {/* Verified Domain Card with One-Click Copy */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/40 flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-purple-300/80 font-bold block">
                        الرابط المعتمد المدمج في الكود ومحركات البحث (Canonical & Open Graph):
                      </span>
                      <span className="text-sm sm:text-base font-mono font-black text-amber-300">
                        https://www.raedstories.com
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://www.raedstories.com', 'domain')}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === 'https://www.raedstories.com' ? 'تم النسخ بنجاح! ✓' : 'نسخ الرابط الرسمي'}</span>
                    </button>
                  </div>

                  {/* DNS Records Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs sm:text-sm font-black text-purple-200 flex items-center gap-1.5">
                      <span>سجلات الـ DNS لربط النطاق مع Firebase Hosting / Google Cloud:</span>
                    </h4>

                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-white/10 text-amber-300 font-bold text-[11px]">
                          <tr>
                            <th className="p-2.5">نوع السجل (Type)</th>
                            <th className="p-2.5">المضيف (Host / Name)</th>
                            <th className="p-2.5">القيمة (Value / Target)</th>
                            <th className="p-2.5">الإجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 font-mono text-purple-200 text-[11px]">
                          <tr>
                            <td className="p-2.5 text-amber-400 font-bold">A</td>
                            <td className="p-2.5">@</td>
                            <td className="p-2.5 text-emerald-300">216.239.32.21</td>
                            <td className="p-2.5">
                              <button
                                onClick={() => copyToClipboard('216.239.32.21', 'ip1')}
                                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white cursor-pointer"
                              >
                                {copiedId === '216.239.32.21' ? 'تم! ✓' : 'نسخ'}
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-amber-400 font-bold">A</td>
                            <td className="p-2.5">@</td>
                            <td className="p-2.5 text-emerald-300">216.239.34.21</td>
                            <td className="p-2.5">
                              <button
                                onClick={() => copyToClipboard('216.239.34.21', 'ip2')}
                                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white cursor-pointer"
                              >
                                {copiedId === '216.239.34.21' ? 'تم! ✓' : 'نسخ'}
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-amber-400 font-bold">A</td>
                            <td className="p-2.5">@</td>
                            <td className="p-2.5 text-emerald-300">216.239.36.21</td>
                            <td className="p-2.5">
                              <button
                                onClick={() => copyToClipboard('216.239.36.21', 'ip3')}
                                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white cursor-pointer"
                              >
                                {copiedId === '216.239.36.21' ? 'تم! ✓' : 'نسخ'}
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-amber-400 font-bold">A</td>
                            <td className="p-2.5">@</td>
                            <td className="p-2.5 text-emerald-300">216.239.38.21</td>
                            <td className="p-2.5">
                              <button
                                onClick={() => copyToClipboard('216.239.38.21', 'ip4')}
                                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white cursor-pointer"
                              >
                                {copiedId === '216.239.38.21' ? 'تم! ✓' : 'نسخ'}
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-blue-400 font-bold">CNAME</td>
                            <td className="p-2.5">www</td>
                            <td className="p-2.5 text-emerald-300">raedstories.com</td>
                            <td className="p-2.5">
                              <button
                                onClick={() => copyToClipboard('raedstories.com', 'cname')}
                                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white cursor-pointer"
                              >
                                {copiedId === 'raedstories.com' ? 'تم! ✓' : 'نسخ'}
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4-Step Connection Guide */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-purple-200 leading-relaxed">
                    <h4 className="font-black text-amber-300 flex items-center gap-1.5">
                      <span>خطوات ربط النطاق في 3 دقائق:</span>
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] sm:text-xs">
                      <li>
                        <strong>شراء النطاق:</strong> احصل على النطاق <code className="text-amber-300">raedstories.com</code> من أي مسجل نطاقات (Namecheap, GoDaddy, Hostinger, Google Domains).
                      </li>
                      <li>
                        <strong>لوحة تحكم Firebase:</strong> افتح مشروعك في <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Firebase Console</a>، واختر قسم <strong>Hosting</strong> ثم اضغط <strong>Add custom domain</strong>.
                      </li>
                      <li>
                        <strong>إدخال النطاق:</strong> اكتب <code className="text-amber-300">raedstories.com</code> وقم بنسخ قيم الـ A Records والـ CNAME أعلاه إلى قسم إدارة الـ DNS في موقع مسجل النطاق.
                      </li>
                      <li>
                        <strong>تفعيل شهادة SSL:</strong> تقوم Google تلقائياً بإصدار شهادة SSL مشفرة ومجانية (HTTPS) خلال فترة تتراوح بين بضع دقائق وساعة واحدة.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Manage Existing Stories */}
            {activeTab === 'manage' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {stories.map((st) => (
                    <div
                      key={st.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-purple-700/40 hover:border-purple-500 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={st.coverImage}
                          alt={st.title}
                          className="w-14 h-14 rounded-xl object-cover border border-white/20 shrink-0"
                        />
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{st.categoryIcon}</span>
                            <span className="text-xs font-bold text-purple-300">{st.categoryLabel}</span>
                          </div>
                          <h4 className="text-sm font-black text-amber-300 truncate">{st.title}</h4>
                          <p className="text-[11px] text-purple-200/70 truncate">{st.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => initEditStory(st)}
                          className="p-2 rounded-xl bg-purple-600/60 hover:bg-purple-600 text-white transition-all cursor-pointer"
                          title="تعديل القصة"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWithCloud(st.id)}
                          className="p-2 rounded-xl bg-red-600/40 hover:bg-red-600 text-red-200 hover:text-white transition-all cursor-pointer"
                          title="حذف القصة نهائياً من Firebase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Visual Guided Form to publish story */}
            {activeTab === 'create' && (
              <form onSubmit={handlePublishStory} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">
                      عنوان القصة (title: string):
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: رحلة شهرزاد إلى كوكب الزمرد"
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-700 text-xs focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">
                      العنوان الفرعي (subtitle: string):
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="مثال: مغامرة فضائية شيقة مليئة بالحكمة"
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-700 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">
                      تصنيف القصة (category: string):
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Story['category'])}
                      className="w-full px-3 py-2 rounded-xl bg-[#24174d] border border-purple-700 text-xs text-white"
                    >
                      {CATEGORIES_LIST.filter((cat) => cat.id !== 'all').map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">
                      الفئة العمرية (ageRange: string):
                    </label>
                    <input
                      type="text"
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      placeholder="مثال: 5 - 9 سنوات"
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-700 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">
                      رابط الغلاف (coverImage: string):
                    </label>
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-700 text-xs dir-ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">
                      العبرة التربوية (moralLesson: string):
                    </label>
                    <input
                      type="text"
                      value={moralLesson}
                      onChange={(e) => setMoralLesson(e.target.value)}
                      placeholder="مثال: الصدق والأمانة كنز الإنسان"
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-700 text-xs"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-amber-400">
                      وصف القصة (description: string):
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white/10 border border-purple-700 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="نبذة تشد الطفل للقراءة..."
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-amber-400">
                      نص الصفحة الأولى (page 1: string):
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={page1Text}
                      onChange={(e) => setPage1Text(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white/10 border border-purple-700 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="في قديم الزمان وفي مدينة الأحلام..."
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-amber-400">
                      نص الصفحة الثانية (page 2: string - اختياري):
                    </label>
                    <textarea
                      rows={2}
                      value={page2Text}
                      onChange={(e) => setPage2Text(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white/10 border border-purple-700 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      handleResetForm();
                      setActiveTab('manage');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingCloud}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingCloud ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جارٍ النشر إلى Firebase...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingStory ? 'تحديث المستند في Firebase' : 'نشر المستند فوراً إلى Firebase 🚀'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: Picture Book 10-Pages + MP3 Audio Link */}
            {activeTab === 'pictureBook' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-purple-600/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-black text-amber-300">
                      بيانات الكتاب المصور (هيكل Book: 10 صفحات + MP3 لصناع العمل)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">عنوان الكتاب (title: string):</label>
                      <input
                        type="text"
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">العنوان الفرعي (subtitle: string):</label>
                      <input
                        type="text"
                        value={bookSubtitle}
                        onChange={(e) => setBookSubtitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      <span>رابط الملف الصوتي الرسمي للمؤلفين (creatorsAudioUrl: string):</span>
                    </label>
                    <input
                      type="text"
                      value={bookAudioUrl}
                      onChange={(e) => setBookAudioUrl(e.target.value)}
                      placeholder="https://... أو مسار ملف صوتي mp3"
                      className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs dir-ltr"
                    />
                    <p className="text-[10px] text-purple-300/80">
                      ضع هنا رابط التسجيل الصوتي الخاص بكم كصناع العمل ليتم تشغيله كخلفية صوتية وقراءة رسمية في الكتاب.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">العبرة التربوية (moralLesson: string):</label>
                    <input
                      type="text"
                      value={bookMoralLesson}
                      onChange={(e) => setBookMoralLesson(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs"
                    />
                  </div>
                </div>

                {/* 10 Pages Editor */}
                <div className="p-4 rounded-2xl bg-white/5 border border-purple-600/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-amber-300">
                      تعديل مصفوفة الصفحات (الصفحة {editingPageIndex + 1} من {pagesState.length}):
                    </h4>
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-xs">
                      {pagesState.map((p, idx) => (
                        <button
                          key={p.pageNumber}
                          type="button"
                          onClick={() => setEditingPageIndex(idx)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            editingPageIndex === idx
                              ? 'bg-amber-400 text-amber-950 font-black scale-110 shadow'
                              : 'bg-white/10 hover:bg-white/20 text-purple-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {pagesState[editingPageIndex] && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-purple-300">عنوان الفصل (chapterTitle: string):</label>
                          <input
                            type="text"
                            value={pagesState[editingPageIndex].chapterTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPagesState((prev) => {
                                const copy = [...prev];
                                copy[editingPageIndex] = { ...copy[editingPageIndex], chapterTitle: val };
                                return copy;
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-purple-300">رابط صورة الصفحة (image: string):</label>
                          <input
                            type="text"
                            value={pagesState[editingPageIndex].image}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPagesState((prev) => {
                                const copy = [...prev];
                                copy[editingPageIndex] = { ...copy[editingPageIndex], image: val };
                                return copy;
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs dir-ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-purple-300">نص الصفحة المشكول (tashkeelText: string):</label>
                        <textarea
                          rows={2}
                          value={pagesState[editingPageIndex].tashkeelText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPagesState((prev) => {
                              const copy = [...prev];
                              copy[editingPageIndex] = { ...copy[editingPageIndex], tashkeelText: val, text: val };
                              return copy;
                            });
                          }}
                          className="w-full p-2 rounded-xl bg-white/10 border border-purple-700 text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleSavePictureBookCloud}
                    disabled={isSavingCloud}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingCloud ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جارٍ الحفظ على Firebase...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>حفظ ونشر الكتاب المصور إلى Firebase 🌟</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB: Manage Sunnah Corner (Surahs & Duas) */}
            {activeTab === 'sunnah' && (
              <div className="space-y-5">
                {/* Form to Add / Edit Sunnah Item */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-emerald-500 text-white font-black text-sm shadow">
                        🕌
                      </span>
                      <div>
                        <h3 className="text-base font-black text-amber-300">
                          {editingSunnahId ? 'تعديل عنصر في ركن السُنّة' : 'إضافة ونشر سورة قصيرة أو دعاء في Firebase'}
                        </h3>
                        <p className="text-[11px] text-emerald-200/80">
                          يتم الحفظ مباشرة في مجموعة <code className="font-mono text-amber-300">sunnah</code> على Cloud Firestore
                        </p>
                      </div>
                    </div>
                    {editingSunnahId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSunnahId(null);
                          setSunnahTitle('');
                          setSunnahSubtitle('');
                          setSunnahArabicText('');
                          setSunnahExplanation('');
                          setSunnahVirtue('');
                        }}
                        className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 cursor-pointer"
                      >
                        إلغاء التعديل
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-amber-400">
                        العنوان (title: string): *
                      </label>
                      <input
                        type="text"
                        required
                        value={sunnahTitle}
                        onChange={(e) => setSunnahTitle(e.target.value)}
                        placeholder="مثال: سُورَةُ الْإِخْلَاص أو دُعَاءُ النَّوْمِ"
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-emerald-500/50 text-xs focus:ring-2 focus:ring-emerald-400 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">
                        النوع (type: string):
                      </label>
                      <select
                        value={sunnahType}
                        onChange={(e) => setSunnahType(e.target.value as SunnahType)}
                        className="w-full px-3 py-2 rounded-xl bg-[#14261d] border border-emerald-500/50 text-xs text-white"
                      >
                        <option value="surah">سورة قصيرة (surah)</option>
                        <option value="duaa">دعاء مأثور (duaa)</option>
                        <option value="dhikr">تسبيح وذكر (dhikr)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">
                        التصنيف (category: string):
                      </label>
                      <select
                        value={sunnahCategory}
                        onChange={(e) => setSunnahCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-[#14261d] border border-emerald-500/50 text-xs text-white"
                      >
                        <option value="daily">أدعية يومية عامة (daily)</option>
                        <option value="sleep">أدعية النوم والاسترخاء (sleep)</option>
                        <option value="morning_evening">الصباح والمساء (morning_evening)</option>
                        <option value="surah">السور القصيرة (surah)</option>
                        <option value="study">طلب العلم والتفوق (study)</option>
                        <option value="meals_travel">المائدة والسفر (meals_travel)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">
                        عدد التكرار الموصى به (repeatCount: number):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={sunnahRepeatCount}
                        onChange={(e) => setSunnahRepeatCount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-emerald-500/50 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">
                        الرمز التعبيري (icon: string):
                      </label>
                      <input
                        type="text"
                        value={sunnahIcon}
                        onChange={(e) => setSunnahIcon(e.target.value)}
                        placeholder="مثال: 📖 أو 🤲 أو 🌙"
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-emerald-500/50 text-xs text-center text-base"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-amber-400">
                        وصف فرعي أو مناسبة الذكر (subtitle: string):
                      </label>
                      <input
                        type="text"
                        value={sunnahSubtitle}
                        onChange={(e) => setSunnahSubtitle(e.target.value)}
                        placeholder="مثال: يقال عند وضع الرأس على الوسادة"
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-emerald-500/50 text-xs"
                      />
                    </div>

                    <div className="space-y-1 flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="isDailyDuaaCheck"
                        checked={sunnahIsDaily}
                        onChange={(e) => setSunnahIsDaily(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                      />
                      <label htmlFor="isDailyDuaaCheck" className="text-xs font-bold text-amber-300 cursor-pointer">
                        دعاء يومي أساسي (isDailyDuaa: boolean)
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400">
                      النص المشكول بالتفصيل (arabicText: string): *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={sunnahArabicText}
                      onChange={(e) => setSunnahArabicText(e.target.value)}
                      placeholder="اكتب النص القرآني أو النبوي الشريف مع التشكيل التام..."
                      className="w-full p-3 rounded-2xl bg-white/10 border border-emerald-500/50 text-sm font-serif leading-loose outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">
                        شرح الكلمات للأطفال (explanation: string):
                      </label>
                      <textarea
                        rows={2}
                        value={sunnahExplanation}
                        onChange={(e) => setSunnahExplanation(e.target.value)}
                        placeholder="معاني الكلمات الصعبة بأسلوب مبسط وشيق للأبطال الصغار..."
                        className="w-full p-2.5 rounded-xl bg-white/10 border border-emerald-500/50 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">
                        فضل السورة أو الدعاء (virtue: string):
                      </label>
                      <textarea
                        rows={2}
                        value={sunnahVirtue}
                        onChange={(e) => setSunnahVirtue(e.target.value)}
                        placeholder="ما هو الثواب العظيم والبركة المستفادة من قراءتها؟"
                        className="w-full p-2.5 rounded-xl bg-white/10 border border-emerald-500/50 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSunnah}
                      disabled={isSavingCloud}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingCloud ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جارٍ النشر على Firebase...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{editingSunnahId ? 'حفظ التعديلات في Firebase 🕌' : 'نشر وتثبيت في ركن السُنّة 🌟'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* List of Current Sunnah Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                      <span>📋</span>
                      <span>عناصر ركن السُنّة الحالية ({sunnahItems.length})</span>
                    </h4>
                    <span className="text-[11px] text-purple-300/80">
                      يمكنك تعديل أو حذف أي سورة أو دعاء مسجل
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sunnahItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white/5 border border-emerald-700/40 hover:border-emerald-500 transition-all flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-white flex items-center justify-center text-lg flex-shrink-0">
                            {item.icon || '📖'}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-400/20 text-emerald-300 font-bold">
                                {item.type}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                تكرار: {item.repeatCount || 1}
                              </span>
                            </div>
                            <h5 className="text-xs sm:text-sm font-black text-amber-300 truncate">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-emerald-200/70 line-clamp-1 font-serif">
                              {item.arabicText}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditSunnah(item)}
                            className="p-1.5 rounded-lg bg-emerald-600/50 hover:bg-emerald-600 text-white transition-all cursor-pointer"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSunnah(item.id, item.title)}
                            className="p-1.5 rounded-lg bg-red-600/50 hover:bg-red-600 text-white transition-all cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Interactive Raw JSON Studio with Firebase Injection */}
            {activeTab === 'rawStudio' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-blue-500/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-blue-400" />
                      <h3 className="text-sm font-black text-blue-300">
                        استوديو النشر المباشر إلى مستندات Firebase (Direct Document Injection)
                      </h3>
                    </div>
                    <span className="text-[11px] text-purple-300/80">
                      اكتب أو الصق كود JSON مباشرة وسيتم حقنه في Firestore
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">المجموعة المستهدفة في Firebase:</label>
                      <select
                        value={targetCollection}
                        onChange={(e) => setTargetCollection(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#201844] border border-blue-500/50 text-xs"
                      >
                        <option value="stories">المجموعة الموحدة: stories (موصى بها - تشمل كل التصنيفات)</option>
                        <option value="stories_languages">مجموعة قصص اللغات: stories_languages</option>
                        <option value="stories_shahrazad">مجموعة عالم شهرزاد: stories_shahrazad</option>
                        <option value="stories_knowledge">مجموعة مستكشفو المعرفة: stories_knowledge</option>
                        <option value="stories_heritage">مجموعة كنوز التراث: stories_heritage</option>
                        <option value="stories_fantasy">مجموعة القصص الخيالية: stories_fantasy</option>
                        <option value="stories_sleep">مجموعة راديو النوم: stories_sleep</option>
                        <option value="sunnah">مجموعة ركن السُنّة (أدعية وسور): sunnah</option>
                        <option value="pictureBooks">مجموعة الكتب المصورة: pictureBooks</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400">معرف المستند الفريد (Document ID):</label>
                      <input
                        type="text"
                        value={rawDocumentId}
                        onChange={(e) => setRawDocumentId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-blue-500/50 text-xs font-mono dir-ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400">محتوى المستند بتنسيق JSON:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRawJsonContent(JSON.stringify(stories[0], null, 2));
                            setRawDocumentId(`story_sample_${Date.now().toString().slice(-4)}`);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] bg-purple-700/60 hover:bg-purple-600 text-purple-200 cursor-pointer"
                        >
                          تحميل نموذج قصة
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetCollection('pictureBooks');
                            setRawJsonContent(JSON.stringify(pictureBook, null, 2));
                            setRawDocumentId('picture_book_lyan_main');
                          }}
                          className="px-2 py-0.5 rounded text-[10px] bg-emerald-700/60 hover:bg-emerald-600 text-emerald-200 cursor-pointer"
                        >
                          تحميل نموذج كتاب مصور
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={9}
                      value={rawJsonContent}
                      onChange={(e) => setRawJsonContent(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#090615] border border-blue-500/40 text-xs font-mono text-emerald-300 leading-relaxed dir-ltr focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[11px] text-purple-300/80">
                      يتم التحقق من سلامة وصحة الحقول قبل الإرسال لمنع أخطاء السحابة.
                    </span>
                    <button
                      type="button"
                      onClick={handleDirectJsonPublish}
                      disabled={isSavingCloud}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingCloud ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جارٍ الحقن في Firebase...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>حقن ونشر المستند في Firebase Firestore ⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
