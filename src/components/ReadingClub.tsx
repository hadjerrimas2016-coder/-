import React, { useState, useEffect, useRef } from 'react';
import { AppMode, ReadingClubStory, ReadingClubUser, UserAudioRecording } from '../types';
import {
  BookOpen,
  Mic,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Award,
  Globe,
  PlusCircle,
  Play,
  Pause,
  UserCheck,
  Eye,
  Lock,
  Volume2,
  Square,
  RotateCcw,
  Trash2,
  Check,
  Send,
  Star,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playSparkleSound,
  playPopSound,
  playFanfareSound,
  playClickSound
} from '../utils/audio';
import {
  subscribeToReadingClubStories,
  publishReadingClubStoryToFirestore,
  subscribeToPublicProfiles,
  savePublicProfileToFirestore
} from '../firebase';

interface ReadingClubProps {
  mode: AppMode;
  userRecordings: UserAudioRecording[];
  starsCount: number;
  onEarnStars: (amount: number) => void;
  currentUser?: any;
}

// Default community peers for instant richness
const INITIAL_PEERS: ReadingClubUser[] = [
  {
    id: 'peer-layan',
    name: 'ليان الزهراني',
    avatar: '👧',
    isPublic: true,
    totalStars: 580,
    rankTitle: 'أميرة الحكايات 👑',
    bio: 'أحب قراءة قصص الأخلاق والحياء، وسجلت حكاية الجوهرة المصونة كاملة بصوتي!',
    joinedDate: 'منذ شهر',
    likesCount: 142,
    cheersCount: 38,
    recordedStories: [
      {
        id: 'rec-layan-1',
        title: 'قراءة: صفحة 1 (المسير الصباحي نحو المدرسة)',
        storyTitle: 'قصة ليان وسر الجوهرة المصونة',
        pageNumber: 1,
        createdAt: 'اليوم، 10:30 ص',
        durationSec: 25,
        audioBlobUrl: '',
      },
      {
        id: 'rec-layan-2',
        title: 'قراءة: صفحة 3 (حكمة الجدة وسر اللؤلؤة)',
        storyTitle: 'قصة ليان وسر الجوهرة المصونة',
        pageNumber: 3,
        createdAt: 'أمس، 04:15 م',
        durationSec: 32,
        audioBlobUrl: '',
      }
    ]
  },
  {
    id: 'peer-ahmed',
    name: 'أحمد رائد الفضاء',
    avatar: '🧑‍🚀',
    isPublic: true,
    totalStars: 720,
    rankTitle: 'حارس النجوم 💫',
    bio: 'مستكشف الكواكب والنجوم، أعشق تسجيل القصص بالإنجليزية والعربية!',
    joinedDate: 'منذ أسبوعين',
    likesCount: 198,
    cheersCount: 52,
    recordedStories: [
      {
        id: 'rec-ahmed-1',
        title: 'Reading: Chapter 1 (The Countdown)',
        storyTitle: 'The Little Astronaut',
        pageNumber: 1,
        createdAt: 'أمس، 06:40 م',
        durationSec: 28,
        audioBlobUrl: '',
      }
    ]
  },
  {
    id: 'peer-maryam',
    name: 'مريم الزرقاء',
    avatar: '🧕',
    isPublic: true,
    totalStars: 440,
    rankTitle: 'قارئة النجوم الواعدة ⭐',
    bio: 'أحب تلاوة السور والأدعية في ركن السنة وقراءة قصص الطبيعة والحدائق.',
    joinedDate: 'منذ 3 أيام',
    likesCount: 89,
    cheersCount: 24,
    recordedStories: [
      {
        id: 'rec-maryam-1',
        title: 'تلاوة سورة الضحى بصوت طفولي خاشع',
        storyTitle: 'ركن السُنّة النبوية',
        pageNumber: 1,
        createdAt: 'اليوم، 09:10 ص',
        durationSec: 45,
        audioBlobUrl: '',
      }
    ]
  }
];

