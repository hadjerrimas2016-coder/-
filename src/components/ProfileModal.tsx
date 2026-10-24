import React, { useState } from 'react';
import { AppMode, Badge, UserAudioRecording } from '../types';
import {
  Trophy,
  Award,
  Sparkles,
  Heart,
  Star,
  CheckCircle2,
  Lock,
  Smile,
  Mic,
  Play,
  Pause,
  Trash2,
  Download,
  LogIn,
  LogOut,
  UserCheck,
  Crown,
  Volume2
} from 'lucide-react';
import { playClickSound, playSparkleSound, playPopSound } from '../utils/audio';
import { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser, isOwnerAdmin } from '../firebase';

interface ProfileModalProps {
  mode: AppMode;
  starsCount: number;
  favoriteIds: string[];
  totalStoriesCount: number;
  currentUser: User | null;
  onOpenAdmin?: () => void;
  userRecordings: UserAudioRecording[];
  onDeleteRecording: (id: string) => void;
}

const AVATARS = [
  { id: '1', emoji: '🧑‍🚀', name: 'رائد الفضاء' },
  { id: '2', emoji: '🦊', name: 'الثعلب اللطيف' },
  { id: '3', emoji: '👸', name: 'الأميرة الصغيرة' },
  { id: '4', emoji: '🦁', name: 'الشبل الشجاع' },
  { id: '5', emoji: '🧙‍♂️', name: 'الساحر العجيب' },
  { id: '6', emoji: '🤖', name: 'الروبوت الذكي' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  mode,
  starsCount,
  favoriteIds,
  totalStoriesCount,
  currentUser,
  onOpenAdmin,
  userRecordings,
  onDeleteRecording,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'recordings'>('profile');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('1');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isOwner = isOwnerAdmin(currentUser);

  const handleTogglePlayAudio = (rec: UserAudioRecording) => {
    if (playingAudioId === rec.id && audioElement) {
      audioElement.pause();
      setPlayingAudioId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(rec.audioBlobUrl);
      audio.onended = () => setPlayingAudioId(null);
      audio.play();
      setAudioElement(audio);
      setPlayingAudioId(rec.id);
    }
  };

  const handleDownloadAudio = (rec: UserAudioRecording) => {
    playClickSound();
    const a = document.createElement('a');
    a.href = rec.audioBlobUrl;
    a.download = `${rec.title || 'تسجيلي_الصوتي'}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      playClickSound();
      await loginWithGoogle();
      playSparkleSound();
    } catch (err: any) {
      alert(`تعذر تسجيل الدخول: ${err?.message || err}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      playClickSound();
      await logoutUser();
    } catch (err: any) {
      console.error(err);
    }
  };

  const badges: Badge[] = [
    {
      id: 'b1',
      title: 'مستكشف النجوم',
      description: 'اجمع 20 نجمة من القصص والألعاب',
      icon: '⭐',
      unlocked: starsCount >= 20,
      requiredStars: 20,
    },
    {
      id: 'b2',
      title: 'فنان الألوان',
      description: 'ارسم وابدع في مرسم رائد',
      icon: '🎨',
      unlocked: starsCount >= 40,
      requiredStars: 40,
    },
    {
      id: 'b3',
      title: 'عبقري الأشكال',
      description: 'ركّب نماذج الصاروخ والبيت',
      icon: '🧩',
      unlocked: starsCount >= 60,
      requiredStars: 60,
    },
    {
      id: 'b4',
      title: 'القارئ الصوتي الصغير',
      description: 'سجّل بصوتك في الكتاب المصور واحفظه في مكتبتك',
      icon: '🎙️',
      unlocked: userRecordings.length >= 1,
      requiredStars: 0,
    },
    {
      id: 'b5',
      title: 'رائد الفضاء الكبير',
      description: 'حقق 120 نجمة وافتح مجرة البطولات',
      icon: '🚀',
      unlocked: starsCount >= 120,
      requiredStars: 120,
    },
  ];

  const currentAvatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      {/* Top Profile & Authentication Card */}
      <div
        className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 ${
          mode === 'day'
            ? 'bg-gradient-to-tr from-amber-100 via-sky-50 to-indigo-50 border-amber-200'
            : 'bg-gradient-to-tr from-indigo-950 via-purple-950 to-[#221042] border-purple-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
          {/* Avatar Bubble */}
          <div className="relative">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'صورة الحساب'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-xl ring-4 ring-amber-400"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-400 flex items-center justify-center text-5xl sm:text-6xl shadow-xl ring-4 ring-white/60">
                {currentAvatar.emoji}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 text-2xl animate-bounce">✨</span>
          </div>

          {/* User Info & Status */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl sm:text-3xl font-black">
                {currentUser?.displayName || 'بطل رائد المستكشف'}
              </h2>
              {currentUser && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>حساب مسجل</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm opacity-80">
              {currentUser
                ? 'مرحباً بك في عالم رائد! تسجيلاتك الصوتية وإنجازاتك محفوظة في حسابك.'
                : 'سجل دخولك مجاناً للاحتفاظ بتسجيلاتك الصوتية ونقاط الخيال!'}
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
              <span className="px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-300 text-amber-500 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{starsCount} نقطة</span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-300 text-rose-500 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{favoriteIds.length} بالمفضلة</span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-300 text-purple-400 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                <Mic className="w-3.5 h-3.5" />
                <span>{userRecordings.length} تسجيل صوتي</span>
              </span>
            </div>
          </div>
        </div>

        {/* Login / Logout Action for All Users */}
        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          {!currentUser ? (
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoggingIn ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول عبر Google'}</span>
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-xs font-bold text-red-300 border border-white/20 hover:border-red-400 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          )}

          {/* IF OWNER: Protected shortcut directly into Admin CMS */}
          {isOwner && onOpenAdmin && (
            <button
              onClick={() => {
                playClickSound();
                onOpenAdmin();
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>فتح لوحة المالك ونشر Firebase 👑</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Section Tabs: Overview vs My Audio Library */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('profile');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-purple-600 text-white shadow'
              : 'hover:bg-white/10 text-purple-300'
          }`}
        >
          <span>الملف الشخصي والأوسمة</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('recordings');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'recordings'
              ? 'bg-purple-600 text-white shadow'
              : 'hover:bg-white/10 text-purple-300'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>مكتبتي الصوتية ({userRecordings.length})</span>
        </button>
      </div>

      {/* SubTab 1: Profile & Badges */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6">
          {/* Choose Avatar Grid */}
          <div
            className={`p-5 rounded-3xl border shadow-md space-y-3 ${
              mode === 'day' ? 'bg-white/90 border-sky-100' : 'bg-[#181339]/90 border-purple-800/60'
            }`}
          >
            <h3 className="font-extrabold text-sm sm:text-base text-amber-500 flex items-center gap-1.5">
              <Smile className="w-4 h-4" />
              <span>اختر شخصيتك الكرتونية المفضلة:</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => {
                    playSparkleSound();
                    setSelectedAvatar(av.id);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    selectedAvatar === av.id
                      ? 'bg-gradient-to-tr from-amber-300 to-yellow-200 border-amber-500 scale-105 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 border-white/10'
                  }`}
                >
                  <span className="text-3xl">{av.emoji}</span>
                  <span className="text-[11px] font-bold mt-1 text-slate-800 dark:text-purple-200">
                    {av.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Badges & Achievements Collection */}
          <div
            className={`p-5 rounded-3xl border shadow-md space-y-4 ${
              mode === 'day' ? 'bg-white/90 border-sky-100' : 'bg-[#181339]/90 border-purple-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-amber-500 flex items-center gap-1.5">
                <Award className="w-5 h-5 text-amber-500" />
                <span>أوسمة وبطولات رائد ({badges.filter((b) => b.unlocked).length} / {badges.length})</span>
              </h3>
              <span className="text-xs opacity-75">اجمع النجوم وسجل صوتك لفتح الأوسمة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                    badge.unlocked
                      ? 'bg-gradient-to-tr from-amber-400/15 to-yellow-300/10 border-amber-400/40 shadow-sm'
                      : 'opacity-50 bg-black/10 border-white/10'
                  }`}
                >
                  <div className="text-3xl p-2 rounded-2xl bg-white/20 flex-shrink-0">
                    {badge.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm">{badge.title}</h4>
                      {badge.unlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">{badge.description}</p>
                    <div className="text-[10px] font-bold text-amber-500">
                      {badge.unlocked ? 'تم الفتح بنجاح! ⭐' : `يحتاج ${badge.requiredStars} نجمة`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: My Audio Library (مكتبتي الصوتية الخاصة) */}
      {activeSubTab === 'recordings' && (
        <div
          className={`p-5 rounded-3xl border shadow-md space-y-4 ${
            mode === 'day' ? 'bg-white/90 border-sky-100' : 'bg-[#181339]/90 border-purple-800/60'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-400 flex items-center gap-2">
                <Mic className="w-5 h-5 text-amber-400" />
                <span>مكتبتي الصوتية الشخصية</span>
              </h3>
              <p className="text-xs opacity-75">
                هنا تجد جميع قراءاتك الصوتية المسجلة في الكتاب المصور لتستمع إليها متى شئت أو تحتفظ بها!
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              {userRecordings.length} تسجيل
            </span>
          </div>

          {userRecordings.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl">
                🎙️
              </div>
              <h4 className="text-sm font-black text-purple-200">لا توجد تسجيلات صوتية بعد</h4>
              <p className="text-xs text-purple-300/70 max-w-sm mx-auto">
                افتح أي صفحة في <strong>الكتاب المصور</strong> أو القصص التفاعلية، واضغط على زر الميكروفون
                لتسجيل قراءتك بصوتك الرائع، وسيتم حفظها هنا تلقائياً في مكتبتك الصوتية الخاصة!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {userRecordings.map((rec) => {
                const isPlaying = playingAudioId === rec.id;
                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-white/5 border border-purple-600/40 hover:border-purple-400 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={() => handleTogglePlayAudio(rec)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-90 cursor-pointer ${
                          isPlaying
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                        }`}
                        title={isPlaying ? 'إيقاف مؤقت' : 'استماع للتسجيل'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 mr-0.5 fill-current" />}
                      </button>

                      <div className="truncate space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-black text-amber-300 truncate">
                          {rec.title}
                        </h4>
                        <p className="text-[11px] text-purple-200/80 truncate">
                          {rec.storyTitle} - صفحة {rec.pageNumber}
                        </p>
                        <span className="text-[10px] text-purple-300/60 block">
                          {rec.createdAt} ({rec.durationSec} ثانية)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDownloadAudio(rec)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 transition-all cursor-pointer"
                        title="تحميل التسجيل إلى جهازك"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          playPopSound();
                          onDeleteRecording(rec.id);
                        }}
                        className="p-2 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white transition-all cursor-pointer"
                        title="حذف التسجيل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
