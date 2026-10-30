import React, { useState, useEffect, useRef } from 'react';
import { AppMode } from '../types';
import {
  X,
  ChefHat,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Check,
  Star,
  Play,
  Heart,
  Timer,
  UtensilsCrossed,
  Layers,
  ArrowRight,
  ArrowLeft,
  Smile,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playClickSound,
  playSparkleSound,
  playPopSound,
  playFanfareSound,
  playCorrectSound,
  playSizzleSound,
  playMicrowaveDingSound,
  playChopSound,
  playBubbleSound,
  speakArabicSpeech
} from '../utils/audio';

interface CookingGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnStars: (amount: number, reason: string) => void;
  mode: AppMode;
}

type RecipeId = 'burger' | 'sushi' | 'meatballs' | 'pie' | 'mixer';

interface RecipeInfo {
  id: RecipeId;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  starsReward: number;
}

const RECIPES: RecipeInfo[] = [
  {
    id: 'burger',
    title: 'برغر الشيف الشهي 🍔',
    subtitle: 'شواء اللحم في المقلاة وتجميع البرغر بالجبن والصلصة',
    icon: '🍔',
    color: 'from-amber-500 to-orange-600',
    starsReward: 30,
  },
  {
    id: 'sushi',
    title: 'سوشي رولز الياباني 🍣',
    subtitle: 'فرد الأرز والسلمون ولف الماكي وتقطيعه',
    icon: '🍣',
    color: 'from-emerald-500 to-teal-600',
    starsReward: 30,
  },
  {
    id: 'meatballs',
    title: 'كرات اللحم والريحان 🧆',
    subtitle: 'خلط التوابل وتحمير كرات اللحم في الصلصة',
    icon: '🧆',
    color: 'from-rose-500 to-red-600',
    starsReward: 25,
  },
  {
    id: 'pie',
    title: 'فطيرة الفواكه بالميكروويف 🥧',
    subtitle: 'فرد العجين بالشوبك وخبز الفطيرة الذهبية',
    icon: '🥧',
    color: 'from-pink-500 to-purple-600',
    starsReward: 35,
  },
  {
    id: 'mixer',
    title: 'خلاط النكهات والصلصات 🥣',
    subtitle: 'خلط المكونات بالمضرب الكهربائي وسكب الكاتشب',
    icon: '🥣',
    color: 'from-blue-500 to-indigo-600',
    starsReward: 20,
  },
];