const INITIAL_STORIES: ReadingClubStory[] = [
  {
    id: 'story-club-1',
    authorId: 'peer-layan',
    authorName: 'ليان الزهراني',
    authorAvatar: '👧',
    title: 'سر العصفور الذي حفظ الأمانة',
    category: 'nature',
    summary: 'حكاية ألفتها وسجلتها بصوتي عن عصفور صغير وجد لؤلؤة براقة في الغابة وبحث عن صاحبها.',
    content: 'في غابة الصنوبر الخضراء، وجد العصفور زقزوق حبة لؤلؤ تلمع تحت أشعة الشمس. لم يأخذها لنفسه بل طار عالياً يسأل كل حيوانات الغابة حتى أعادها إلى السلحفاة العجوز التي فرحت بأمانته وكافأته بتوت بري لذيذ.',
    likes: 34,
    createdAt: 'منذ يومين',
    tags: ['أمانة', 'أخلاق', 'حيوانات'],
    comments: [
      { id: 'c1', userName: 'أحمد', userAvatar: '🧑‍🚀', text: 'قصة رائعة وصوتك جميل جداً يا ليان!', createdAt: 'أمس' },
      { id: 'c2', userName: 'سارة', userAvatar: '🌸', text: 'أعجبتني أمانة العصفور زقزوق!', createdAt: 'اليوم' }
    ]
  },
  {
    id: 'story-club-2',
    authorId: 'peer-ahmed',
    authorName: 'أحمد رائد الفضاء',
    authorAvatar: '🧑‍🚀',
    title: 'Journey to the Diamond Comet / رحلة المذنب الماسي',
    category: 'foreign_languages',
    summary: 'A bilingual space adventure I wrote and voiced with my friend the fox!',
    content: 'Captain Ahmed boarded the star cruiser. "Computer, set coordinates to the Diamond Nebula!". As they crossed the asteroid belt, millions of crystal stars lit up their path with pure wonder.',
    likes: 48,
    createdAt: 'أمس',
    tags: ['space', 'bilingual', 'stars'],
    comments: [
      { id: 'c3', userName: 'مريم', userAvatar: '🧕', text: 'Amazing English pronunciation! بارك الله فيك!', createdAt: 'أمس' }
    ]
  }
];

