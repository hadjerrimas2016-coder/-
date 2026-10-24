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
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playPopSound,
  playSparkleSound,
  playFanfareSound,
  playCorrectSound,
  playWrongSound,
  playClickSound
} from '../utils/audio';

interface GamesCornerProps {
  mode: AppMode;
  onEarnStars: (amount: number) => void;
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

export const GamesCorner: React.FC<GamesCornerProps> = ({ mode, onEarnStars }) => {
  const [selectedGame, setSelectedGame] = useState<'spaceRunner' | 'memory3D' | 'wordAlchemist' | 'storyPuzzle'>('spaceRunner');

  // ========================================================
  // 1. GAME 1: COSMIC STAR RUNNER (Canvas Arcade Flight)
  // ========================================================
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
    let shipY = canvas.height - 70;
    let targetX = shipX;
    let score = 0;
    let lives = 3;

    // Stars background
    const stars: { x: number; y: number; speed: number; size: number }[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1 + Math.random() * 2.5,
        size: 1 + Math.random() * 2,
      });
    }

    // Collectibles (Star Gems & Crystals)
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

      // Clear Canvas
      ctx.fillStyle = '#0a071c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Starfield Background
      ctx.fillStyle = '#ffffff';
      stars.forEach((s) => {
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Smooth ship movement
      shipX += (targetX - shipX) * 0.15;
      shipX = Math.max(30, Math.min(canvas.width - 30, shipX));

      // Draw Spaceship
      ctx.save();
      ctx.translate(shipX, shipY);
      // Flame thruster
      ctx.fillStyle = frameCount % 4 < 2 ? '#ff4400' : '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(-8, 18);
      ctx.lineTo(8, 18);
      ctx.lineTo(0, 32 + (frameCount % 6));
      ctx.fill();

      // Ship body (Sleek Rocket)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(16, 16);
      ctx.lineTo(-16, 16);
      ctx.closePath();
      ctx.fill();

      // Wings
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.moveTo(-16, 6);
      ctx.lineTo(-26, 18);
      ctx.lineTo(-14, 18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(16, 6);
      ctx.lineTo(26, 18);
      ctx.lineTo(14, 18);
      ctx.fill();

      // Cockpit dome
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Spawn Items
      if (frameCount % 45 === 0) {
        const rand = Math.random();
        items.push({
          x: 25 + Math.random() * (canvas.width - 50),
          y: -20,
          type: rand < 0.65 ? 'star' : rand < 0.85 ? 'meteor' : 'crystal',
          speed: 2 + Math.random() * 2,
          size: rand < 0.65 ? 14 : rand < 0.85 ? 18 : 16,
        });
      }

      // Update and Draw Items
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;

        // Draw item
        ctx.save();
        ctx.translate(item.x, item.y);
        if (item.type === 'star') {
          ctx.font = '20px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', 0, 0);
        } else if (item.type === 'crystal') {
          ctx.font = '20px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💎', 0, 0);
        } else {
          ctx.font = '22px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('☄️', 0, 0);
        }
        ctx.restore();

        // Collision detection with spaceship
        const dist = Math.hypot(shipX - item.x, shipY - item.y);
        if (dist < 32) {
          if (item.type === 'star') {
            score += 15;
            setRunnerScore(score);
            playSparkleSound();
          } else if (item.type === 'crystal') {
            score += 35;
            setRunnerScore(score);
            playPopSound();
          } else if (item.type === 'meteor') {
            lives -= 1;
            setRunnerLives(lives);
            playWrongSound();
            if (lives <= 0) {
              setRunnerGameOver(true);
              setRunnerPlaying(false);
              const earned = Math.floor(score / 5);
              if (earned > 0) {
                onEarnStars(earned);
                playFanfareSound();
                confetti({ particleCount: 50, spread: 60 });
              }
              return;
            }
          }
          items.splice(i, 1);
          continue;
        }

        // Out of screen
        if (item.y > canvas.height + 25) {
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
  }, [selectedGame, runnerPlaying, onEarnStars]);

  const handleStartRunner = () => {
    playSparkleSound();
    setRunnerScore(0);
    setRunnerLives(3);
    setRunnerGameOver(false);
    setRunnerPlaying(true);
  };

  // ========================================================
  // 2. GAME 2: 3D MAGIC MEMORY MATCH
  // ========================================================
  const [deckTheme, setDeckTheme] = useState<'space' | 'languages' | 'jewels'>('space');
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState<number>(0);
  const [memoryWon, setMemoryWon] = useState<boolean>(false);

  const initMemoryDeck = (theme = deckTheme) => {
    playPopSound();
    const source = THEMED_DECKS[theme];
    const paired = [...source, ...source]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        id: idx,
        icon: item.icon,
        name: item.name,
        subtext: item.subtext,
        isFlipped: false,
        isMatched: false,
      }));
    setMemoryCards(paired);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  };

  useEffect(() => {
    initMemoryDeck(deckTheme);
  }, [deckTheme]);

  const handleCardClick = (idx: number) => {
    if (flippedIndices.length === 2 || memoryCards[idx].isFlipped || memoryCards[idx].isMatched) return;

    playClickSound();
    const newCards = [...memoryCards];
    newCards[idx].isFlipped = true;
    setMemoryCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (newCards[firstIdx].name === newCards[secondIdx].name) {
        // Matched!
        setTimeout(() => {
          playCorrectSound();
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);

          if (newCards.every((c) => c.isMatched)) {
            setMemoryWon(true);
            playFanfareSound();
            confetti({ particleCount: 70, spread: 70 });
            onEarnStars(35);
          }
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setMemoryCards([...newCards]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // ========================================================
  // 3. GAME 3: WORD ALCHEMIST / KINGDOM OF WORDS
  // ========================================================
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(0);
  const [builtLetters, setBuiltLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [wordSolved, setWordSolved] = useState<boolean>(false);

  const activeWord = WORD_PUZZLES[currentWordIdx];

  useEffect(() => {
    setBuiltLetters([]);
    setWordSolved(false);
    // Shuffle target letters
    const shuffled = [...activeWord.letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
  }, [currentWordIdx]);

  const handleLetterClick = (letter: string, index: number) => {
    playClickSound();
    const updatedBuilt = [...builtLetters, letter];
    setBuiltLetters(updatedBuilt);

    const updatedAvail = [...availableLetters];
    updatedAvail.splice(index, 1);
    setAvailableLetters(updatedAvail);

    if (updatedBuilt.join('') === activeWord.target) {
      setWordSolved(true);
      playFanfareSound();
      confetti({ particleCount: 60, spread: 60 });
      onEarnStars(25);
    } else if (updatedBuilt.length === activeWord.letters.length) {
      playWrongSound();
    }
  };

  const handleResetWord = () => {
    playPopSound();
    setBuiltLetters([]);
    setWordSolved(false);
    setAvailableLetters([...activeWord.letters].sort(() => Math.random() - 0.5));
  };

  const handlePronounceWord = () => {
    playSparkleSound();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(activeWord.target);
      utt.lang = activeWord.lang === 'en' ? 'en-US' : activeWord.lang === 'fr' ? 'fr-FR' : 'ar-SA';
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-7 animate-in fade-in duration-300">
      {/* Game Selector Menu Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              playClickSound();
              setSelectedGame('spaceRunner');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              selectedGame === 'spaceRunner'
                ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white shadow-xl scale-105'
                : 'bg-white/10 hover:bg-white/20 text-purple-200'
            }`}
          >
            <Rocket className="w-4 h-4 text-amber-300" />
            <span>صقر الفضاء: سباق النجوم 🚀</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setSelectedGame('memory3D');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              selectedGame === 'memory3D'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 shadow-xl scale-105'
                : 'bg-white/10 hover:bg-white/20 text-purple-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-900" />
            <span>الذاكرة السحرية ثلاثية الأبعاد 🃏</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setSelectedGame('wordAlchemist');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              selectedGame === 'wordAlchemist'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 shadow-xl scale-105'
                : 'bg-white/10 hover:bg-white/20 text-purple-200'
            }`}
          >
            <Languages className="w-4 h-4 text-white" />
            <span>مملكة الكلمات واللغات 🔤</span>
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-black">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>اربح حتى +50 نجمة في كل لعبة!</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. COSMIC STAR RUNNER ARCADE GAME                         */}
      {/* ========================================================= */}
      {selectedGame === 'spaceRunner' && (
        <div className="space-y-4">
          <div
            className={`relative rounded-3xl p-5 overflow-hidden border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 ${
              mode === 'day'
                ? 'bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 border-indigo-200 text-slate-800'
                : 'bg-[#150d36] border-purple-700/60 text-white'
            }`}
          >
            <div className="space-y-1.5 text-center md:text-right">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white">
                لعبة أركيد حركية متطورة
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300">
                صقر الفضاء: سباق النجوم الكونية 🚀
              </h2>
              <p className="text-xs opacity-80">
                حرّك الصاروخ بيدك أو الفأرة، اجمع النجوم الذهبية والجواهر وتفادَ الشهب لجمع أكبر عدد من النجوم!
              </p>
            </div>

            {/* Score & Lives HUD */}
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

          {/* Canvas Box */}
          <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-purple-500 shadow-[0_0_35px_rgba(139,92,246,0.3)] bg-black aspect-[16/10] sm:aspect-[16/9]">
            <canvas
              ref={canvasRef}
              width={640}
              height={380}
              className="w-full h-full object-contain cursor-crosshair"
            />

            {/* Start Screen Overlay */}
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
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-amber-950 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  انطلق الآن 🚀
                </button>
              </div>
            )}

            {/* Game Over Screen */}
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
      {/* 2. 3D MAGIC MEMORY MATCH GAME                             */}
      {/* ========================================================= */}
      {selectedGame === 'memory3D' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Theme Selector */}
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

          {/* Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {memoryCards.map((card, idx) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`relative aspect-[3/4] rounded-2xl cursor-pointer transition-all duration-500 perspective-1000 select-none ${
                  card.isMatched
                    ? 'opacity-80 scale-95 pointer-events-none'
                    : 'hover:scale-105 active:scale-95'
                }`}
              >
                <div
                  className={`w-full h-full rounded-2xl p-2.5 border-2 flex flex-col items-center justify-center text-center shadow-lg transition-transform duration-500 ${
                    card.isFlipped || card.isMatched
                      ? 'bg-gradient-to-b from-purple-800 to-indigo-900 border-amber-300 text-white rotate-y-0'
                      : 'bg-gradient-to-b from-[#251347] to-[#12082b] border-purple-500/50 text-purple-300 hover:border-amber-400'
                  }`}
                >
                  {card.isFlipped || card.isMatched ? (
                    <>
                      <span className="text-3xl sm:text-4xl mb-1">{card.icon}</span>
                      <span className="text-[11px] font-black text-amber-300 leading-tight">
                        {card.name}
                      </span>
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

          {/* Celebration banner when won */}
          {memoryWon && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-center font-black text-base shadow-xl animate-bounce max-w-md mx-auto">
              🎉 مبروك يا بطل! أنهيت التحدي ونلت +35 نجمة خيال! ⭐
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. WORD ALCHEMIST / KINGDOM OF WORDS                      */}
      {/* ========================================================= */}
      {selectedGame === 'wordAlchemist' && (
        <div className="max-w-2xl mx-auto space-y-5 p-6 rounded-3xl border border-emerald-500/50 bg-gradient-to-b from-[#0f2d24] via-[#0b211a] to-[#071612] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 block">
                تحدي تكوين الكلمات الذكية
              </span>
              <h3 className="text-base sm:text-lg font-black text-yellow-300">
                مملكة الحروف واللغات العالمية 🔤
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePronounceWord}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500 text-emerald-300 hover:text-emerald-950 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="استمع لنطق الكلمة"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>استمع للنطق</span>
              </button>

              <button
                onClick={handleResetWord}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20"
                title="إعادة المحاولة"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clue Box */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-400/30 text-center space-y-1">
            <span className="text-xs font-bold text-emerald-300 block">التلميح الذكي:</span>
            <p className="text-sm font-black text-white">{activeWord.clue}</p>
          </div>

          {/* Built Letters Display Area */}
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

          {/* Available Letter Tiles to Click */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-300 block text-center">
              اختر الحروف بالترتيب:
            </span>
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

          {/* Success Message & Next Word Button */}
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
    </div>
  );
};