export const CookingGameModal: React.FC<CookingGameModalProps> = ({
  isOpen,
  onClose,
  onEarnStars,
  mode,
}) => {
  const [activeRecipe, setActiveRecipe] = useState<RecipeId>('burger');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [completedRecipes, setCompletedRecipes] = useState<RecipeId[]>([]);
  const [totalChefStars, setTotalChefStars] = useState<number>(0);
  const [feedbackToast, setFeedbackToast] = useState<string>('');

  // ---------------- Burger Game State ----------------
  const [isStoveOn, setIsStoveOn] = useState<boolean>(false);
  const [isPattyInPan, setIsPattyInPan] = useState<boolean>(false);
  const [pattyCookProgress, setPattyCookProgress] = useState<number>(0); // 0 to 100
  const [isPattyFlipped, setIsPattyFlipped] = useState<boolean>(false);
  const [isPattyCooked, setIsPattyCooked] = useState<boolean>(false);
  const [burgerLayers, setBurgerLayers] = useState<string[]>(['bottom-bun']);
  const [burgerDone, setBurgerDone] = useState<boolean>(false);

  // ---------------- Sushi Game State ----------------
  const [hasNori, setHasNori] = useState<boolean>(false);
  const [hasRice, setHasRice] = useState<boolean>(false);
  const [sushiFillings, setSushiFillings] = useState<string[]>([]);
  const [isSushiRolled, setIsSushiRolled] = useState<boolean>(false);
  const [sushiPiecesCount, setSushiPiecesCount] = useState<number>(0);
  const [sushiDone, setSushiDone] = useState<boolean>(false);

  // ---------------- Meatballs Game State ----------------
  const [meatballIngredientsAdded, setMeatballIngredientsAdded] = useState<string[]>([]);
  const [isMeatMixed, setIsMeatMixed] = useState<boolean>(false);
  const [meatballsCount, setMeatballsCount] = useState<number>(0);
  const [meatballsCooked, setMeatballsCooked] = useState<boolean>(false);
  const [hasSauceAndBasil, setHasSauceAndBasil] = useState<boolean>(false);
  const [meatballsDone, setMeatballsDone] = useState<boolean>(false);

  // ---------------- Pie Game State ----------------
  const [doughRollCount, setDoughRollCount] = useState<number>(0);
  const [pieFillingsAdded, setPieFillingsAdded] = useState<string[]>([]);
  const [pieInMicrowave, setPieInMicrowave] = useState<boolean>(false);
  const [microwaveTimer, setMicrowaveTimer] = useState<number>(3);
  const [pieBaked, setPieBaked] = useState<boolean>(false);
  const [pieGlazed, setPieGlazed] = useState<boolean>(false);
  const [pieDone, setPieDone] = useState<boolean>(false);

  // ---------------- Mixer Game State ----------------
  const [mixerIngredients, setMixerIngredients] = useState<string[]>([]);
  const [isMixerRunning, setIsMixerRunning] = useState<boolean>(false);
  const [mixerBatterColor, setMixerBatterColor] = useState<string>('cream');
  const [sauceSquirtCount, setSauceSquirtCount] = useState<number>(0);
  const [mixerDone, setMixerDone] = useState<boolean>(false);

  // Mascot message state
  const [mascotMessage, setMascotMessage] = useState<string>(
    'أهلاً بك في مطبخنا الوردي الرائع! اختر وصفتك المفضلة لنبدأ الطبخ معاً 🧑‍🍳✨'
  );

  const showNotification = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  // Cooking sizzling ticker for burger
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStoveOn && isPattyInPan && !isPattyCooked) {
      interval = setInterval(() => {
        setPattyCookProgress((prev) => {
          if (prev % 20 === 0 && !soundMuted) {
            playSizzleSound();
          }
          if (prev >= 100) {
            clearInterval(interval);
            setIsPattyCooked(true);
            showNotification('استوت شريحة اللحم تماماً! انقلها للبرغر 🥩✨');
            return 100;
          }
          return prev + 5;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isStoveOn, isPattyInPan, isPattyCooked, soundMuted]);

  // Microwave countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pieInMicrowave && !pieBaked && microwaveTimer > 0) {
      timer = setInterval(() => {
        setMicrowaveTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPieBaked(true);
            playMicrowaveDingSound();
            showNotification('دينغ! 🔔 نضجت الفطيرة الشهية وتفوح رائحتها الزكية!');
            return 0;
          }
          playPopSound();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pieInMicrowave, pieBaked, microwaveTimer]);

  if (!isOpen) return null;

  // ---------------- Burger Handlers ----------------
  const handleToggleStove = () => {
    playClickSound();
    const next = !isStoveOn;
    setIsStoveOn(next);
    if (next) {
      playSizzleSound();
      showNotification('تم إشعال موقد الغاز! 🔥 المقلاة جاهزة الآن');
    }
  };

  const handleAddPattyToPan = () => {
    if (!isStoveOn) {
      showNotification('أشعل الموقد أولاً لتسخين المقلاة! 🔥');
      return;
    }
    playSizzleSound();
    setIsPattyInPan(true);
    setPattyCookProgress(10);
    showNotification('وضعت شريحة اللحم في المقلاة! راقب النضوج وقلّبها 🍳');
  };

  const handleFlipPatty = () => {
    if (!isPattyInPan || isPattyCooked) return;
    playChopSound();
    playSizzleSound();
    setIsPattyFlipped(!isPattyFlipped);
    setPattyCookProgress((prev) => Math.min(100, prev + 25));
    showNotification('تقليب ممتاز بالملعقة الفضية! 🥄🥩');
  };

  const handleAddBurgerLayer = (layer: string) => {
    playPopSound();
    if (layer === 'lettuce') playChopSound();
    if (layer === 'patty') {
      if (!isPattyCooked) {
        showNotification('اطبخ شريحة اللحم في المقلاة أولاً حتى تنضج! 🍳');
        return;
      }
    }
    if (layer === 'ketchup') playBubbleSound();

    if (!burgerLayers.includes(layer)) {
      setBurgerLayers((prev) => [...prev, layer]);
    }
  };

  const handleFinishBurger = () => {
    if (!burgerLayers.includes('patty')) {
      showNotification('البرغر يحتاج شريحة اللحم المشوية! 🥩');
      return;
    }
    playFanfareSound();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    setBurgerDone(true);
    if (!completedRecipes.includes('burger')) {
      setCompletedRecipes((prev) => [...prev, 'burger']);
      setTotalChefStars((prev) => prev + 30);
      onEarnStars(30, 'تحضير برغر الشيف الشهي');
    }
    speakArabicSpeech('ما شاء الله! صنعت أشهى برغر كأفضل شيف صغير!');
    setMascotMessage('وااو! البرغر يبدو لذيذاً ومقرمشاً مع الجبن والكاتشب! 🍔⭐ أحسنت!');
  };

  // ---------------- Sushi Handlers ----------------
  const handleAddSushiFilling = (filling: string) => {
    playChopSound();
    if (!sushiFillings.includes(filling)) {
      setSushiFillings((prev) => [...prev, filling]);
      showNotification(`أضفت ${filling === 'salmon' ? 'السلمون الطازج 🍣' : filling === 'cucumber' ? 'الخيار المقرمش 🥒' : 'الأفوكادو 🥑'}`);
    }
  };

  const handleRollSushi = () => {
    if (!hasNori || !hasRice || sushiFillings.length === 0) {
      showNotification('ضع النوري ثم الأرز ثم الحشوات قبل اللف! 🍱');
      return;
    }
    playPopSound();
    playSparkleSound();
    setIsSushiRolled(true);
    showNotification('تم لف حصيرة الخيزران بإحكام! حان وقت التقطيع 🥢');
  };

  const handleSliceSushi = () => {
    if (sushiPiecesCount >= 4) return;
    playChopSound();
    setSushiPiecesCount((prev) => prev + 1);
    if (sushiPiecesCount + 1 === 4) {
      playFanfareSound();
      confetti({ particleCount: 65, spread: 60 });
      setSushiDone(true);
      if (!completedRecipes.includes('sushi')) {
        setCompletedRecipes((prev) => [...prev, 'sushi']);
        setTotalChefStars((prev) => prev + 30);
        onEarnStars(30, 'إعداد رولات السوشي اليابانية');
      }
      speakArabicSpeech('رائع جداً! قطع ماكي السوشي أصبحت جاهزة للتقديم!');
      setMascotMessage('سوشي متقن ومثالي كالمطاعم الفاخرة! 🍣🥢 سلمت يداك يا بطل!');
    }
  };

  // ---------------- Meatballs Handlers ----------------
  const handleAddMeatballIngredient = (item: string) => {
    playPopSound();
    if (!meatballIngredientsAdded.includes(item)) {
      setMeatballIngredientsAdded((prev) => [...prev, item]);
    }
  };

  const handleMixMeat = () => {
    if (meatballIngredientsAdded.length < 2) {
      showNotification('أضف اللحم والبهارات في الوعاء أولاً! 🥣');
      return;
    }
    playBubbleSound();
    setIsMeatMixed(true);
    showNotification('تم خلط اللحم مع التوابل بالمضرب البنفسجي! 🥣');
  };

  const handleRollMeatball = () => {
    if (meatballsCount >= 4) return;
    playPopSound();
    setMeatballsCount((prev) => prev + 1);
    if (meatballsCount + 1 === 4) {
      showNotification('تم تكوير 4 كرات لحم متناسقة! الآن حمرها في المقلاة 🧆');
    }
  };

  const handleCookMeatballs = () => {
    if (meatballsCount < 4) {
      showNotification('كوّر 4 كرات لحم أولاً! 🧆');
      return;
    }
    playSizzleSound();
    setMeatballsCooked(true);
    showNotification('تحمرت كرات اللحم واكتسبت لوناً ذهبياً شهياً! 🔥');
  };

  const handleAddMeatballSauceAndBasil = () => {
    if (!meatballsCooked) {
      showNotification('حمّر كرات اللحم أولاً! 🍳');
      return;
    }
    playBubbleSound();
    playSparkleSound();
    setHasSauceAndBasil(true);
    setMeatballsDone(true);
    playFanfareSound();
    confetti({ particleCount: 60, spread: 55 });
    if (!completedRecipes.includes('meatballs')) {
      setCompletedRecipes((prev) => [...prev, 'meatballs']);
      setTotalChefStars((prev) => prev + 25);
      onEarnStars(25, 'تحضير كرات اللحم بصلصة الطماطم والريحان');
    }
    speakArabicSpeech('ما ألذ كرات اللحم بالصلصة الحمراء والريحان!');
    setMascotMessage('طبق كرات اللحم الشهية بالريحان مكتمل ومزين كالصورة تماماً! 🧆🌿');
  };

  // ---------------- Pie Handlers ----------------
  const handleRollDough = () => {
    playChopSound();
    setDoughRollCount((prev) => {
      const next = prev + 1;
      if (next === 3) {
        showNotification('تم فرد العجين بالشوبك الخشبي بنجاح! أصبح مسطحاً وناعماً 🪵');
      }
      return next;
    });
  };

  const handleAddPieFilling = (fruit: string) => {
    playPopSound();
    if (!pieFillingsAdded.includes(fruit)) {
      setPieFillingsAdded((prev) => [...prev, fruit]);
      showNotification(`أضفت قطع ${fruit === 'apples' ? 'التفاح والقرفة 🍏' : 'الفراولة اللذيذة 🍓'}`);
    }
  };

  const handleBakeInMicrowave = () => {
    if (doughRollCount < 3 || pieFillingsAdded.length === 0) {
      showNotification('افرد العجين وضَع حشوة الفواكه أولاً! 🥧');
      return;
    }
    playClickSound();
    setPieInMicrowave(true);
    setMicrowaveTimer(3);
    showNotification('وضعت الفطيرة في الميكروويف! جاري الخبز... ⏳');
  };

  const handleGlazePie = () => {
    if (!pieBaked) {
      showNotification('اخبز الفطيرة في الميكروويف أولاً! 🥧');
      return;
    }
    playBubbleSound();
    playSparkleSound();
    setPieGlazed(true);
    setPieDone(true);
    playFanfareSound();
    confetti({ particleCount: 75, spread: 75 });
    if (!completedRecipes.includes('pie')) {
      setCompletedRecipes((prev) => [...prev, 'pie']);
      setTotalChefStars((prev) => prev + 35);
      onEarnStars(35, 'خبز فطيرة الفواكه الشهية');
    }
    speakArabicSpeech('فطيرة ذهبية مقرمشة مع صوص الفراولة اللامع!');
    setMascotMessage('أحلى فطيرة فواكه خرجت من الميكروويف طازجة ومقرمشة! 🥧✨');
  };

  // ---------------- Mixer Handlers ----------------
  const handleAddMixerItem = (item: string) => {
    playPopSound();
    if (!mixerIngredients.includes(item)) {
      setMixerIngredients((prev) => [...prev, item]);
    }
  };

  const handleRunMixer = () => {
    if (mixerIngredients.length === 0) {
      showNotification('أضف الحليب أو الدقيق أو البيض في الوعاء المخطط! 🥣');
      return;
    }
    playBubbleSound();
    setIsMixerRunning(true);
    setTimeout(() => {
      setIsMixerRunning(false);
      setMixerBatterColor('golden');
      showNotification('خفقت المكونات بالمضرب البنفسجي وتجانست تماماً! 🥣✨');
    }, 1200);
  };

  const handleSquirtSauce = () => {
    playBubbleSound();
    setSauceSquirtCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setMixerDone(true);
        playFanfareSound();
        confetti({ particleCount: 50, spread: 50 });
        if (!completedRecipes.includes('mixer')) {
          setCompletedRecipes((prev) => [...prev, 'mixer']);
          setTotalChefStars((prev) => prev + 20);
          onEarnStars(20, 'خلط الصلصات ونكهات الشيف');
        }
        setMascotMessage('سكبت الكاتشب والصلصات ببراعة كالشيف المحترف! 🥫✨');
      }
      return next;
    });
  };

  // Reset current recipe
  const handleResetRecipe = () => {
    playClickSound();
    if (activeRecipe === 'burger') {
      setIsStoveOn(false);
      setIsPattyInPan(false);
      setPattyCookProgress(0);
      setIsPattyFlipped(false);
      setIsPattyCooked(false);
      setBurgerLayers(['bottom-bun']);
      setBurgerDone(false);
    } else if (activeRecipe === 'sushi') {
      setHasNori(false);
      setHasRice(false);
      setSushiFillings([]);
      setIsSushiRolled(false);
      setSushiPiecesCount(0);
      setSushiDone(false);
    } else if (activeRecipe === 'meatballs') {
      setMeatballIngredientsAdded([]);
      setIsMeatMixed(false);
      setMeatballsCount(0);
      setMeatballsCooked(false);
      setHasSauceAndBasil(false);
      setMeatballsDone(false);
    } else if (activeRecipe === 'pie') {
      setDoughRollCount(0);
      setPieFillingsAdded([]);
      setPieInMicrowave(false);
      setMicrowaveTimer(3);
      setPieBaked(false);
      setPieGlazed(false);
      setPieDone(false);
    } else if (activeRecipe === 'mixer') {
      setMixerIngredients([]);
      setIsMixerRunning(false);
      setMixerBatterColor('cream');
      setSauceSquirtCount(0);
      setMixerDone(false);
    }
    showNotification('أعدنا ضبط المحطة! لنطبخ الوصفة من جديد 🍳✨');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-black/75 overflow-y-auto">
      <div
        className={`relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border transition-all my-auto ${
          mode === 'day'
            ? 'bg-gradient-to-b from-pink-50 via-white to-amber-50 border-pink-200 text-slate-800'
            : 'bg-gradient-to-b from-[#250d35] via-[#1a0a26] to-[#10051a] border-pink-500/50 text-white shadow-pink-950/80'
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 border-b border-pink-300/30 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center text-xl shadow-inner">
              🧑‍🍳
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-xl font-black">مطبخ الشيف الصغير 🍳✨</h2>
                <span className="px-2 py-0.5 rounded-full bg-yellow-300 text-amber-950 font-black text-[10px]">
                  مغامرة الطبخ
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-pink-100 font-medium">
                مستوحاة من مطبخ رائد والأصدقاء، شواء، لف السوشي، وخبز الفطائر!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stars Won Badge */}
            <div className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center gap-1 shadow">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{totalChefStars} نجمة طاهٍ</span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-all cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Floating Notification Toast */}
        {feedbackToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs shadow-xl animate-bounce flex items-center gap-2 border border-amber-300">
            <Sparkles className="w-4 h-4 text-amber-900" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Visual Reference & Kitchen Cabinets Banner (Pink cabinets like screenshot) */}
        <div className="relative bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 p-3 sm:p-4 border-b border-pink-300/50 flex flex-col md:flex-row items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/80 shadow-lg flex-shrink-0">
              <img
                src="/assets/aistudio/download__41__61119501.jfif"
                alt="لعبة مطبخ الشيف الصغير"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold">
                المطبخ الأصلي 🖼️
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-200">
                <ChefHat className="w-4 h-4 text-yellow-300" />
                <span>نصيحة الشيف الذكي:</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
                {mascotMessage}
              </p>
            </div>
          </div>

          {/* Quick Reset Station Button */}
          <button
            onClick={handleResetRecipe}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/30 flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط المحطة</span>
          </button>
        </div>

        {/* Recipe Tabs Navigation */}
        <div className="p-2 sm:p-3 bg-pink-100/60 dark:bg-black/30 border-b border-pink-300/30 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {RECIPES.map((r) => {
            const isSelected = activeRecipe === r.id;
            const isDone = completedRecipes.includes(r.id);
            return (
              <button
                key={r.id}
                onClick={() => {
                  playClickSound();
                  setActiveRecipe(r.id);
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg scale-105 ring-2 ring-pink-300'
                    : 'bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-slate-700 dark:text-pink-200'
                }`}
              >
                <span className="text-base">{r.icon}</span>
                <span>{r.title}</span>
                {isDone ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                ) : (
                  <span className="text-[10px] opacity-75">+{r.starsReward}⭐</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ===================== RECIPE 1: BURGER STATION ===================== */}
        {activeRecipe === 'burger' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Visual Kitchen Counter Simulation */}
            <div className="relative rounded-3xl p-5 border-2 border-pink-400/60 bg-gradient-to-b from-[#fcd5e5] via-[#f7a8c4] to-[#ea7099] dark:from-[#35103a] dark:to-[#1c0823] shadow-inner overflow-hidden">
              {/* Pink Kitchen Cabinets Style Header & Overhead Shelf */}
              <div className="flex items-center justify-between pb-4 border-b border-white/30 text-slate-800 dark:text-white">
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
                  <span>الموقد والمقلاة الساخنة 🍳</span>
                  {isStoveOn && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black animate-pulse flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current text-red-600" /> مشتعل
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleStove}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all shadow cursor-pointer flex items-center gap-1.5 ${
                      isStoveOn
                        ? 'bg-red-500 text-white ring-2 ring-amber-300'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{isStoveOn ? 'إطفاء الموقد' : 'إشعال الموقد 🔥'}</span>
                  </button>
                </div>
              </div>

              {/* Main Countertop Interactive Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 items-center">
                {/* Left: The Gas Stove & Frying Pan */}
                <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-black/20 border border-white/20 backdrop-blur">
                  <div className="text-center font-black text-xs text-amber-200 mb-2">
                    مقلاة الشواء الفضية والملعقة 🥄
                  </div>

                  {/* Frying Pan Graphic */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 border-4 border-slate-600 shadow-2xl flex items-center justify-center">
                    {/* Flame glow underneath if stove is on */}
                    {isStoveOn && (
                      <div className="absolute -bottom-2 inset-x-6 h-6 bg-gradient-to-t from-red-600 via-amber-400 to-transparent blur-sm rounded-full animate-pulse" />
                    )}

                    {/* Pan Interior (Dark oil surface) */}
                    <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-950/90 border border-slate-700 relative flex items-center justify-center overflow-hidden">
                      {/* Oil bubbles if cooking */}
                      {isStoveOn && isPattyInPan && !isPattyCooked && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-xs animate-ping">🫧</span>
                          <span className="text-xs animate-bounce delay-100">🔥</span>
                        </div>
                      )}

                      {/* Patty inside Pan */}
                      {isPattyInPan ? (
                        <div
                          onClick={handleFlipPatty}
                          className={`group/patty relative w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 ${
                            isPattyCooked
                              ? 'bg-gradient-to-br from-[#5c2e17] via-[#3d1e0f] to-[#2b1408] border-2 border-amber-600 ring-2 ring-amber-400'
                              : 'bg-gradient-to-br from-[#a0462c] via-[#82331c] to-[#602313] border border-amber-900'
                          }`}
                          title="اضغط لتقليب اللحم بالملعقة الفضية 🥄"
                        >
                          <span className="text-2xl sm:text-3xl">🥩</span>
                          {/* Sizzle smoke badge */}
                          {isStoveOn && !isPattyCooked && (
                            <span className="absolute -top-3 text-xs font-bold text-amber-300 animate-pulse">
                              ينضج... {pattyCookProgress}%
                            </span>
                          )}
                          {isPattyCooked && (
                            <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black shadow">
                              جاهز ومحمر! ✓
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={handleAddPattyToPan}
                          className="px-4 py-2 rounded-2xl bg-amber-400/90 hover:bg-amber-400 text-amber-950 font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>🥩 ضع شريحة اللحم في المقلاة</span>
                        </button>
                      )}
                    </div>

                    {/* Slotted Spatula Control (like screenshot) */}
                    {isPattyInPan && !isPattyCooked && (
                      <button
                        onClick={handleFlipPatty}
                        className="absolute -top-3 -right-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 font-black text-xs shadow-xl border border-white hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>🥄 قلّب بالملعقة!</span>
                      </button>
                    )}
                  </div>

                  {/* Progress bar for patty cooking */}
                  {isPattyInPan && (
                    <div className="w-full max-w-xs mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-900 dark:text-purple-200">
                        <span>مستوى الاستواء 🥩</span>
                        <span>{pattyCookProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800/40 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 transition-all duration-300"
                          style={{ width: `${pattyCookProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Burger Assembly Plate (The Blue Plate like the screenshot) */}
                <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-black/20 border border-white/20 backdrop-blur">
                  <div className="text-center font-black text-xs text-cyan-200 mb-2">
                    طبق التقديم الأزرق 🍽️
                  </div>

                  {/* Blue Plate */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-500 to-cyan-300 border-4 border-cyan-200 shadow-2xl flex flex-col items-center justify-center p-3 overflow-hidden">
                    {/* Burger Stack Display */}
                    <div className="flex flex-col-reverse items-center gap-0.5 z-10">
                      {/* Bottom Bun */}
                      {burgerLayers.includes('bottom-bun') && (
                        <div className="w-28 h-6 sm:w-32 sm:h-7 rounded-b-2xl bg-amber-600 border border-amber-800 shadow flex items-center justify-center text-[10px] text-amber-950 font-black">
                          🍞 قطعة الخبز السفلية
                        </div>
                      )}

                      {/* Lettuce */}
                      {burgerLayers.includes('lettuce') && (
                        <div className="w-30 h-4 sm:w-34 sm:h-5 rounded-full bg-emerald-500 border border-emerald-600 text-[10px] text-white font-black flex items-center justify-center shadow">
                          🥬 خس أخضر طازج
                        </div>
                      )}

                      {/* Grilled Patty */}
                      {burgerLayers.includes('patty') && (
                        <div className="w-28 h-6 sm:w-32 sm:h-7 rounded-xl bg-gradient-to-r from-amber-900 via-stone-800 to-amber-950 border border-amber-700 text-[10px] text-amber-200 font-black flex items-center justify-center shadow">
                          🥩 لحم برغر مشوي شهي
                        </div>
                      )}

                      {/* Melted Cheese */}
                      {burgerLayers.includes('cheese') && (
                        <div className="w-26 h-3 sm:w-30 sm:h-4 rounded-md bg-yellow-400 border border-yellow-500 text-[9px] text-yellow-950 font-bold flex items-center justify-center shadow">
                          🧀 شريحة جبن ذائبة
                        </div>
                      )}

                      {/* Ketchup Squirt */}
                      {burgerLayers.includes('ketchup') && (
                        <div className="w-24 h-2.5 sm:w-28 sm:h-3 rounded-full bg-red-600 border border-red-700 text-[8px] text-white font-bold flex items-center justify-center">
                          🥫 كاتشب طماطم غني
                        </div>
                      )}

                      {/* Top Sesame Bun */}
                      {burgerLayers.includes('top-bun') && (
                        <div className="w-28 h-8 sm:w-32 sm:h-9 rounded-t-3xl bg-amber-500 border border-amber-700 shadow-md flex items-center justify-center text-xs text-amber-950 font-black">
                          🍔 خبز السمسم اللذيذ
                        </div>
                      )}
                    </div>

                    {burgerDone && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white text-center p-3 animate-in fade-in duration-300">
                        <span className="text-3xl mb-1">🎉</span>
                        <div className="font-black text-sm text-yellow-300">برغر مكتمل وشهي!</div>
                        <div className="text-xs text-white/90">+30 نجمة طاهٍ ⭐</div>
                      </div>
                    )}
                  </div>

                  {/* Burger Ingredients Selector */}
                  <div className="w-full mt-3 flex flex-wrap items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleAddBurgerLayer('lettuce')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        burgerLayers.includes('lettuce') ? 'bg-emerald-600 text-white' : 'bg-white/80 dark:bg-white/20 hover:scale-105'
                      }`}
                    >
                      🥬 خس
                    </button>

                    <button
                      onClick={() => handleAddBurgerLayer('patty')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        burgerLayers.includes('patty') ? 'bg-amber-800 text-white' : 'bg-white/80 dark:bg-white/20 hover:scale-105'
                      }`}
                    >
                      🥩 وضع اللحم
                    </button>

                    <button
                      onClick={() => handleAddBurgerLayer('cheese')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        burgerLayers.includes('cheese') ? 'bg-yellow-400 text-yellow-950' : 'bg-white/80 dark:bg-white/20 hover:scale-105'
                      }`}
                    >
                      🧀 جبن
                    </button>

                    <button
                      onClick={() => handleAddBurgerLayer('ketchup')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        burgerLayers.includes('ketchup') ? 'bg-red-600 text-white' : 'bg-white/80 dark:bg-white/20 hover:scale-105'
                      }`}
                    >
                      🥫 كاتشب
                    </button>

                    <button
                      onClick={() => handleAddBurgerLayer('top-bun')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        burgerLayers.includes('top-bun') ? 'bg-amber-600 text-white' : 'bg-white/80 dark:bg-white/20 hover:scale-105'
                      }`}
                    >
                      🍞 خبز علوي
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Action: Serve the Burger */}
              <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-center">
                {!burgerDone ? (
                  <button
                    onClick={handleFinishBurger}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-sm shadow-xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-amber-200"
                  >
                    <span>تقديم البرغر اللذيذ للمطعم 🍽️ (+30 ⭐)</span>
                    <ChefHat className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center gap-2 shadow">
                    <Check className="w-5 h-5" />
                    <span>تم تحضير وتقديم البرغر بنجاح! مبروك النجوم ⭐</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== RECIPE 2: SUSHI ROLLS STATION ===================== */}
        {activeRecipe === 'sushi' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="relative rounded-3xl p-5 border-2 border-emerald-400/60 bg-gradient-to-b from-[#d4f8e8] via-[#a3eec8] to-[#5cd99d] dark:from-[#0d2a1f] dark:to-[#071711] shadow-inner">
              <div className="text-center space-y-1 mb-4">
                <h3 className="font-black text-lg text-emerald-950 dark:text-emerald-200">
                  حصيرة الخيزران ولف الماكي 🍱
                </h3>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-100/70">
                  افرد ورقة النوري، ضع الأرز ثم السلمون والخيار ولفها بالحصيرة وقَطّعها بالسكين!
                </p>
              </div>

              {/* Bamboo Mat Simulator */}
              <div className="max-w-md mx-auto p-4 rounded-3xl bg-amber-100 border-2 border-amber-300 shadow-xl space-y-3">
                <div className="w-full h-44 rounded-2xl bg-amber-200 border-2 border-amber-400 relative overflow-hidden flex flex-col items-center justify-center p-2">
                  {/* Bamboo Mat Texture */}
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#92400e,#92400e_3px,transparent_3px,transparent_10px)]" />

                  {/* Seaweed Nori Sheet */}
                  {hasNori && (
                    <div className="w-64 h-32 rounded-xl bg-slate-900 border border-slate-700 shadow-md relative flex items-center justify-center overflow-hidden">
                      {/* Rice Layer */}
                      {hasRice && (
                        <div className="w-56 h-24 rounded-lg bg-white/95 shadow-inner border border-slate-200 relative flex items-center justify-center gap-2">
                          {/* Fillings inside */}
                          {sushiFillings.map((f, idx) => (
                            <span key={idx} className="text-2xl animate-in zoom-in-75">
                              {f === 'salmon' ? '🍣' : f === 'cucumber' ? '🥒' : '🥑'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!hasNori && (
                    <button
                      onClick={() => {
                        playPopSound();
                        setHasNori(true);
                      }}
                      className="px-4 py-2 rounded-2xl bg-slate-900 text-white font-black text-xs hover:scale-105 transition-all cursor-pointer shadow"
                    >
                      🌿 ضع ورقة الطحالب (النوري)
                    </button>
                  )}

                  {hasNori && !hasRice && (
                    <button
                      onClick={() => {
                        playPopSound();
                        setHasRice(true);
                      }}
                      className="px-4 py-2 rounded-2xl bg-white text-slate-900 font-black text-xs hover:scale-105 transition-all cursor-pointer shadow border"
                    >
                      🍚 افرد أرز السوشي اللذيذ
                    </button>
                  )}

                  {/* Sliced sushi display if rolled */}
                  {isSushiRolled && (
                    <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-3 text-white">
                      <div className="font-black text-xs text-yellow-300 mb-2">
                        قطع الماكي المقطوعة: {sushiPiecesCount} / 4 🥢
                      </div>
                      <div className="flex items-center gap-3">
                        {Array.from({ length: sushiPiecesCount }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-lg animate-in zoom-in-50"
                          >
                            <span className="text-base">🍣</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ingredients Toolbar */}
                {hasRice && !isSushiRolled && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => handleAddSushiFilling('salmon')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:scale-105 transition-all cursor-pointer"
                    >
                      🍣 شرائح سلمون
                    </button>
                    <button
                      onClick={() => handleAddSushiFilling('cucumber')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:scale-105 transition-all cursor-pointer"
                    >
                      🥒 خيار مقرمش
                    </button>
                    <button
                      onClick={() => handleAddSushiFilling('avocado')}
                      className="px-3 py-1.5 rounded-xl bg-lime-600 text-white font-bold text-xs hover:scale-105 transition-all cursor-pointer"
                    >
                      🥑 أفوكادو طري
                    </button>
                    <button
                      onClick={handleRollSushi}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 text-amber-950 font-black text-xs hover:scale-105 transition-all cursor-pointer"
                    >
                      🍱 لَف السوشي بالحصيرة!
                    </button>
                  </div>
                )}

                {/* Slicing Button */}
                {isSushiRolled && !sushiDone && (
                  <div className="text-center pt-2">
                    <button
                      onClick={handleSliceSushi}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs sm:text-sm hover:scale-105 transition-all cursor-pointer shadow-lg flex items-center gap-2 mx-auto"
                    >
                      <span>🔪 قَطّع السوشي بالسكين ({sushiPiecesCount}/4)</span>
                    </button>
                  </div>
                )}

                {sushiDone && (
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white text-center font-black text-xs shadow flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>رولات السوشي جاهزة في الطبق مع صلصة الصويا! 🍣✨</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== RECIPE 3: MEATBALLS STATION ===================== */}
        {activeRecipe === 'meatballs' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="relative rounded-3xl p-5 border-2 border-rose-400/60 bg-gradient-to-b from-[#ffe0e6] via-[#ffb8c7] to-[#fa8ea5] dark:from-[#2e0e18] dark:to-[#17060b] shadow-inner">
              <div className="text-center space-y-1 mb-4">
                <h3 className="font-black text-lg text-rose-950 dark:text-rose-200">
                  كرات اللحم بصلصة الطماطم والريحان 🧆🌿
                </h3>
                <p className="text-xs text-rose-900/80 dark:text-rose-100/70">
                  امزج اللحم المفروم بالتوابل، كوّر الكرات، حمّرها ثم اسكب الصلصة الحمراء وزيّنها بالريحان!
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                {/* Mixing & Rolling Zone */}
                <div className="p-4 rounded-3xl bg-white/70 dark:bg-black/30 border border-rose-300 shadow-md text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleAddMeatballIngredient('meat')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                        meatballIngredientsAdded.includes('meat') ? 'bg-amber-800 text-white' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      🥩 لحم مفروم
                    </button>
                    <button
                      onClick={() => handleAddMeatballIngredient('garlic')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                        meatballIngredientsAdded.includes('garlic') ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      🧄 ثوم وبهارات
                    </button>
                    <button
                      onClick={handleMixMeat}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-black text-xs hover:scale-105 cursor-pointer shadow"
                    >
                      🥣 خلط بالمضرب
                    </button>
                  </div>

                  {/* Meatballs Rolling */}
                  {isMeatMixed && (
                    <div className="pt-2 border-t border-rose-200 dark:border-rose-800/40 space-y-2">
                      <div className="font-bold text-xs text-rose-950 dark:text-rose-200">
                        الكرات المشكلة: {meatballsCount} / 4 🧆
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        {Array.from({ length: 4 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                              idx < meatballsCount
                                ? 'bg-amber-900 border-2 border-amber-600 scale-110 shadow-md'
                                : 'bg-slate-300 dark:bg-slate-800 border border-dashed border-slate-400 opacity-50'
                            }`}
                          >
                            {idx < meatballsCount ? '🧆' : ''}
                          </div>
                        ))}
                      </div>

                      {meatballsCount < 4 && (
                        <button
                          onClick={handleRollMeatball}
                          className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-black text-xs hover:scale-105 cursor-pointer"
                        >
                          🖐️ تكوير كرة لحم باليدين
                        </button>
                      )}
                    </div>
                  )}

                  {/* Pan Cooking */}
                  {meatballsCount >= 4 && !meatballsCooked && (
                    <button
                      onClick={handleCookMeatballs}
                      className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs hover:scale-105 cursor-pointer shadow-lg"
                    >
                      🍳 تحمير الكرات في المقلاة الساخنة
                    </button>
                  )}

                  {/* Sauce and Basil Garnish */}
                  {meatballsCooked && !meatballsDone && (
                    <button
                      onClick={handleAddMeatballSauceAndBasil}
                      className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs hover:scale-105 cursor-pointer shadow-lg"
                    >
                      🍅 سكب صلصة الطماطم وأوراق الريحان 🌿
                    </button>
                  )}

                  {meatballsDone && (
                    <div className="p-3 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>طبق كرات اللحم بالريحان جاهز وشهي كالصورة! 🧆🌿</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== RECIPE 4: PIE & MICROWAVE STATION ===================== */}
        {activeRecipe === 'pie' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="relative rounded-3xl p-5 border-2 border-purple-400/60 bg-gradient-to-b from-[#f3e0ff] via-[#e2bbfd] to-[#cc96fa] dark:from-[#230933] dark:to-[#12041a] shadow-inner">
              <div className="text-center space-y-1 mb-4">
                <h3 className="font-black text-lg text-purple-950 dark:text-purple-200">
                  فطيرة الفواكه والشوبك الخشبي 🥧🪵
                </h3>
                <p className="text-xs text-purple-900/80 dark:text-purple-100/70">
                  افرد العجين بالشوبك الأصفر، ضع حشوة الفواكه، ثم اخبزها في الميكروويف الفضي وزينها بالكراميل!
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                {/* Rolling Pin & Dough Section */}
                <div className="p-4 rounded-3xl bg-white/70 dark:bg-black/30 border border-purple-300 shadow-md text-center space-y-3">
                  <div className="text-xs font-black text-purple-900 dark:text-purple-200">
                    الشوبك الخشبي (دحرجة العجين): {doughRollCount} / 3 🪵
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handleRollDough}
                      disabled={doughRollCount >= 3}
                      className={`px-4 py-2 rounded-2xl font-black text-xs transition-all shadow flex items-center gap-2 cursor-pointer ${
                        doughRollCount >= 3
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-400 hover:bg-amber-300 text-amber-950 hover:scale-105'
                      }`}
                    >
                      <span>🪵 دحرجة الشوبك وفرد العجين</span>
                    </button>
                  </div>

                  {/* Pie Fillings */}
                  {doughRollCount >= 3 && (
                    <div className="flex items-center justify-center gap-2 pt-2 border-t border-purple-200">
                      <button
                        onClick={() => handleAddPieFilling('apples')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                          pieFillingsAdded.includes('apples') ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        🍏 تفاح وقرفة
                      </button>
                      <button
                        onClick={() => handleAddPieFilling('strawberries')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                          pieFillingsAdded.includes('strawberries') ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        🍓 فراولة طازجة
                      </button>
                    </div>
                  )}

                  {/* Microwave Oven Simulator */}
                  {doughRollCount >= 3 && pieFillingsAdded.length > 0 && (
                    <div className="pt-3 border-t border-purple-200">
                      {/* Microwave Graphic */}
                      <div className="w-56 mx-auto h-32 rounded-2xl bg-gradient-to-tr from-slate-400 via-slate-300 to-slate-200 border-4 border-slate-500 shadow-xl p-2.5 flex items-center justify-between text-slate-800">
                        {/* Glass Window */}
                        <div className="w-36 h-full rounded-xl bg-cyan-900 border-2 border-slate-600 flex items-center justify-center relative overflow-hidden">
                          {pieInMicrowave && !pieBaked && (
                            <div className="text-3xl animate-spin duration-1000">🥧</div>
                          )}
                          {pieBaked && <div className="text-3xl">🥧✨</div>}
                          {!pieInMicrowave && <span className="text-cyan-400 text-xs">فارغ</span>}
                        </div>

                        {/* Controls Panel */}
                        <div className="flex flex-col items-center justify-between h-full pl-1">
                          <div className="px-2 py-0.5 rounded bg-black text-cyan-300 font-mono text-xs font-bold">
                            00:0{microwaveTimer}
                          </div>
                          <button
                            onClick={handleBakeInMicrowave}
                            disabled={pieInMicrowave}
                            className="px-2 py-1 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-black cursor-pointer shadow"
                          >
                            تشغيل 🔔
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strawberry / Caramel Glaze */}
                  {pieBaked && !pieDone && (
                    <button
                      onClick={handleGlazePie}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs hover:scale-105 cursor-pointer shadow-lg"
                    >
                      🍓 رسم خطوط صوص الفراولة اللامع كالصورة!
                    </button>
                  )}

                  {pieDone && (
                    <div className="p-3 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>فطيرة الفواكه الذهبية مكتملة وتفوح باللذة! 🥧✨</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== RECIPE 5: MIXER & SAUCE STATION ===================== */}
        {activeRecipe === 'mixer' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="relative rounded-3xl p-5 border-2 border-blue-400/60 bg-gradient-to-b from-[#dbebff] via-[#b6d7ff] to-[#7db6fc] dark:from-[#0a1a33] dark:to-[#050d1a] shadow-inner">
              <div className="text-center space-y-1 mb-4">
                <h3 className="font-black text-lg text-blue-950 dark:text-blue-200">
                  مضرب الخفق البنفسجي وزجاجات الكاتشب 🥣🥫
                </h3>
                <p className="text-xs text-blue-900/80 dark:text-blue-100/70">
                  أضف الحليب والدقيق في الوعاء المخطط، اخفق بالمضرب، واسكب الكاتشب والصلصات!
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-3xl bg-white/70 dark:bg-black/30 border border-blue-300 shadow-md text-center space-y-4">
                {/* Striped Bowl & Purple Hand Mixer (Matching the screenshot) */}
                <div className="relative w-48 h-40 mx-auto flex flex-col items-center justify-end">
                  {/* Purple Electric Mixer floating above */}
                  <div
                    className={`w-28 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-purple-300 shadow-xl flex items-center justify-center text-white text-xs font-black transition-transform ${
                      isMixerRunning ? 'animate-bounce' : ''
                    }`}
                  >
                    <span>⚡ مضرب خفق</span>
                  </div>

                  {/* Striped Bowl */}
                  <div className="w-40 h-24 rounded-b-full bg-gradient-to-r from-red-500 via-yellow-400 to-cyan-400 border-4 border-white shadow-2xl relative flex items-center justify-center overflow-hidden">
                    <div
                      className={`w-36 h-20 rounded-b-full transition-colors duration-500 flex items-center justify-center ${
                        mixerBatterColor === 'golden' ? 'bg-amber-300' : 'bg-amber-100'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">
                        {isMixerRunning ? '🌀 خفق سريع...' : mixerBatterColor === 'golden' ? 'خليط متجانس ✨' : 'المكونات بالوعاء'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add Ingredients */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handleAddMixerItem('milk')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                      mixerIngredients.includes('milk') ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    🥛 حليب طازج
                  </button>
                  <button
                    onClick={() => handleAddMixerItem('flour')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                      mixerIngredients.includes('flour') ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    🌾 دقيق أبيض
                  </button>
                  <button
                    onClick={() => handleAddMixerItem('eggs')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                      mixerIngredients.includes('eggs') ? 'bg-amber-500 text-amber-950' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    🥚 بيض
                  </button>
                </div>

                {/* Run Mixer */}
                {mixerIngredients.length > 0 && !isMixerRunning && mixerBatterColor !== 'golden' && (
                  <button
                    onClick={handleRunMixer}
                    className="px-5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs hover:scale-105 cursor-pointer shadow"
                  >
                    🌀 تشغيل المضرب الكهربائي
                  </button>
                )}

                {/* Ketchup & Sauce Squirting */}
                {mixerBatterColor === 'golden' && (
                  <div className="space-y-2 pt-2 border-t border-blue-200">
                    <div className="text-xs font-bold text-slate-800 dark:text-blue-200">
                      سكب الكاتشب والصلصات: {sauceSquirtCount} / 3 🥫
                    </div>
                    <button
                      onClick={handleSquirtSauce}
                      className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs hover:scale-105 cursor-pointer shadow-lg flex items-center gap-2 mx-auto"
                    >
                      <span>🥫 سكب الكاتشب والبهارات المنكهة</span>
                    </button>
                  </div>
                )}

                {mixerDone && (
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>تم تحضير الصلصة والخليط اللذيذ بنجاح! 🥣✨</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer info & Progress */}
        <div className="p-4 border-t border-pink-300/30 bg-pink-50/50 dark:bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-bold">
              الوصفات المكتملة: {completedRecipes.length} من {RECIPES.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {completedRecipes.length === RECIPES.length && (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> وسام الشيف الذهبي الأسطوري 👑
              </span>
            )}
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold cursor-pointer"
            >
              العودة للمنصة 🚪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