export const ReadingClub: React.FC<ReadingClubProps> = ({
  mode,
  userRecordings,
  starsCount,
  onEarnStars,
  currentUser,
}) => {
  // Account Public Profile Setting
  const [isPublicAccount, setIsPublicAccount] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('raed_account_is_public');
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true; // Default to public to encourage reading
  });

  const [activeTab, setActiveTab] = useState<'voices' | 'stories'>('voices');
  const [clubStories, setClubStories] = useState<ReadingClubStory[]>(INITIAL_STORIES);
  const [peers, setPeers] = useState<ReadingClubUser[]>(INITIAL_PEERS);

  // Authoring modal state
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ReadingClubStory['category']>('fantasy');
  const [newSummary, setNewSummary] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>(currentUser?.displayName || 'بطل نادي القراءة');

  // Authoring Audio Recording inside modal
  const [isRecordingStory, setIsRecordingStory] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Playback in Club
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<string | null>(null);
  const activeAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Likes tracking
  const [likedStories, setLikedStories] = useState<string[]>([]);
  const [likedPeers, setLikedPeers] = useState<string[]>([]);

  // Listen to Firestore real-time updates for reading club stories
  useEffect(() => {
    const unsub = subscribeToReadingClubStories(
      (cloudStories: any[]) => {
        if (cloudStories && cloudStories.length > 0) {
          const merged = [...cloudStories];
          for (const initSt of INITIAL_STORIES) {
            if (!merged.some((s) => s.id === initSt.id)) {
              merged.push(initSt);
            }
          }
          setClubStories(merged);
        }
      },
      () => {}
    );
    return () => unsub();
  }, []);

  const handleTogglePublic = () => {
    playSparkleSound();
    const nextVal = !isPublicAccount;
    setIsPublicAccount(nextVal);
    try {
      localStorage.setItem('raed_account_is_public', JSON.stringify(nextVal));
    } catch {}

    // Save profile to Firestore
    savePublicProfileToFirestore({
      id: currentUser?.uid || 'user-local',
      name: authorName,
      isPublic: nextVal,
      totalStars: starsCount,
      recordingsCount: userRecordings.length,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  };

  // Audio Playback Handler
  const handlePlayAudio = (url: string) => {
    playClickSound();
    if (!url) {
      alert('هذا التسجيل توضيحي من الصديق. يمكنك تسجيل صوتك في كتبك وقصصك ليكون متاحاً للجميع!');
      return;
    }

    if (currentlyPlayingAudio === url && activeAudioPlayerRef.current) {
      activeAudioPlayerRef.current.pause();
      setCurrentlyPlayingAudio(null);
      return;
    }

    if (activeAudioPlayerRef.current) {
      activeAudioPlayerRef.current.pause();
    }

    const audio = new Audio(url);
    activeAudioPlayerRef.current = audio;
    audio.onended = () => setCurrentlyPlayingAudio(null);
    audio.play().catch(() => {});
    setCurrentlyPlayingAudio(url);
  };

  // Recording audio inside story publisher
  const handleStartRecording = async () => {
    playSparkleSound();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setIsRecordingStory(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      alert('يرجى السماح بالوصول إلى الميكروفون لتسجيل صوتك مع القصة!');
    }
  };

  const handleStopRecording = () => {
    playClickSound();
    if (mediaRecorderRef.current && isRecordingStory) {
      mediaRecorderRef.current.stop();
      setIsRecordingStory(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('يرجى كتابة عنوان القصة ونصها.');
      return;
    }

    playFanfareSound();
    confetti({ particleCount: 75, spread: 70 });
    onEarnStars(60);

    const storyObj: ReadingClubStory = {
      id: `club-story-${Date.now()}`,
      authorId: currentUser?.uid || 'user-local',
      authorName: authorName.trim() || 'بطل نادي القراءة',
      authorAvatar: '⭐',
      title: newTitle.trim(),
      category: newCategory,
      summary: newSummary.trim() || newContent.slice(0, 80) + '...',
      content: newContent.trim(),
      audioBlobUrl: recordedAudioUrl,
      audioDurationSec: recordingSeconds > 0 ? recordingSeconds : undefined,
      likes: 1,
      createdAt: 'الآن',
      comments: []
    };

    setClubStories((prev) => [storyObj, ...prev]);
    setShowPublishModal(false);

    // Save to Firestore
    publishReadingClubStoryToFirestore(storyObj).catch(() => {});

    // Reset inputs
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setRecordedAudioUrl('');
    setRecordingSeconds(0);
  };

  const handleLikeStory = (storyId: string) => {
    playSparkleSound();
    if (likedStories.includes(storyId)) return;
    setLikedStories((prev) => [...prev, storyId]);
    setClubStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, likes: s.likes + 1 } : s))
    );
    onEarnStars(5);
  };

  const handleCheerPeer = (peerId: string) => {
    playFanfareSound();
    confetti({ particleCount: 35, spread: 50 });
    if (likedPeers.includes(peerId)) return;
    setLikedPeers((prev) => [...prev, peerId]);
    setPeers((prev) =>
      prev.map((p) => (p.id === peerId ? { ...p, cheersCount: p.cheersCount + 1 } : p))
    );
    onEarnStars(10);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-7 animate-in fade-in duration-300">
      {/* Club Banner Header */}
      <div
        className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${
          mode === 'day'
            ? 'bg-gradient-to-r from-purple-100 via-pink-50 to-amber-50 border-purple-300 text-slate-800'
            : 'bg-gradient-to-r from-[#21093b] via-[#16062b] to-[#0c0419] border-purple-600/70 text-white shadow-purple-950/80'
        }`}
      >
        <div className="space-y-3 max-w-xl text-center md:text-right flex-grow">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-200 font-extrabold text-xs shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>الملتقى العام للأطفال والقراء الصغار</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black leading-tight flex items-center justify-center md:justify-start gap-2">
            <span>نادي القراءة والمكتبات الصوتية</span>
            <span className="text-3xl">🎙️📖</span>
          </h1>

          <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
            تفاعل مع أصدقاء المنصة، استمع لتسجيلاتهم الصوتية لقصصهم المفضلة، وانشر قصصك الخاصة كتابياً وبصوتك الجميل لكسب إعجاب الأصدقاء ونجوم خيال إضافية!
          </p>

          {/* Account Public/Private Switch (Matching user request) */}
          <div className="pt-2 flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <button
              onClick={handleTogglePublic}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 border transition-all cursor-pointer shadow-lg ${
                isPublicAccount
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-emerald-950 border-emerald-300 scale-102'
                  : 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 border-purple-500/50'
              }`}
            >
              {isPublicAccount ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>حسابي عام (مرئي في نادي القراءة) ✓</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>حسابي خاص (اضغط لجعله عاماً)</span>
                </>
              )}
            </button>

            {/* Publish Story CTA Button */}
            <button
              onClick={() => {
                playSparkleSound();
                setShowPublishModal(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-600 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 fill-current" />
              <span>انشر قصتك (كتابياً وصوتياً) ✍️🎙️</span>
            </button>
          </div>
        </div>

        {/* Mascot / Emblem */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-2 border-purple-400/40 shadow-2xl flex-shrink-0 bg-purple-950/40">
          <img
            src="/assets/aistudio/Capture_d__cran_2026-10-20_135700_a8f3d8ee.png"
            alt="Reading Club Mascot"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
            <span className="text-amber-300 text-[11px] font-black drop-shadow">
              ⭐ نادي القراءة: تشجيع وإلهام
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: المكتبات الصوتية للأصدقاء | قصص الأعضاء */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('voices');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'voices'
                ? 'bg-amber-400 text-amber-950 font-black shadow-lg scale-102'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>مكتبات الأصدقاء الصوتية ({peers.length + (isPublicAccount ? 1 : 0)})</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('stories');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stories'
                ? 'bg-amber-400 text-amber-950 font-black shadow-lg scale-102'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>قصص الأعضاء المنشورة ({clubStories.length})</span>
          </button>
        </div>

        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>تفاعل وشجع الأصدقاء لكسب النجوم!</span>
        </span>
      </div>

      {/* TAB 1: Community Voice Libraries (مكتبات الأصدقاء الصوتية) */}
      {activeTab === 'voices' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-200 text-xs font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📢</span>
              <span>
                هنا تظهر حسابات المستخدمين العامة ومكتباتهم الصوتية لتحفيز الجميع على القراءة والتسجيل!
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-300">
              {isPublicAccount ? 'حسابك عام ويظهر هنا 🟢' : 'حسابك خاص حالياً 🔒'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* If user account is public, render the user's own public card first! */}
            {isPublicAccount && (
              <div
                className={`p-5 rounded-3xl border-2 transition-all shadow-xl space-y-4 relative ${
                  mode === 'day'
                    ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-300 text-slate-800'
                    : 'bg-gradient-to-b from-[#142e23] to-[#0c1a14] border-emerald-400/70 text-white shadow-emerald-950/60'
                }`}
              >
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow">
                    حسابي (أنت) ⭐
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-2xl flex items-center justify-center border border-emerald-400/40">
                    ⭐
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-emerald-300">
                      {authorName}
                    </h3>
                    <span className="text-[11px] text-amber-400 font-bold block">
                      {starsCount >= 500 ? 'أمير الحكايات 👑' : 'نجم صاعد 🌟'} ({starsCount} نجمة)
                    </span>
                  </div>
                </div>

                <p className="text-xs opacity-80 leading-relaxed">
                  مكتبتي الصوتية العامة متاحة لأصدقاء نادي القراءة!
                </p>

                {/* User Voice Recordings list */}
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" />
                    <span>تسجيلاتي الصوتية المحفوظة ({userRecordings.length}):</span>
                  </span>

                  {userRecordings.length === 0 ? (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center text-xs opacity-75">
                      لم تسجل قراءات بعد. افتح أي قصة أو الكتاب المصور وسجل صوتك لتظهر هنا!
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                      {userRecordings.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-2.5 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="truncate">
                            <span className="font-bold block truncate">{rec.title}</span>
                            <span className="text-[10px] text-emerald-300">{rec.createdAt}</span>
                          </div>

                          <button
                            onClick={() => handlePlayAudio(rec.audioBlobUrl)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-black text-[11px] flex items-center gap-1 flex-shrink-0 cursor-pointer shadow"
                          >
                            {currentlyPlayingAudio === rec.audioBlobUrl ? (
                              <>
                                <Pause className="w-3 h-3 fill-current" />
                                <span>إيقاف</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-current" />
                                <span>استمع 🎧</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Community Peers Cards */}
            {peers.map((peer) => {
              const isLiked = likedPeers.includes(peer.id);
              return (
                <div
                  key={peer.id}
                  className={`p-5 rounded-3xl border transition-all shadow-xl space-y-4 ${
                    mode === 'day'
                      ? 'bg-white border-purple-200 text-slate-800'
                      : 'bg-[#181135]/90 border-purple-700/60 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-2xl flex items-center justify-center border border-purple-400/30">
                        {peer.avatar}
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-yellow-300">
                          {peer.name}
                        </h3>
                        <span className="text-[11px] text-purple-200 font-bold block">
                          {peer.rankTitle} ({peer.totalStars} ⭐)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCheerPeer(peer.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                        isLiked
                          ? 'bg-rose-500 text-white border-rose-300 shadow scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-rose-300 border-rose-400/40'
                      }`}
                      title="شجع هذا القارئ"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{peer.cheersCount}</span>
                    </button>
                  </div>

                  <p className="text-xs opacity-85 leading-relaxed">
                    {peer.bio}
                  </p>

                  {/* Peer's Recorded Stories */}
                  <div className="space-y-2 pt-1 border-t border-white/10">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5" />
                      <span>مكتبة {peer.name} الصوتية:</span>
                    </span>

                    <div className="space-y-1.5">
                      {peer.recordedStories.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="truncate">
                            <span className="font-bold block truncate text-purple-100">
                              {rec.title}
                            </span>
                            <span className="text-[10px] text-amber-300/80">
                              {rec.storyTitle} • {rec.durationSec} ثانية
                            </span>
                          </div>

                          <button
                            onClick={() => handlePlayAudio(rec.audioBlobUrl)}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 flex-shrink-0 cursor-pointer shadow"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>استمع 🎧</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Published Community Stories (قصص الأعضاء المنشورة) */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubStories.map((st) => {
              const isLiked = likedStories.includes(st.id);
              const isPlaying = currentlyPlayingAudio === st.audioBlobUrl && Boolean(st.audioBlobUrl);

              return (
                <div
                  key={st.id}
                  className={`p-5 rounded-3xl border transition-all shadow-xl space-y-3.5 ${
                    mode === 'day'
                      ? 'bg-white border-purple-200 text-slate-800'
                      : 'bg-[#181135]/90 border-purple-700/60 text-white'
                  }`}
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{st.authorAvatar}</span>
                      <div>
                        <h4 className="font-black text-xs sm:text-sm text-yellow-300">
                          {st.authorName}
                        </h4>
                        <span className="text-[10px] text-purple-200/70">{st.createdAt}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      {st.category === 'foreign_languages' ? 'قصة باللغات 🌍' : 'قصة خيالية ✨'}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {st.title}
                    </h3>
                    <p className="text-xs opacity-90 leading-relaxed mt-1">
                      {st.content}
                    </p>
                  </div>

                  {/* Audio Recital Bar if available */}
                  {st.audioBlobUrl && (
                    <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-pink-500/40 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
                        <span>استمع للقصة بصوت المؤلف 🎙️</span>
                      </span>

                      <button
                        onClick={() => handlePlayAudio(st.audioBlobUrl!)}
                        className="px-3 py-1 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isPlaying ? 'إيقاف' : 'تشغيل الصوت'}</span>
                      </button>
                    </div>
                  )}

                  {/* Likes & Interactions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLikeStory(st.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-rose-500 text-white border-rose-300 shadow'
                            : 'bg-white/10 hover:bg-white/20 text-rose-300 border-rose-400/40'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{st.likes} إعجاب</span>
                      </button>

                      <span className="text-purple-300 flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{st.comments?.length || 0} تعليق</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-amber-300 font-bold">
                      ⭐ +10 نقاط مشاركة
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Publish Story Written & Voiced (نشر قصة كتابياً وصوتياً) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xl bg-black/80 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-500 bg-gradient-to-b from-[#21093b] via-[#16062b] to-[#0c0419] text-white my-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <span>✍️🎙️</span>
                <span>انشر قصتك في نادي القراءة (كتابياً وصوتياً)</span>
              </h3>
              <button
                onClick={() => setShowPublishModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishStory} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200">اسم الكاتب الصغير:</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="اسمك أو لقبك المفضل"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-purple-600/60 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-purple-200">عنوان القصة:</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: مغامرة الفراشة والأمير"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-purple-600/60 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-purple-200">التصنيف:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1e0a36] border border-purple-600/60 text-xs text-white focus:outline-none"
                  >
                    <option value="fantasy">قصص خيالية ✨</option>
                    <option value="foreign_languages">قصص باللغات الأجنبية 🌍</option>
                    <option value="adventure">مغامرات شيقة 🚀</option>
                    <option value="nature">عالم الحيوان والطبيعة 🐾</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200">نص القصة كاملاً:</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="اكتب حكايتك الجميلة هنا بأسلوبك الرائع..."
                  className="w-full p-3 rounded-xl bg-white/10 border border-purple-600/60 text-xs text-white leading-relaxed focus:outline-none"
                />
              </div>

              {/* Voice Recording Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/60 to-purple-950/60 border border-rose-500/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-pink-300 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-pink-400" />
                    <span>سجّل قراءتك للقصة بصوتك (اختياري +20 نجمة إضافية):</span>
                  </span>
                  {recordedAudioUrl && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> تم التسجيل ({recordingSeconds}s)
                    </span>
                  )}
                </div>

                {!isRecordingStory && !recordedAudioUrl && (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <Mic className="w-4 h-4" />
                    <span>ابدأ تسجيل صوتك للقصة</span>
                  </button>
                )}

                {isRecordingStory && (
                  <div className="flex items-center justify-between gap-3 p-2 bg-rose-900/50 rounded-xl">
                    <span className="text-xs font-bold text-rose-300 animate-pulse">
                      🔴 جاري تسجيل صوتك: {recordingSeconds} ثانية
                    </span>
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="px-3 py-1 bg-rose-600 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>إيقاف التسجيل</span>
                    </button>
                  </div>
                )}

                {recordedAudioUrl && !isRecordingStory && (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(recordedAudioUrl)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>استمع لتسجيلك 🎧</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/20"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إعادة</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>نشر القصة في نادي القراءة (+60 ⭐)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
