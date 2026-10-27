import React, { useState } from 'react';
import { AppMode } from '../types';
import {
  X,
  Crown,
  Check,
  Star,
  Sparkles,
  Shield,
  Zap,
  BookOpen,
  Mic,
  Gamepad2,
  Award,
  Heart,
  Gift
} from 'lucide-react';
import { playClickSound, playSparkleSound, playFanfareSound, playPopSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SubscriptionUpgradeModalProps {
  mode: AppMode;
  isOpen: boolean;
  onClose: () => void;
  starsCount: number;
  onEarnStars: (amount: number) => void;
}

export type SubscriptionTier = 'free' | 'explorer' | 'vip';

export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  mode,
  isOpen,
  onClose,
  starsCount,
  onEarnStars,
}) => {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('raed_user_subscription_tier') as SubscriptionTier) || 'free';
    }
    return 'free';
  });

  const [toastMessage, setToastMessage] = useState<string>('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSelectTier = (tier: SubscriptionTier, starCost: number) => {
    playClickSound();

    if (tier === 'free') {
      setCurrentTier('free');
      localStorage.setItem('raed_user_subscription_tier', 'free');
      showToast('أنت الآن على الخطة المجانية الدائمة — لا توجد أي رسوم أو التزامات! 🎁');
      return;
    }

    if (starsCount < starCost) {
      playPopSound();
      showToast(`تحتاج إلى ${starCost} نجمة خيال لتفعيل هذه الخطة بنجومك. اقرأ المزيد من القصص واجمع النجوم! ⭐`);
      return;
    }

    // Upgrade using earned fantasy stars (keeping real money at zero, exactly as requested!)
    playFanfareSound();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setCurrentTier(tier);
    localStorage.setItem('raed_user_subscription_tier', tier);
    showToast(`تهانينا! تم تفعيل خطة ${tier === 'vip' ? 'المملكة الذهبية VIP' : 'المستكشف البطل'} بنجاح مجاناً بنجومك! 👑✨`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      dir="rtl"
    >
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#21113b] via-[#160a2c] to-[#0c051a] border-2 border-amber-400/60 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-500/20 via-purple-900/60 to-pink-500/20 border-b border-amber-400/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shadow-lg shadow-amber-400/30 font-black">
              <Crown className="w-6 h-6 fill-current" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black text-amber-300">
                  خطط الاشتراك والترقية في منصة رائد 👑✨
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  حسابك مجاني 100%
                </span>
              </div>
              <p className="text-xs text-purple-200">
                اختر خطة الترقية المناسبة مع الاحتفاظ بحسابك مجاني بالكامل وبدون أي تكلفة!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-all cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reassurance Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-teal-900/80 to-emerald-950/80 border-b border-emerald-500/40 p-3 px-6 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 text-emerald-200 font-bold">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              ضمان الأمان: <strong className="text-white">حسابك مجاني دائمًا مدى الحياة</strong>. يمكنك ترقية الميزات مجانًا باستخدام نجوم الخيال التي تجمعها من القراءة والتسجيل!
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-amber-400/40 text-amber-300 font-black">
            <span>رصيد نجومك:</span>
            <span className="text-yellow-400 font-mono text-sm">{starsCount}</span>
            <span>⭐</span>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-amber-400 text-amber-950 font-black text-xs px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2 shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-grow no-scrollbar">
          {/* 3 Subscription Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TIER 1: FREE FOREVER (الحساب المجاني الدائم) */}
            <div
              className={`relative rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                currentTier === 'free'
                  ? 'bg-gradient-to-b from-purple-900/50 to-indigo-950/80 border-emerald-400 shadow-xl shadow-emerald-900/20 ring-2 ring-emerald-400/30'
                  : 'bg-white/5 border-white/15 hover:border-purple-400/50'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🌱</span>
                  {currentTier === 'free' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow">
                      خطتك الحالية المفعلة ✅
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">الخطة المجانية الدائمة</h4>
                  <p className="text-xs text-purple-300">مثالية لكل الأطفال والعائلات</p>
                </div>

                <div className="py-2 border-y border-white/10">
                  <div className="flex items-baseline gap-1 text-emerald-400 font-black">
                    <span className="text-3xl">0</span>
                    <span className="text-xs">دج / مجاناً دائماً</span>
                  </div>
                  <span className="text-[10px] text-purple-300">بدون أي بطاقة مصرفية أو رسوم</span>
                </div>

                <ul className="space-y-2 text-xs text-purple-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>قراءة وتصفح القصص اليومية المشوقة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>كتاب مصور تفاعلي مع الصوت الذكي</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>تسجيل صوت القراءة ونيل +40 نجمة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>راديو النوم الهادئ لراحة الأطفال 🌙</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>ألعاب التحدي وألغاز الذاكرة</span>
                  </li>
                </ul>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => handleSelectTier('free', 0)}
                  disabled={currentTier === 'free'}
                  className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    currentTier === 'free'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 cursor-default'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {currentTier === 'free' ? 'أنت في هذه الخطة المجانية' : 'الرجوع للخطة المجانية'}
                </button>
              </div>
            </div>

            {/* TIER 2: EXPLORER HERO (المستكشف البطل) */}
            <div
              className={`relative rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                currentTier === 'explorer'
                  ? 'bg-gradient-to-b from-purple-900/60 to-indigo-950/90 border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/40'
                  : 'bg-white/5 border-white/15 hover:border-amber-400/50'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🚀</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 shadow">
                    شائعة جداً ⭐
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-amber-300">خطة المستكشف البطل</h4>
                  <p className="text-xs text-purple-300">للأطفال المحبين للتأليف والإبداع</p>
                </div>

                <div className="py-2 border-y border-white/10">
                  <div className="flex items-baseline gap-1 text-amber-300 font-black">
                    <span className="text-2xl sm:text-3xl">200 ⭐</span>
                    <span className="text-xs">أو ترقية مجانية</span>
                  </div>
                  <span className="text-[10px] text-amber-200/80">تفعل مجاناً بنجوم الخيال</span>
                </div>

                <ul className="space-y-2 text-xs text-purple-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>جميع مزايا الخطة المجانية بالكامل</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>تأليف عدد غير محدود من الكتب المصورة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>تخصيص ورفع أغلفة القصص بحرية مطلقة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>شارة "المستكشف البطل" في الملف الشخصي</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>مضاعفة نجوم المكافآت (x1.5)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => handleSelectTier('explorer', 200)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    currentTier === 'explorer'
                      ? 'bg-amber-400 text-amber-950 shadow-md font-black'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 hover:brightness-110 active:scale-95'
                  }`}
                >
                  {currentTier === 'explorer'
                    ? 'الخطة مفعلة بنجاح ✨'
                    : 'ترقية مجاناً بـ 200 نجمة ⭐'}
                </button>
              </div>
            </div>

            {/* TIER 3: GOLDEN VIP KINGDOM (المملكة الذهبية VIP) */}
            <div
              className={`relative rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                currentTier === 'vip'
                  ? 'bg-gradient-to-b from-purple-900/80 via-pink-950/80 to-purple-950/90 border-[#ff2a85] shadow-2xl shadow-pink-600/30 ring-2 ring-pink-500/50'
                  : 'bg-white/5 border-white/15 hover:border-pink-500/50'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">👑</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow">
                    VIP الملكي الفاخر
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-pink-300">خطة المملكة الذهبية</h4>
                  <p className="text-xs text-purple-300">التجربة الكاملة لعالم شهرزاد ورائد</p>
                </div>

                <div className="py-2 border-y border-white/10">
                  <div className="flex items-baseline gap-1 text-pink-300 font-black">
                    <span className="text-2xl sm:text-3xl">400 ⭐</span>
                    <span className="text-xs">أو ترقية مجانية</span>
                  </div>
                  <span className="text-[10px] text-pink-200/80">فتح كل الإمكانيات مجاناً بالنجوم</span>
                </div>

                <ul className="space-y-2 text-xs text-purple-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <span>جميع مزايا الخطط السابقة معاً</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <span>مرافقة كافة شخصيات شهرزاد الثمانية الخيالية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <span>ألعاب التحدي الحصرية ومحرر الألعاب التفاعلي</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <span>توليد وتنزيل شهادات إنجاز ملكية مصورة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <span>وسام التاج الملكي الذهبي بجانب اسم الطفل</span>
                  </li>
                </ul>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => handleSelectTier('vip', 400)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    currentTier === 'vip'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 text-white hover:brightness-110 active:scale-95'
                  }`}
                >
                  {currentTier === 'vip'
                    ? 'الخطة الملكية مفعلة 👑'
                    : 'ترقية مجاناً بـ 400 نجمة 👑'}
                </button>
              </div>
            </div>
          </div>

          {/* Educational Note for Parents */}
          <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/30 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0 text-xl">
              🎁
            </span>
            <div className="space-y-0.5 text-xs text-right">
              <h5 className="font-bold text-amber-300">ملاحظة موجهة لأولياء الأمور والأطفال:</h5>
              <p className="text-purple-200/90 leading-relaxed">
                موقع رائد للقصص مصمم بروح تربوية تشجيعية، لذلك يتم تقديم الحساب الأساسي <strong className="text-white">مجاناً بالكامل وبدون أي اشتراكات مدفوعة أو إعلانات مزعجة</strong>. ترقية الميزات تتم من خلال مكافأة الطفل على القراءة والتسجيل بحساب نجوم الخيال التي يجمعها بجهده!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border-t border-purple-500/30 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="text-xs text-purple-200">
            حسابك الحالي: <strong className="text-amber-300">{currentTier === 'free' ? 'المجاني الدائم' : currentTier === 'explorer' ? 'المستكشف البطل' : 'المملكة الذهبية VIP'}</strong>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs transition-all cursor-pointer"
          >
            حسناً، فهمت ✨
          </button>
        </div>
      </div>
    </div>
  );
};
