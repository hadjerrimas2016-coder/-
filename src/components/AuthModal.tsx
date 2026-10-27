import React, { useState } from 'react';
import { AppMode } from '../types';
import { LogIn, LogOut, CheckCircle2, Star, Mic, Bookmark, ShieldCheck, X, Sparkles, AlertCircle } from 'lucide-react';
import { loginWithGoogle, logoutUser, isOwnerAdmin } from '../firebase';
import { playClickSound, playSparkleSound, playPopSound } from '../utils/audio';
import { User } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AppMode;
  currentUser: User | null;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentUser,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      playClickSound();
      await loginWithGoogle();
      playSparkleSound();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-blocked') {
        setErrorMsg('تم حظر النافذة المنبثقة من قبل المتصفح، يرجى السماح بالنوافذ المنبثقة لتسجيل الدخول.');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية.');
      } else {
        setErrorMsg(err?.message || 'تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      playClickSound();
      await logoutUser();
      playPopSound();
      onClose();
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء تسجيل الخروج.');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = isOwnerAdmin(currentUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all ${
          mode === 'day'
            ? 'bg-gradient-to-b from-white via-amber-50/40 to-sky-50 border-amber-200 text-slate-800'
            : 'bg-gradient-to-b from-[#18113c] via-[#140e33] to-[#0c0822] border-purple-500/40 text-white'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-current transition-transform active:scale-95 cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#140e33] flex items-center justify-center text-3xl">
              {currentUser ? '🌟' : '🔑'}
            </div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              {currentUser ? 'حسابك في عالم رائد' : 'تسجيل الدخول إلى عالم رائد'}
            </h3>
            <p className="text-xs sm:text-sm opacity-80 mt-1">
              {currentUser
                ? 'أهلاً بك! حسابك متصل ويتم حفظ كل نشاطاتك تلقائياً.'
                : 'سجّل دخولك لحفظ نجوم الخيال وتسجيلاتك الصوتية ومفضلتك.'}
            </p>
          </div>
        </div>

        {/* If already logged in */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'المستخدم'}
                  className="w-12 h-12 rounded-full ring-2 ring-amber-400 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xl font-black">
                  🧑‍🚀
                </div>
              )}
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center gap-1.5 font-bold text-sm truncate">
                  <span>{currentUser.displayName || 'بطل رائد'}</span>
                  {isOwner && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
                      المالك 👑
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-70 truncate">{currentUser.email}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>حسابك نشط ومحمي. كل تسجيلاتك الصوتية ونقاطك محفوظة بأمان.</span>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{loading ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}</span>
            </button>
          </div>
        ) : (
          /* If NOT logged in */
          <div className="space-y-4">
            {/* Features list */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-right">
              <div className="flex items-center gap-2 font-bold">
                <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>حفظ رصيد نجوم الخيال والأوسمة المكتسبة</span>
              </div>
              <div className="flex items-center gap-2 font-bold">
                <Mic className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>حفظ جميع تسجيلاتك الصوتية لكتب وقصص الأطفال</span>
              </div>
              <div className="flex items-center gap-2 font-bold">
                <Bookmark className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>حفظ القصص المفضلة وقراءتها في أي وقت</span>
              </div>
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>دخول مجاني 100% وآمن تماماً للأطفال والعائلة</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Login Primary CTA */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer ring-2 ring-amber-300"
            >
              {loading ? (
                <span>جارٍ الاتصال بـ Google...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>الدخول الفوري بحساب Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center opacity-60">
              الدخول مجاني بالكامل ولا يتطلب أي رسوم أو بطاقات دفع 🛡️
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
