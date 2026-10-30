import React, { useState, useEffect, useRef } from 'react';
import { AppMode } from '../types';
import {
  Gamepad2,
  Rocket,
  Trophy,
  RotateCcw,
  Sparkles,
  Flame,
  Volume2,
  Award,
  Timer,
  Check,
  Star,
  Play,
  Pause,
  HelpCircle,
  Puzzle,
  Languages,
  Shield,
  Zap,
  Plus,
  X,
  Calculator,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playPopSound,
  playSparkleSound,
  playFanfareSound,
  playCorrectSound,
  playWrongSound,
  playClickSound,
  speakArabicSpeech
} from '../utils/audio';
import { SHAHRAZAD_CHARACTERS } from '../data/storiesData';
import { ShahrazadCharacterAvatar } from './ShahrazadCharacterAvatar';

interface GamesCornerProps {
  mode: AppMode;
  onEarnStars: (amount: number) => void;
  onOpenCarRacing?: () => void;
  onOpenCookingGame?: () => void;
}

// ---------------- GAME 2: MEMORY CARDS DATA ----------------
interface MemoryCard {
  id: number;
  icon: string;
  name: string;
  subtext?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const THEMED_DECKS = {
  space: [
    { icon: '🧑‍🚀', name: 'رائد الفضاء', subtext: 'Astronaut' },
    { icon: '🚀', name: 'صاروخ النجوم', subtext: 'Rocket' },
    { icon: '🪐', name: 'كوكب زحل', subtext: 'Saturn' },
    { icon: '🌙', name: 'الهلال المنير', subtext: 'Moon' },
    { icon: '⭐', name: 'النجمة الذهبية', subtext: 'Star' },
    { icon: '🛰️', name: 'مسبار الاستكشاف', subtext: 'Satellite' },
  ],
  languages: [
    { icon: '🍎', name: 'تفاحة', subtext: 'Apple / Pomme' },
    { icon: '📖', name: 'كتاب', subtext: 'Book / Livre' },
    { icon: '🌸', name: 'وردة', subtext: 'Flower / Fleur' },
    { icon: '🦋', name: 'فراشة', subtext: 'Butterfly / Papillon' },
    { icon: '🐱', name: 'قطة', subtext: 'Cat / Chat' },
    { icon: '☀️', name: 'شمس', subtext: 'Sun / Soleil' },
  ],
  jewels: [
    { icon: '💎', name: 'الجوهرة المصونة', subtext: 'العفة والوقار' },
    { icon: '👑', name: 'تاج الأخلاق', subtext: 'الأدب والرفعة' },
    { icon: '📿', name: 'تسبيح وذكر', subtext: 'طمأنينة القلب' },
    { icon: '🕌', name: 'مسجد النور', subtext: 'بيت الإيمان' },
    { icon: '🕊️', name: 'حمامة السلام', subtext: 'المحبة والصفاء' },
    { icon: '🎁', name: 'هدية الخير', subtext: 'الإحسان للغير' },
  ]
};

// ---------------- GAME 3: WORD SCRAMBLE DATA ----------------
const WORD_PUZZLES = [
  {
    target: 'صداقة',
    lang: 'ar',
    english: 'Friendship',
    letters: ['ص', 'د', 'ا', 'ق', 'ة'],
    clue: 'كنز غالٍ بين رائد وثعلبه اللطيف 🤝',
  },
  {
    target: 'ROCKET',
    lang: 'en',
    english: 'صاروخ',
    letters: ['R', 'O', 'C', 'K', 'E', 'T'],
    clue: 'Fly high to the stars! 🚀',
  },
  {
    target: 'ETOILE',
    lang: 'fr',
    english: 'نجمة',
    letters: ['E', 'T', 'O', 'I', 'L', 'E'],
    clue: 'Brille dans le ciel de la nuit ⭐',
  },
  {
    target: 'أمانة',
    lang: 'ar',
    english: 'Honesty',
    letters: ['أ', 'م', 'ا', 'ن', 'ة'],
    clue: 'صفة العصفور زقزوق والجوهرة المصونة 💎',
  },
  {
    target: 'GARDEN',
    lang: 'en',
    english: 'حديقة',
    letters: ['G', 'A', 'R', 'D', 'E', 'N'],
    clue: 'Where flowers and roses bloom 🌸',
  }
];

// ---------------- GAME 4: MATH WIZARD QUESTIONS ----------------
interface MathQuestion {
  id: string;
  question: string;
  visualEmoji: string;
  countA: number;
  countB: number;
  operation: '+' | '-' | '×';
  options: number[];
  correctAnswer: number;
  hint: string;
}

const DEFAULT_MATH_QUESTIONS: MathQuestion[] = [
  {
    id: 'm1',
    question: 'جمع رائد 4 نجوم ذهبية في الصباح و 3 نجوم في المساء. كم نجمة لديه الآن؟',
    visualEmoji: '⭐',
    countA: 4,
    countB: 3,
    operation: '+',
    options: [6, 7, 8, 9],
    correctAnswer: 7,
    hint: 'عد النجوم في كلا الصندوقين معاً!',
  },
  {
    id: 'm2',
    question: 'في سلة الثعلب 8 تفاحات حمراء، أكل منها 3 تفاحات. كم تفاحة بقيت معه؟',
    visualEmoji: '🍎',
    countA: 8,
    countB: 3,
    operation: '-',
    options: [4, 5, 6, 7],
    correctAnswer: 5,
    hint: 'اطرح 3 من العدد 8 لتجد الباقي.',
  },
  {
    id: 'm3',
    question: 'التقى السندباد بـ 3 جزر في كل جزيرة 3 قوارب شراعية. كم قارباً رآه السندباد؟',
    visualEmoji: '⛵',
    countA: 3,
    countB: 3,
    operation: '×',
    options: [6, 8, 9, 12],
    correctAnswer: 9,
    hint: '3 قوارب مكررة 3 مرات: 3 × 3 = ؟',
  },
  {
    id: 'm4',
    question: 'حلقت 6 صواريخ فضائية، ثم انضم إليها 4 صواريخ جديدة. كم صاروخاً في الفضاء؟',
    visualEmoji: '🚀',
    countA: 6,
    countB: 4,
    operation: '+',
    options: [9, 10, 11, 12],
    correctAnswer: 10,
    hint: '6 + 4 يصنعان العدد الكامل 10!',
  },
  {
    id: 'm5',
    question: 'كان في القصر 10 فوانيس مضيئة، أطفأ الحارس 4 فوانيس للنوم. كم فانوساً بقي مشتعلاً؟',
    visualEmoji: '🏮',
    countA: 10,
    countB: 4,
    operation: '-',
    options: [5, 6, 7, 8],
    correctAnswer: 6,
    hint: 'اطرح 4 من 10.',
  },
];

// ---------------- CUSTOM CREATED GAMES ----------------
export interface CustomUserGame {
  id: string;
  title: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  starReward: number;
  emoji: string;
}

export const GamesCorner: React.FC<GamesCornerProps> = ({ mode, onEarnStars, onOpenCarRacing, onOpenCookingGame }) => {
  const [selectedGame, setSelectedGame] = useState<
    'spaceRunner' | 'memory3D' | 'wordAlchemist' | 'mathWizard' | 'shadowMatch' | 'reflexCatcher' | 'customGames'
  >('spaceRunner');

  // Custom Games in LocalStorage
  const [customGames, setCustomGames] = useState<CustomUserGame[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('raed_custom_games');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [showAddGameModal, setShowAddGameModal] = useState<boolean>(false);
  const [newGameTitle, setNewGameTitle] = useState<string>('');
  const [newGameCategory, setNewGameCategory] = useState<string>('علوم وفضاء 🚀');
  const [newGameQuestion, setNewGameQuestion] = useState<string>('');
  const [newGameOptions, setNewGameOptions] = useState<string[]>(['', '', '', '']);
  const [newGameCorrectIdx, setNewGameCorrectIdx] = useState<number>(0);
  const [newGameExplanation, setNewGameExplanation] = useState<string>('');
  const [newGameEmoji, setNewGameEmoji] = useState<string>('⭐');

  // 1. GAME 1: COSMIC STAR RUNNER ARCADE
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [runnerPlaying, setRunnerPlaying] = useState<boolean>(false);
  const [runnerScore, setRunnerScore] = useState<number>(0);
  const [runnerLives, setRunnerLives] = useState<number>(3);
  const [runnerGameOver, setRunnerGameOver] = useState<boolean>(false);

  useEffect(() => {
    if (selectedGame !== 'spaceRunner' || !runnerPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let shipX = canvas.width / 2;
    let targetX = shipX;
    let score = 0;
    let lives = 3;

    const stars: { x: number; y: number; speed: number; size: number }[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1 + Math.random() * 2.5,
        size: 1 + Math.random() * 2,
      });
    }

    interface Item {
      x: number;
      y: number;
      type: 'star' | 'meteor' | 'crystal';
      speed: number;
      size: number;
    }
    const items: Item[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        targetX = ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width;
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.fillStyle = '#0a071c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      stars.forEach((s) => {
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      shipX += (targetX - shipX) * 0.15;
      shipX = Math.max(30, Math.min(canvas.width - 30, shipX));

      // Draw Ship
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚀', shipX, canvas.height - 40);

      // Spawn Items
      if (frameCount % 45 === 0) {
        const rand = Math.random();
        const type: 'star' | 'meteor' | 'crystal' = rand < 0.6 ? 'star' : rand < 0.85 ? 'meteor' : 'crystal';
        items.push({
          x: 30 + Math.random() * (canvas.width - 60),
          y: -20,
          type,
          speed: type === 'meteor' ? 3 + Math.random() * 2 : 2 + Math.random() * 1.5,
          size: 24,
        });
      }

      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;

        ctx.font = '22px sans-serif';
        ctx.fillText(item.type === 'star' ? '⭐' : item.type === 'meteor' ? '☄️' : '💎', item.x, item.y);

        const dist = Math.hypot(item.x - shipX, item.y - (canvas.height - 40));
        if (dist < 32) {
          if (item.type === 'meteor') {
            playWrongSound();
            lives -= 1;
            setRunnerLives(lives);
            if (lives <= 0) {
              setRunnerGameOver(true);
              setRunnerPlaying(false);
              onEarnStars(Math.max(5, Math.floor(score / 5)));
              return;
            }
          } else {
            playPopSound();
            score += item.type === 'crystal' ? 25 : 10;
            setRunnerScore(score);
          }
          items.splice(i, 1);
          continue;
        }

        if (item.y > canvas.height + 30) {
          items.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [selectedGame, runnerPlaying]);

  const handleStartRunner = () => {
    playSparkleSound();
    setRunnerScore(0);
    setRunnerLives(3);
    setRunnerGameOver(false);
    setRunnerPlaying(true);
  };

  // 2. GAME 2: MEMORY CARDS
  const [deckTheme, setDeckTheme] = useState<'space' | 'languages' | 'jewels'>('space');
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState<number>(0);
  const [memoryWon, setMemoryWon] = useState<boolean>(false);

  const initMemoryDeck = (theme: 'space' | 'languages' | 'jewels') => {
    const base = THEMED_DECKS[theme];
    const deck: MemoryCard[] = [];
    base.forEach((item, idx) => {
      deck.push({ id: idx * 2, icon: item.icon, name: item.name, subtext: item.subtext, isFlipped: false, isMatched: false });
      deck.push({ id: idx * 2 + 1, icon: item.icon, name: item.name, subtext: item.subtext, isFlipped: false, isMatched: false });
    });
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setMemoryCards(shuffled);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  };

  useEffect(() => {
    if (selectedGame === 'memory3D') {
      initMemoryDeck(deckTheme);
    }
  }, [selectedGame, deckTheme]);

  const handleCardClick = (idx: number) => {
    if (flippedIndices.length >= 2 || memoryCards[idx].isFlipped || memoryCards[idx].isMatched) return;
    playClickSound();

    const newCards = [...memoryCards];
    newCards[idx].isFlipped = true;
    setMemoryCards(newCards);

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      const cardA = newCards[firstIdx];
      const cardB = newCards[secondIdx];

      if (cardA.name === cardB.name) {
        playCorrectSound();
        newCards[firstIdx].isMatched = true;
        newCards[secondIdx].isMatched = true;
        setMemoryCards(newCards);
        setFlippedIndices([]);

        if (newCards.every((c) => c.isMatched)) {
          playFanfareSound();
          confetti({ particleCount: 70, spread: 60 });
          setMemoryWon(true);
          onEarnStars(35);
        }
      } else {
        playPopSound();
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // 3. GAME 3: WORD ALCHEMIST
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(0);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [builtLetters, setBuiltLetters] = useState<string[]>([]);
  const [wordSolved, setWordSolved] = useState<boolean>(false);

  const activeWord = WORD_PUZZLES[currentWordIdx];

  useEffect(() => {
    if (selectedGame === 'wordAlchemist') {
      const shuffled = [...activeWord.letters].sort(() => Math.random() - 0.5);
      setAvailableLetters(shuffled);
      setBuiltLetters([]);
      setWordSolved(false);
    }
  }, [selectedGame, currentWordIdx]);

  const handleLetterClick = (letter: string, index: number) => {
    if (wordSolved) return;
    playClickSound();
    const updatedBuilt = [...builtLetters, letter];
    setBuiltLetters(updatedBuilt);

    const updatedAvail = availableLetters.filter((_, i) => i !== index);
    setAvailableLetters(updatedAvail);

    if (updatedBuilt.join('') === activeWord.target) {
      playCorrectSound();
      confetti({ particleCount: 50, spread: 50 });
      setWordSolved(true);
      onEarnStars(25);
    } else if (updatedBuilt.length === activeWord.target.length) {
      playWrongSound();
    }
  };

  const handleResetWord = () => {
    playPopSound();
    setAvailableLetters([...activeWord.letters].sort(() => Math.random() - 0.5));
    setBuiltLetters([]);
    setWordSolved(false);
  };

  const handlePronounceWord = () => {
    playSparkleSound();
    speakArabicSpeech(activeWord.target);
  };

  // 4. GAME 4: STAR MATH WIZARD
  const [mathIdx, setMathIdx] = useState<number>(0);
  const [mathScore, setMathScore] = useState<number>(0);
  const [selectedMathOption, setSelectedMathOption] = useState<number | null>(null);
  const [mathSolved, setMathSolved] = useState<boolean>(false);

  const currentMath = DEFAULT_MATH_QUESTIONS[mathIdx % DEFAULT_MATH_QUESTIONS.length];

  const handleMathAnswer = (chosen: number) => {
    if (selectedMathOption !== null) return;
    setSelectedMathOption(chosen);

    if (chosen === currentMath.correctAnswer) {
      playCorrectSound();
      confetti({ particleCount: 50, spread: 60 });
      setMathScore((s) => s + 10);
      setMathSolved(true);
      onEarnStars(30);
    } else {
      playWrongSound();
      setMathSolved(false);
    }
  };

  const handleNextMath = () => {
    playClickSound();
    setSelectedMathOption(null);
    setMathSolved(false);
    setMathIdx((prev) => (prev + 1) % DEFAULT_MATH_QUESTIONS.length);
  };

  // 5. GAME 5: SHAHRAZAD SHADOW SILHOUETTE MATCH
  const [shadowIdx, setShadowIdx] = useState<number>(0);
  const [shadowChosenId, setShadowChosenId] = useState<string | null>(null);
  const [shadowSuccess, setShadowSuccess] = useState<boolean>(false);

  const activeShadowHero = SHAHRAZAD_CHARACTERS[shadowIdx % SHAHRAZAD_CHARACTERS.length];

  // Pick 3 distractors
  const distractors = SHAHRAZAD_CHARACTERS.filter((c) => c.id !== activeShadowHero.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const shadowCandidates = [activeShadowHero, ...distractors].sort(() => Math.random() - 0.5);

  const handleShadowCandidateClick = (candId: string) => {
    if (shadowChosenId) return;
    setShadowChosenId(candId);

    if (candId === activeShadowHero.id) {
      playCorrectSound();
      playFanfareSound();
      confetti({ particleCount: 60, spread: 70 });
      setShadowSuccess(true);
      onEarnStars(35);
      speakArabicSpeech(`${activeShadowHero.name}! ${activeShadowHero.voiceQuote}`);
    } else {
      playWrongSound();
      setShadowSuccess(false);
    }
  };

  const handleNextShadow = () => {
    playClickSound();
    setShadowChosenId(null);
    setShadowSuccess(false);
    setShadowIdx((prev) => (prev + 1) % SHAHRAZAD_CHARACTERS.length);
  };

  // 6. GAME 6: SPEED STAR REFLEX CATCHER
  const [reflexActive, setReflexActive] = useState<boolean>(false);
  const [reflexScore, setReflexScore] = useState<number>(0);
  const [reflexTimer, setReflexTimer] = useState<number>(20);
  const [fallingStars, setFallingStars] = useState<{ id: number; emoji: string; top: number; left: number; points: number }[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let spawnInterval: NodeJS.Timeout | null = null;

    if (selectedGame === 'reflexCatcher' && reflexActive) {
      interval = setInterval(() => {
        setReflexTimer((t) => {
          if (t <= 1) {
            setReflexActive(false);
            playFanfareSound();
            confetti({ particleCount: 70, spread: 60 });
            onEarnStars(35);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      spawnInterval = setInterval(() => {
        const randEmoji = ['⭐', '🌟', '💫', '💎', '🚀'][Math.floor(Math.random() * 5)];
        const newStar = {
          id: Date.now() + Math.random(),
          emoji: randEmoji,
          top: 10 + Math.random() * 70,
          left: 10 + Math.random() * 80,
          points: randEmoji === '💎' ? 20 : 10,
        };
        setFallingStars((prev) => [...prev.slice(-8), newStar]);
      }, 650);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (spawnInterval) clearInterval(spawnInterval);
    };
  }, [selectedGame, reflexActive]);

  const handleCatchStar = (id: number, pts: number) => {
    playPopSound();
    setReflexScore((s) => s + pts);
    setFallingStars((prev) => prev.filter((s) => s.id !== id));
  };

  // 7. CUSTOM USER GAME CREATION
  const handleSaveCustomGame = () => {
    if (!newGameTitle.trim() || !newGameQuestion.trim() || newGameOptions.some((o) => !o.trim())) {
      alert('يرجى ملء جميع حقول اللعبة (العنوان، السؤال، والخيارات الأربعة)!');
      return;
    }

    playFanfareSound();
    confetti({ particleCount: 70, spread: 60 });

    const created: CustomUserGame = {
      id: `custom-game-${Date.now()}`,
      title: newGameTitle.trim(),
      category: newGameCategory,
      question: newGameQuestion.trim(),
      options: newGameOptions.map((o) => o.trim()),
      correctIndex: newGameCorrectIdx,
      explanation: newGameExplanation.trim() || 'إجابة صحيحة ورائعة يا بطل!',
      starReward: 35,
      emoji: newGameEmoji,
    };

    const updated = [created, ...customGames];
    setCustomGames(updated);
    try {
      localStorage.setItem('raed_custom_games', JSON.stringify(updated));
    } catch {}

    setShowAddGameModal(false);
    setSelectedGame('customGames');
    setNewGameTitle('');
    setNewGameQuestion('');
    setNewGameOptions(['', '', '', '']);
    setNewGameExplanation('');
    onEarnStars(40);
  };

  const [activeCustomGameIdx, setActiveCustomGameIdx] = useState<number>(0);
  const [customGameAnswered, setCustomGameAnswered] = useState<number | null>(null);

  const activeCustom = customGames[activeCustomGameIdx];

  const handleAnswerCustom = (idx: number) => {
    if (customGameAnswered !== null || !activeCustom) return;
    setCustomGameAnswered(idx);

    if (idx === activeCustom.correctIndex) {
      playCorrectSound();
      confetti({ particleCount: 50, spread: 50 });
      onEarnStars(activeCustom.starReward || 35);
    } else {
      playWrongSound();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6" dir="rtl">
      {/* Top Header & Game Switcher Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-purple-500/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md">
              <Gamepad2 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-300">
                بوابة ألعاب التحدي والذكاء 🎮⭐
              </h1>
              <p className="text-xs text-purple-200">
                ألعاب حركية وتعليمية ممتعة تكافئك بنجوم الخيال في كل فوز!
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: 3D Car Racing, Cooking Chef Game & Create New Game */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenCookingGame && (
            <button
              type="button"
              onClick={() => {
                playSparkleSound();
                onOpenCookingGame();
              }}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-xl shadow-pink-950/50 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-pink-300/40"
              title="العب لعبة مطبخ الشيف الصغير 🍳✨"
            >
              <span className="text-base">🍳</span>
              <span>مطبخ الشيف الصغير</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold">برغر وسوشي وفطائر</span>
            </button>
          )}

          {onOpenCarRacing && (
            <button
              type="button"
              onClick={() => {
                playSparkleSound();
                onOpenCarRacing();
              }}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-xl shadow-red-950/50 cursor-pointer transition-all hover:scale-105 active:scale-95 animate-pulse border border-yellow-300/40"
              title="العب سباق سيارات الأبطال ثلاثي الأبعاد 🏎️"
            >
              <span className="text-base">🏎️</span>
              <span>سباق سيارات 3D المتطور</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold">Three.js</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playSparkleSound();
              setShowAddGameModal(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 cursor-pointer transition-all hover:scale-105 active:scale-95"
            title="إضافة لعبة تعليمية مخصصة بكل سهولة"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة لعبة جديدة ✍️🎮</span>
          </button>
        </div>
      </div>

      {/* Game Selector Tabs Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {onOpenCarRacing && (
          <button
            onClick={() => {
              playSparkleSound();
              onOpenCarRacing();
            }}
            className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-lg hover:scale-105 border border-yellow-300/40"
          >
            <span>🏎️</span>
            <span>سباق سيارات 3D 🏆</span>
          </button>
        )}

        <button
          onClick={() => {
            playClickSound();
            setSelectedGame('spaceRunner');
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            selectedGame === 'spaceRunner'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl scale-105'
              : 'bg-white/10 hover:bg-white/20 text-purple-200'
          }`}
        >
          <Rocket className="w-4 h-4 text-amber-300" />
          <span>سباق الفضاء 🚀</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedGame('mathWizard');
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            selectedGame === 'mathWizard'
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 shadow-xl scale-105 font-black'
              : 'bg-white/10 hover:bg-white/20 text-purple-200'
          }`}
        >
          <Calculator className="w-4 h-4 text-amber-300" />
          <span>عبقري الرياضيات 🧮</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedGame('shadowMatch');
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            selectedGame === 'shadowMatch'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105'
              : 'bg-white/10 hover:bg-white/20 text-purple-200'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-300" />
          <span>ظلال شهرزاد 🎭</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedGame('reflexCatcher');
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            selectedGame === 'reflexCatcher'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xl scale-105'
              : 'bg-white/10 hover:bg-white/20 text-purple-200'
          }`}
        >
          <Zap className="w-4 h-4 text-yellow-300" />
          <span>صائد الشهب ⚡</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedGame('memory3D');
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            selectedGame === 'memory3D'
              ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xl scale-105'
              : 'bg-white/10 hover:bg-white/20 text-purple-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>الذاكرة السحرية 🃏</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSelectedGame('wordAlchemist');
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            selectedGame === 'wordAlchemist'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 shadow-xl scale-105 font-black'
              : 'bg-white/10 hover:bg-white/20 text-purple-200'
          }`}
        >
          <Languages className="w-4 h-4 text-white" />
          <span>مملكة الكلمات 🔤</span>
        </button>

        {customGames.length > 0 && (
          <button
            onClick={() => {
              playClickSound();
              setSelectedGame('customGames');
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedGame === 'customGames'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 shadow-xl scale-105 font-black'
                : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
            }`}
          >
            <Puzzle className="w-4 h-4" />
            <span>ألعابك المضافة ({customGames.length}) 🧩</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. COSMIC STAR RUNNER ARCADE GAME                         */}
      {/* ========================================================= */}
      {selectedGame === 'spaceRunner' && (
        <div className="space-y-4">
          <div className="relative rounded-3xl p-5 overflow-hidden border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 bg-[#150d36] border-purple-700/60 text-white">
            <div className="space-y-1.5 text-center md:text-right">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white">
                لعبة أركيد حركية متطورة
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300">
                صقر الفضاء: سباق النجوم الكونية 🚀
              </h2>
              <p className="text-xs opacity-80">
                حرّك الصاروخ بيدك أو الفأرة، اجمع النجوم الذهبية وتفادَ الشهب لجمع أكبر عدد من النجوم!
              </p>
            </div>

            <div className="flex items-center gap-4 bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10">
              <div className="text-center">
                <span className="text-[10px] text-purple-300 font-bold block">النقاط:</span>
                <span className="text-lg font-black text-yellow-300 font-mono">{runnerScore}</span>
              </div>
              <div className="h-7 w-[1px] bg-white/20" />
              <div className="text-center">
                <span className="text-[10px] text-rose-300 font-bold block">الدروع:</span>
                <span className="text-base font-black text-rose-400">
                  {'❤️'.repeat(Math.max(0, runnerLives))}
                </span>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-purple-500 shadow-[0_0_35px_rgba(139,92,246,0.3)] bg-black aspect-[16/10] sm:aspect-[16/9]">
            <canvas ref={canvasRef} width={640} height={380} className="w-full h-full object-contain cursor-crosshair" />

            {!runnerPlaying && !runnerGameOver && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-xl animate-bounce">
                  🚀
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">جاهز للانطلاق إلى المجرة؟</h3>
                  <p className="text-xs text-purple-200 mt-1 max-w-sm">
                    حرّك إصبعك أو الفأرة لتوجيه الصاروخ، اجمع النجوم والجواهر، واحترس من النيازك!
                  </p>
                </div>
                <button
                  onClick={handleStartRunner}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 text-amber-950 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  انطلق الآن 🚀
                </button>
              </div>
            )}

            {runnerGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="text-4xl">🏆</div>
                <div>
                  <h3 className="text-2xl font-black text-amber-300">رحلة بطولية رائعة!</h3>
                  <p className="text-xs text-purple-200 mt-1">
                    أحرزت <span className="font-bold text-yellow-300">{runnerScore} نقطة</span> ونلت +{Math.floor(runnerScore / 5)} نجمة لمكتبتك!
                  </p>
                </div>
                <button
                  onClick={handleStartRunner}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>العب مجدداً 🚀</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. GAME: MATH STAR WIZARD (عبقري الرياضيات والحساب)          */}
      {/* ========================================================= */}
      {selectedGame === 'mathWizard' && (
        <div className="max-w-2xl mx-auto space-y-5 p-6 rounded-3xl border border-amber-400/50 bg-gradient-to-b from-[#2a1705] via-[#1c0f03] to-[#100701] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold text-amber-400 block">
                تحدي الحساب والذكاء الذهني للأطفال
              </span>
              <h3 className="text-base sm:text-lg font-black text-yellow-300 flex items-center gap-1.5">
                <Calculator className="w-5 h-5 text-amber-400" />
                <span>عبقري الرياضيات ونجوم الحساب 🧮⭐</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 font-black text-xs">
                نقاطك: {mathScore} ⭐
              </span>
              <button
                type="button"
                onClick={handleNextMath}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200"
                title="السؤال التالي"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/30 text-center space-y-3">
            <h4 className="text-sm sm:text-base font-black text-white leading-relaxed">
              {currentMath.question}
            </h4>

            {/* Visual Stars Counting Display */}
            <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 flex-wrap">
              <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-400/30">
                <span className="text-lg">
                  {currentMath.visualEmoji.repeat(currentMath.countA)}
                </span>
                <span className="text-xs font-bold text-amber-300 mr-2">({currentMath.countA})</span>
              </div>

              <span className="text-xl font-black text-amber-400">{currentMath.operation}</span>

              <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-400/30">
                <span className="text-lg">
                  {currentMath.visualEmoji.repeat(currentMath.countB)}
                </span>
                <span className="text-xs font-bold text-amber-300 mr-2">({currentMath.countB})</span>
              </div>

              <span className="text-xl font-black text-amber-400">= ؟</span>
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3">
            {currentMath.options.map((opt) => {
              const isSelected = selectedMathOption === opt;
              const isCorrect = opt === currentMath.correctAnswer;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleMathAnswer(opt)}
                  className={`py-4 px-4 rounded-2xl text-xl sm:text-2xl font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-500 text-emerald-950 scale-105 ring-4 ring-emerald-400/50'
                        : 'bg-rose-500 text-white'
                      : 'bg-white/10 hover:bg-amber-400 hover:text-amber-950 text-white border border-white/15'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && (isCorrect ? ' ✨' : ' ❌')}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          {selectedMathOption !== null && (
            <div
              className={`p-3.5 rounded-2xl text-center font-black text-xs sm:text-sm flex items-center justify-between gap-2 animate-in zoom-in-95 duration-200 ${
                mathSolved ? 'bg-emerald-500 text-emerald-950' : 'bg-rose-900/80 text-rose-200'
              }`}
            >
              <span>
                {mathSolved
                  ? '🎉 إجابة صحيحة وذكية جداً! كسبت +30 نجمة خيال ⭐'
                  : `حاول مجدداً يا بطل! الإجابة الصحيحة هي ${currentMath.correctAnswer}.`}
              </span>
              <button
                type="button"
                onClick={handleNextMath}
                className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-black hover:bg-neutral-800 transition-all cursor-pointer"
              >
                السؤال التالي ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. GAME: SHAHRAZAD SHADOW SILHOUETTE MATCH                */}
      {/* ========================================================= */}
      {selectedGame === 'shadowMatch' && (
        <div className="max-w-2xl mx-auto space-y-5 p-6 rounded-3xl border border-indigo-500/50 bg-gradient-to-b from-[#180d36] via-[#110826] to-[#0a0417] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 block">
                تحدي تمييز ظلال الأبطال
              </span>
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-1.5">
                <Eye className="w-5 h-5 text-indigo-400" />
                <span>لغز ظلال أبطال شهرزاد 🎭</span>
              </h3>
            </div>

            <button
              type="button"
              onClick={handleNextShadow}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200"
              title="البطل التالي"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Mystery Silhouette Box */}
          <div className="p-6 rounded-3xl bg-black/50 border-2 border-dashed border-indigo-400/40 text-center space-y-3">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Silhouette Dark Avatar */}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-700 ${
                  shadowSuccess
                    ? 'scale-110 ring-4 ring-amber-400'
                    : 'brightness-0 invert-[0.15] contrast-200 opacity-90 scale-100'
                }`}
              >
                <ShahrazadCharacterAvatar characterId={activeShadowHero.id} size="lg" />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-amber-300 block">من هو هذا البطل الأسطوري؟</span>
              <p className="text-xs text-purple-200/90 italic mt-1">
                "{activeShadowHero.voiceQuote}"
              </p>
            </div>
          </div>

          {/* 4 Hero Candidate Choices */}
          <div className="grid grid-cols-2 gap-3">
            {shadowCandidates.map((cand) => {
              const isSelected = shadowChosenId === cand.id;
              const isCorrect = cand.id === activeShadowHero.id;
              return (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => handleShadowCandidateClick(cand.id)}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-600 border-emerald-400 text-white scale-105'
                        : 'bg-rose-900 border-rose-500 text-rose-200'
                      : 'bg-white/5 border-white/15 hover:border-purple-400 hover:bg-white/10 text-white'
                  }`}
                >
                  <ShahrazadCharacterAvatar characterId={cand.id} size="sm" />
                  <div className="text-right min-w-0">
                    <span className="text-xs font-black block truncate">{cand.name}</span>
                    <span className="text-[10px] text-purple-300 block truncate">{cand.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button when solved */}
          {shadowChosenId && (
            <div
              className={`p-3 rounded-2xl text-center font-black text-xs flex items-center justify-between gap-2 ${
                shadowSuccess ? 'bg-emerald-500 text-emerald-950' : 'bg-rose-950/80 text-rose-200'
              }`}
            >
              <span>
                {shadowSuccess
                  ? `🎉 رائع! إنه ${activeShadowHero.name} البطل (+35 ⭐)`
                  : `حاول مجدداً! إنه ${activeShadowHero.name}.`}
              </span>
              <button
                type="button"
                onClick={handleNextShadow}
                className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-black cursor-pointer hover:bg-neutral-800"
              >
                البطل التالي ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. GAME: SPEED STAR REFLEX CATCHER                        */}
      {/* ========================================================= */}
      {selectedGame === 'reflexCatcher' && (
        <div className="max-w-2xl mx-auto space-y-4 p-6 rounded-3xl border border-pink-500/50 bg-gradient-to-b from-[#2a0e28] via-[#1a081a] to-[#100310] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold text-pink-400 block">
                تحدي سرعة رد الفعل والانتباه
              </span>
              <h3 className="text-base sm:text-lg font-black text-yellow-300 flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>صائد الشهب والنجوم السريعة ⚡⭐</span>
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-amber-300">النقاط: {reflexScore}</span>
              <span className="px-2.5 py-0.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-mono font-bold">
                ⏳ {reflexTimer}ث
              </span>
            </div>
          </div>

          {/* Reflex Playing Field */}
          <div className="relative w-full h-80 rounded-3xl bg-black/60 border border-purple-500/40 overflow-hidden">
            {!reflexActive && reflexTimer === 20 && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                <span className="text-4xl animate-bounce">⚡</span>
                <h4 className="text-lg font-black text-white">انقر على النجوم والشهب بسرعة قبل اختفائها!</h4>
                <button
                  type="button"
                  onClick={() => {
                    playSparkleSound();
                    setReflexScore(0);
                    setReflexTimer(20);
                    setReflexActive(true);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 text-white font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                >
                  ابدأ التحدي (20 ثانية) ⏱️
                </button>
              </div>
            )}

            {!reflexActive && reflexTimer === 0 && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                <span className="text-4xl">🏆</span>
                <h4 className="text-lg font-black text-amber-300">انتهى الوقت! صيد بطولي!</h4>
                <p className="text-xs text-purple-200">
                  جمعت <span className="text-yellow-400 font-bold">{reflexScore} نقطة</span> ونلت +35 نجمة!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    playSparkleSound();
                    setReflexScore(0);
                    setReflexTimer(20);
                    setReflexActive(true);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs hover:scale-105 cursor-pointer"
                >
                  العب مجدداً ⚡
                </button>
              </div>
            )}

            {/* Falling Catchable Stars */}
            {reflexActive &&
              fallingStars.map((star) => (
                <button
                  key={star.id}
                  type="button"
                  onClick={() => handleCatchStar(star.id, star.points)}
                  className="absolute p-2 text-3xl sm:text-4xl cursor-pointer hover:scale-125 transition-transform animate-in zoom-in duration-150 select-none"
                  style={{ top: `${star.top}%`, left: `${star.left}%` }}
                >
                  {star.emoji}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. 3D MAGIC MEMORY MATCH GAME                             */}
      {/* ========================================================= */}
      {selectedGame === 'memory3D' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-300">موضوع البطاقات:</span>
              {[
                { id: 'space' as const, label: 'الفضاء 🪐' },
                { id: 'languages' as const, label: 'اللغات 🌍' },
                { id: 'jewels' as const, label: 'الجواهر 💎' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDeckTheme(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deckTheme === t.id
                      ? 'bg-amber-400 text-amber-950 font-black shadow'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-purple-200">
              <span>الحركات: {memoryMoves}</span>
              <button
                onClick={() => initMemoryDeck(deckTheme)}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ترتيب</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {memoryCards.map((card, idx) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`relative aspect-[3/4] rounded-2xl cursor-pointer transition-all duration-500 perspective-1000 select-none ${
                  card.isMatched ? 'opacity-80 scale-95 pointer-events-none' : 'hover:scale-105 active:scale-95'
                }`}
              >
                <div
                  className={`w-full h-full rounded-2xl p-2.5 border-2 flex flex-col items-center justify-center text-center shadow-lg transition-transform duration-500 ${
                    card.isFlipped || card.isMatched
                      ? 'bg-gradient-to-b from-purple-800 to-indigo-900 border-amber-300 text-white'
                      : 'bg-gradient-to-b from-[#251347] to-[#12082b] border-purple-500/50 text-purple-300 hover:border-amber-400'
                  }`}
                >
                  {card.isFlipped || card.isMatched ? (
                    <>
                      <span className="text-3xl sm:text-4xl mb-1">{card.icon}</span>
                      <span className="text-[11px] font-black text-amber-300 leading-tight">{card.name}</span>
                      {card.subtext && (
                        <span className="text-[9px] text-purple-200 font-mono opacity-80 mt-0.5">
                          {card.subtext}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-purple-400/80">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                      <span className="text-[10px] font-bold mt-1">رائد ⭐</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {memoryWon && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-center font-black text-base shadow-xl animate-bounce max-w-md mx-auto">
              🎉 مبروك يا بطل! أنهيت التحدي ونلت +35 نجمة خيال! ⭐
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. WORD ALCHEMIST GAME                                    */}
      {/* ========================================================= */}
      {selectedGame === 'wordAlchemist' && (
        <div className="max-w-2xl mx-auto space-y-5 p-6 rounded-3xl border border-emerald-500/50 bg-gradient-to-b from-[#0f2d24] via-[#0b211a] to-[#071612] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 block">تحدي تكوين الكلمات الذكية</span>
              <h3 className="text-base sm:text-lg font-black text-yellow-300">
                مملكة الحروف واللغات العالمية 🔤
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePronounceWord}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500 text-emerald-300 hover:text-emerald-950 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>استمع للنطق</span>
              </button>

              <button onClick={handleResetWord} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-400/30 text-center space-y-1">
            <span className="text-xs font-bold text-emerald-300 block">التلميح الذكي:</span>
            <p className="text-sm font-black text-white">{activeWord.clue}</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border-2 border-dashed border-emerald-400/50 min-h-[70px] flex items-center justify-center gap-2 flex-wrap">
            {builtLetters.length === 0 ? (
              <span className="text-xs opacity-50">اضغط على الحروف في الأسفل بالترتيب الصحيح...</span>
            ) : (
              builtLetters.map((l, i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-2xl bg-emerald-500 text-emerald-950 font-black text-lg flex items-center justify-center shadow-lg font-mono animate-in zoom-in-50 duration-200"
                >
                  {l}
                </div>
              ))
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-300 block text-center">اختر الحروف بالترتيب:</span>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {availableLetters.map((letter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLetterClick(letter, idx)}
                  className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-emerald-400 hover:text-emerald-950 border border-white/20 text-white font-black text-lg flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all font-mono cursor-pointer"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {wordSolved && (
            <div className="p-3.5 rounded-2xl bg-emerald-500 text-emerald-950 text-center font-black text-sm flex items-center justify-between gap-2 animate-in zoom-in-95 duration-200">
              <span>🎉 أحسنت صنعاً! الكلمة صحيحة (+25 ⭐)</span>
              <button
                onClick={() => {
                  playSparkleSound();
                  setCurrentWordIdx((prev) => (prev + 1) % WORD_PUZZLES.length);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-950 text-white text-xs font-black hover:bg-black transition-all cursor-pointer"
              >
                الكلمة التالية ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. CUSTOM USER CREATED GAMES                              */}
      {/* ========================================================= */}
      {selectedGame === 'customGames' && activeCustom && (
        <div className="max-w-2xl mx-auto space-y-5 p-6 rounded-3xl border border-yellow-400/50 bg-gradient-to-b from-[#2a2006] via-[#1a1403] to-[#0c0901] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold text-yellow-400 block">{activeCustom.category}</span>
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <span>{activeCustom.emoji}</span>
                <span>{activeCustom.title}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 font-bold text-xs">
                {activeCustomGameIdx + 1} من {customGames.length}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/30 text-center space-y-2">
            <h4 className="text-base font-black text-white">{activeCustom.question}</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeCustom.options.map((opt, idx) => {
              const isSelected = customGameAnswered === idx;
              const isCorrect = idx === activeCustom.correctIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswerCustom(idx)}
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-600 text-white scale-105'
                        : 'bg-rose-900 text-rose-200'
                      : 'bg-white/10 hover:bg-amber-400 hover:text-amber-950 text-white border border-white/15'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {customGameAnswered !== null && (
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/20 text-center space-y-2">
              <p className="text-xs text-amber-300 font-bold">{activeCustom.explanation}</p>
              {customGames.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomGameAnswered(null);
                    setActiveCustomGameIdx((prev) => (prev + 1) % customGames.length);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-black text-xs hover:bg-amber-300"
                >
                  اللعبة التالية ➡️
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD CUSTOM GAME EASILY (ميزة إضافة ألعاب جديدة بسهولة) */}
      {showAddGameModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
          dir="rtl"
        >
          <div className="relative w-full max-w-xl bg-gradient-to-b from-[#25103a] via-[#180a29] to-[#0f051c] border-2 border-emerald-400 text-white rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500 text-emerald-950 font-black">
                  <Plus className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-emerald-300">
                    تأليف وإضافة لعبة تفاعلية جديدة للمنصة ✍️🎮
                  </h3>
                  <p className="text-[11px] text-purple-200">
                    أضف فوازير وألغاز تعليمية جديدة تظهر فورا في قائمة الألعاب!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddGameModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-amber-300 block">عنوان اللعبة أو التحدي *:</label>
                <input
                  type="text"
                  placeholder="مثال: لغز الكواكب السبعة أو فزورة الحيوانات الذكية"
                  value={newGameTitle}
                  onChange={(e) => setNewGameTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-purple-200 block">التصنيف التعليمي:</label>
                  <select
                    value={newGameCategory}
                    onChange={(e) => setNewGameCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-white"
                  >
                    <option value="علوم وفضاء 🚀">علوم وفضاء 🚀</option>
                    <option value="رياضيات وحساب 🧮">رياضيات وحساب 🧮</option>
                    <option value="لغات وكلمات 🔤">لغات وكلمات 🔤</option>
                    <option value="أخلاق وسلوكيات 💎">أخلاق وسلوكيات 💎</option>
                    <option value="حيوانات وطبيعة 🦊">حيوانات وطبيعة 🦊</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-purple-200 block">الرمز التعبيري (Emoji):</label>
                  <input
                    type="text"
                    value={newGameEmoji}
                    onChange={(e) => setNewGameEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-white text-center text-base"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-amber-300 block">سؤال أو لغز اللعبة *:</label>
                <textarea
                  rows={2}
                  placeholder="اكتب هنا لغز اللعبة أو السؤال الذي سيتحدى الطفل..."
                  value={newGameQuestion}
                  onChange={(e) => setNewGameQuestion(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/10 border border-purple-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-purple-200 block">
                  الخيارات الأربعة (حدد الدائرة بجانب الخيار الصحيح) *:
                </label>
                {newGameOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={newGameCorrectIdx === i}
                      onChange={() => setNewGameCorrectIdx(i)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder={`الخيار ${i + 1} ${newGameCorrectIdx === i ? '(الإجابة الصحيحة ✅)' : ''}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newGameOptions];
                        copy[i] = e.target.value;
                        setNewGameOptions(copy);
                      }}
                      className="flex-grow px-3 py-1.5 rounded-xl bg-white/10 border border-purple-500 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-purple-200 block">شرح الإجابة أو معلومة مشجعة:</label>
                <input
                  type="text"
                  placeholder="مثال: أحسنت! كوكب زحل هو الذي يمتلك أجمل الحلقات المضيئة."
                  value={newGameExplanation}
                  onChange={(e) => setNewGameExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-purple-500 text-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveCustomGame}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:brightness-110 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>نشر وإضافة اللعبة فوراً للمنصة 🚀✨</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
