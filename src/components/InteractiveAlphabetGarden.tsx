import React, { useState, useRef, useEffect } from 'react';
import { AppMode } from '../types';
import {
  Sparkles,
  Volume2,
  Play,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Star,
  Music,
  HelpCircle,
  Zap,
  Globe
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

interface AlphabetItem {
  letter: string;
  lower: string;
  en: {
    word: string;
    translation: string;
    emoji: string;
    phonetic: string;
    sentence: string;
  };
  fr: {
    word: string;
    translation: string;
    emoji: string;
    phonetic: string;
    sentence: string;
  };
  color: string;
  borderHover: string;
  bgGlow: string;
  noteFreq: number; // Musical tone for xylophone effect
}

const ALPHABET_DATA: AlphabetItem[] = [
  {
    letter: 'A',
    lower: 'a',
    en: { word: 'Apple', translation: 'تفاحة', emoji: '🍎', phonetic: '/ˈæp.əl/', sentence: 'A sweet red apple' },
    fr: { word: 'Avion', translation: 'طائرة', emoji: '✈️', phonetic: '/a.vjɔ̃/', sentence: 'Un bel avion vole haut' },
    color: 'from-rose-500 to-red-600',
    borderHover: 'border-rose-400',
    bgGlow: 'rgba(244, 63, 94, 0.45)',
    noteFreq: 261.63, // C4
  },
  {
    letter: 'B',
    lower: 'b',
    en: { word: 'Butterfly', translation: 'فراشة', emoji: '🦋', phonetic: '/ˈbʌt.ə.flaɪ/', sentence: 'Colorful gentle butterfly' },
    fr: { word: 'Ballon', translation: 'بالون', emoji: '🎈', phonetic: '/ba.lɔ̃/', sentence: 'Un ballon rouge joyeux' },
    color: 'from-amber-500 to-orange-600',
    borderHover: 'border-amber-400',
    bgGlow: 'rgba(245, 158, 11, 0.45)',
    noteFreq: 277.18, // C#4
  },
  {
    letter: 'C',
    lower: 'c',
    en: { word: 'Cat', translation: 'قطة لطيفة', emoji: '🐱', phonetic: '/kæt/', sentence: 'A cute playful cat' },
    fr: { word: 'Chat', translation: 'قط', emoji: '🐱', phonetic: '/ʃa/', sentence: 'Le petit chat miaule' },
    color: 'from-yellow-500 to-amber-500',
    borderHover: 'border-yellow-400',
    bgGlow: 'rgba(234, 179, 8, 0.45)',
    noteFreq: 293.66, // D4
  },
  {
    letter: 'D',
    lower: 'd',
    en: { word: 'Dolphin', translation: 'دلفين مرح', emoji: '🐬', phonetic: '/ˈdɒl.fɪn/', sentence: 'The dolphin jumps in the sea' },
    fr: { word: 'Dauphin', translation: 'دلفين', emoji: '🐬', phonetic: '/do.fɛ̃/', sentence: 'Le dauphin nage avec joie' },
    color: 'from-emerald-500 to-teal-600',
    borderHover: 'border-emerald-400',
    bgGlow: 'rgba(16, 185, 129, 0.45)',
    noteFreq: 311.13, // D#4
  },
  {
    letter: 'E',
    lower: 'e',
    en: { word: 'Elephant', translation: 'فيل طيب', emoji: '🐘', phonetic: '/ˈel.ɪ.fənt/', sentence: 'The strong friendly elephant' },
    fr: { word: 'Étoile', translation: 'نجمة مضيئة', emoji: '⭐', phonetic: '/e.twal/', sentence: 'Une étoile brille la nuit' },
    color: 'from-cyan-500 to-blue-600',
    borderHover: 'border-cyan-400',
    bgGlow: 'rgba(6, 182, 212, 0.45)',
    noteFreq: 329.63, // E4
  },
  {
    letter: 'F',
    lower: 'f',
    en: { word: 'Flower', translation: 'وردة جميلة', emoji: '🌸', phonetic: '/flaʊər/', sentence: 'A blooming pink flower' },
    fr: { word: 'Fleur', translation: 'زهرة', emoji: '🌸', phonetic: '/flœʁ/', sentence: 'Une fleur parfumée au jardin' },
    color: 'from-pink-500 to-rose-500',
    borderHover: 'border-pink-400',
    bgGlow: 'rgba(236, 72, 153, 0.45)',
    noteFreq: 349.23, // F4
  },
  {
    letter: 'G',
    lower: 'g',
    en: { word: 'Giraffe', translation: 'زرافة رشيقة', emoji: '🦒', phonetic: '/dʒɪˈrɑːf/', sentence: 'The tall graceful giraffe' },
    fr: { word: 'Gâteau', translation: 'كعكة لذيذة', emoji: '🎂', phonetic: '/ɡɑ.to/', sentence: 'Un gâteau doux et savoureux' },
    color: 'from-lime-500 to-emerald-600',
    borderHover: 'border-lime-400',
    bgGlow: 'rgba(132, 204, 22, 0.45)',
    noteFreq: 369.99, // F#4
  },
  {
    letter: 'H',
    lower: 'h',
    en: { word: 'Heart', translation: 'قلب / محبة', emoji: '💖', phonetic: '/hɑːrt/', sentence: 'A warm caring heart' },
    fr: { word: 'Hibou', translation: 'بومة حكيمة', emoji: '🦉', phonetic: '/i.bu/', sentence: 'Le hibou sage veille' },
    color: 'from-purple-500 to-indigo-600',
    borderHover: 'border-purple-400',
    bgGlow: 'rgba(168, 85, 247, 0.45)',
    noteFreq: 392.00, // G4
  },
  {
    letter: 'I',
    lower: 'i',
    en: { word: 'Ice cream', translation: 'مثلجات', emoji: '🍦', phonetic: '/ˈaɪs ˌkriːm/', sentence: 'Delicious sweet ice cream' },
    fr: { word: 'Île', translation: 'جزيرة خضراء', emoji: '🏝️', phonetic: '/il/', sentence: 'Une île magique sur l’océan' },
    color: 'from-sky-400 to-indigo-500',
    borderHover: 'border-sky-300',
    bgGlow: 'rgba(56, 189, 248, 0.45)',
    noteFreq: 415.30, // G#4
  },
  {
    letter: 'J',
    lower: 'j',
    en: { word: 'Juice', translation: 'عصير طازج', emoji: '🧃', phonetic: '/dʒuːs/', sentence: 'Fresh healthy orange juice' },
    fr: { word: 'Jardin', translation: 'حديقة غناء', emoji: '🌳', phonetic: '/ʒaʁ.dɛ̃/', sentence: 'Un jardin plein de vie' },
    color: 'from-orange-500 to-red-500',
    borderHover: 'border-orange-400',
    bgGlow: 'rgba(249, 115, 22, 0.45)',
    noteFreq: 440.00, // A4
  },
  {
    letter: 'K',
    lower: 'k',
    en: { word: 'Kite', translation: 'طائرة ورقية', emoji: '🪁', phonetic: '/kaɪt/', sentence: 'Flying high in the sky' },
    fr: { word: 'Koala', translation: 'كوالا لطيف', emoji: '🐨', phonetic: '/kɔ.a.la/', sentence: 'Le petit koala dort paisiblement' },
    color: 'from-teal-400 to-emerald-600',
    borderHover: 'border-teal-300',
    bgGlow: 'rgba(45, 212, 191, 0.45)',
    noteFreq: 466.16, // A#4
  },
  {
    letter: 'L',
    lower: 'l',
    en: { word: 'Lion', translation: 'أسد شجاع', emoji: '🦁', phonetic: '/ˈlaɪ.ən/', sentence: 'The brave king of the jungle' },
    fr: { word: 'Lune', translation: 'قمر منير', emoji: '🌙', phonetic: '/lyn/', sentence: 'La lune éclaire la nuit douce' },
    color: 'from-amber-400 to-yellow-600',
    borderHover: 'border-amber-300',
    bgGlow: 'rgba(251, 191, 36, 0.45)',
    noteFreq: 493.88, // B4
  },
  {
    letter: 'M',
    lower: 'm',
    en: { word: 'Moon', translation: 'قمر النجوم', emoji: '🌙', phonetic: '/muːn/', sentence: 'Bright moon in dark night' },
    fr: { word: 'Maison', translation: 'بيت دافئ', emoji: '🏠', phonetic: '/mɛ.zɔ̃/', sentence: 'Une maison chaleureuse' },
    color: 'from-indigo-500 to-purple-700',
    borderHover: 'border-indigo-400',
    bgGlow: 'rgba(99, 102, 241, 0.45)',
    noteFreq: 523.25, // C5
  },
  {
    letter: 'N',
    lower: 'n',
    en: { word: 'Nest', translation: 'عش العصافير', emoji: '🪺', phonetic: '/nest/', sentence: 'Safe cozy birds nest' },
    fr: { word: 'Nuage', translation: 'غيمة بيضاء', emoji: '☁️', phonetic: '/nɥaʒ/', sentence: 'Un nuage doux dans le ciel bleu' },
    color: 'from-blue-400 to-cyan-600',
    borderHover: 'border-blue-300',
    bgGlow: 'rgba(96, 165, 250, 0.45)',
    noteFreq: 554.37, // C#5
  },
  {
    letter: 'O',
    lower: 'o',
    en: { word: 'Orange', translation: 'برتقالة مفيدة', emoji: '🍊', phonetic: '/ˈɒr.ɪndʒ/', sentence: 'Sweet juicy vitamin orange' },
    fr: { word: 'Oiseau', translation: 'طائر مغرد', emoji: '🐦', phonetic: '/wa.zo/', sentence: 'L’oiseau chante au matin' },
    color: 'from-orange-400 to-amber-600',
    borderHover: 'border-orange-300',
    bgGlow: 'rgba(251, 146, 60, 0.45)',
    noteFreq: 587.33, // D5
  },
  {
    letter: 'P',
    lower: 'p',
    en: { word: 'Panda', translation: 'باندا محبوب', emoji: '🐼', phonetic: '/ˈpæn.də/', sentence: 'Cute panda eating bamboo' },
    fr: { word: 'Papillon', translation: 'فراشة رقيقة', emoji: '🦋', phonetic: '/pa.pi.jɔ̃/', sentence: 'Le papillon danse au soleil' },
    color: 'from-emerald-400 to-green-600',
    borderHover: 'border-emerald-300',
    bgGlow: 'rgba(52, 211, 153, 0.45)',
    noteFreq: 622.25, // D#5
  },
  {
    letter: 'Q',
    lower: 'q',
    en: { word: 'Queen', translation: 'ملكة طيبة', emoji: '👑', phonetic: '/kwiːn/', sentence: 'A noble gentle queen' },
    fr: { word: 'Quatre', translation: 'رقم أربعة', emoji: '4️⃣', phonetic: '/katʁ/', sentence: 'Le chiffre quatre' },
    color: 'from-fuchsia-500 to-pink-600',
    borderHover: 'border-fuchsia-400',
    bgGlow: 'rgba(217, 70, 239, 0.45)',
    noteFreq: 659.25, // E5
  },
  {
    letter: 'R',
    lower: 'r',
    en: { word: 'Rocket', translation: 'صاروخ النجوم', emoji: '🚀', phonetic: '/ˈrɒk.ɪt/', sentence: 'Zooming to the red planet' },
    fr: { word: 'Rose', translation: 'وردة عبقة', emoji: '🌹', phonetic: '/ʁoz/', sentence: 'Une rose rouge magnifique' },
    color: 'from-red-500 to-rose-700',
    borderHover: 'border-red-400',
    bgGlow: 'rgba(239, 68, 68, 0.45)',
    noteFreq: 698.46, // F5
  },
  {
    letter: 'S',
    lower: 's',
    en: { word: 'Star', translation: 'نجمة متألقة', emoji: '⭐', phonetic: '/stɑːr/', sentence: 'Shining bright in the sky' },
    fr: { word: 'Soleil', translation: 'شمس دافئة', emoji: '☀️', phonetic: '/sɔ.lɛj/', sentence: 'Le soleil réchauffe la terre' },
    color: 'from-amber-300 to-yellow-500',
    borderHover: 'border-amber-200',
    bgGlow: 'rgba(252, 211, 77, 0.45)',
    noteFreq: 739.99, // F#5
  },
  {
    letter: 'T',
    lower: 't',
    en: { word: 'Tree', translation: 'شجرة ظليلة', emoji: '🌳', phonetic: '/triː/', sentence: 'Green fruitful tall tree' },
    fr: { word: 'Train', translation: 'قطار سريع', emoji: '🚂', phonetic: '/tʁɛ̃/', sentence: 'Le train voyage à travers les montagnes' },
    color: 'from-green-500 to-emerald-700',
    borderHover: 'border-green-400',
    bgGlow: 'rgba(34, 197, 94, 0.45)',
    noteFreq: 783.99, // G5
  },
  {
    letter: 'U',
    lower: 'u',
    en: { word: 'Umbrella', translation: 'مظلة المطر', emoji: '☂️', phonetic: '/ʌmˈbrel.ə/', sentence: 'Shelter from rain drops' },
    fr: { word: 'Univers', translation: 'الكون الواسع', emoji: '🌌', phonetic: '/y.ni.vɛʁ/', sentence: 'L’univers infini et fascinant' },
    color: 'from-violet-500 to-purple-600',
    borderHover: 'border-violet-400',
    bgGlow: 'rgba(139, 92, 246, 0.45)',
    noteFreq: 830.61, // G#5
  },
  {
    letter: 'V',
    lower: 'v',
    en: { word: 'Violin', translation: 'كمان موسيقي', emoji: '🎻', phonetic: '/ˌvaɪəˈlɪn/', sentence: 'Making soothing sweet music' },
    fr: { word: 'Voiture', translation: 'سيارة جميلة', emoji: '🚗', phonetic: '/vwa.tyʁ/', sentence: 'Une jolie voiture sur la route' },
    color: 'from-rose-400 to-pink-600',
    borderHover: 'border-rose-300',
    bgGlow: 'rgba(251, 113, 133, 0.45)',
    noteFreq: 880.00, // A5
  },
  {
    letter: 'W',
    lower: 'w',
    en: { word: 'Whale', translation: 'حوت المحيط', emoji: '🐋', phonetic: '/weɪl/', sentence: 'Gentle giant of deep blue ocean' },
    fr: { word: 'Wagon', translation: 'عربة قطار', emoji: '🚃', phonetic: '/va.ɡɔ̃/', sentence: 'Le wagon roule sur les rails' },
    color: 'from-blue-500 to-cyan-600',
    borderHover: 'border-blue-400',
    bgGlow: 'rgba(59, 130, 246, 0.45)',
    noteFreq: 932.33, // A#5
  },
  {
    letter: 'X',
    lower: 'x',
    en: { word: 'Xylophone', translation: 'إكسيليفون ملون', emoji: '🎼', phonetic: '/ˈzaɪ.lə.fəʊn/', sentence: 'Playing cheerful melodies' },
    fr: { word: 'Xylophone', translation: 'إكسيليفون', emoji: '🎼', phonetic: '/ɡzi.lɔ.fɔn/', sentence: 'Les notes magiques du xylophone' },
    color: 'from-fuchsia-400 to-purple-600',
    borderHover: 'border-fuchsia-300',
    bgGlow: 'rgba(232, 121, 249, 0.45)',
    noteFreq: 987.77, // B5
  },
  {
    letter: 'Y',
    lower: 'y',
    en: { word: 'Yacht', translation: 'يخت شراعي', emoji: '⛵', phonetic: '/jɒt/', sentence: 'Sailing smoothly on blue waves' },
    fr: { word: 'Yeux', translation: 'عيون براقة', emoji: '👀', phonetic: '/jø/', sentence: 'Des yeux curieux et brillants' },
    color: 'from-teal-400 to-cyan-500',
    borderHover: 'border-teal-300',
    bgGlow: 'rgba(45, 212, 191, 0.45)',
    noteFreq: 1046.50, // C6
  },
  {
    letter: 'Z',
    lower: 'z',
    en: { word: 'Zebra', translation: 'حمار وحشي مخطط', emoji: '🦓', phonetic: '/ˈzeb.rə/', sentence: 'Unique black and white stripes' },
    fr: { word: 'Zèbre', translation: 'حمار وحشي', emoji: '🦓', phonetic: '/zɛbʁ/', sentence: 'Le zèbre court dans la savane' },
    color: 'from-slate-600 to-zinc-900',
    borderHover: 'border-slate-400',
    bgGlow: 'rgba(148, 163, 184, 0.45)',
    noteFreq: 1108.73, // C#6
  },
];

interface FloatingParticle {
  id: number;
  letter: string;
  emoji: string;
  x: number;
  y: number;
}

interface InteractiveAlphabetGardenProps {
  mode: AppMode;
  onEarnStars?: (amount: number) => void;
}

export const InteractiveAlphabetGarden: React.FC<InteractiveAlphabetGardenProps> = ({
  mode,
  onEarnStars,
}) => {
  const [activeLang, setActiveLang] = useState<'en' | 'fr'>('en');
  const [selectedLetter, setSelectedLetter] = useState<AlphabetItem>(ALPHABET_DATA[0]);
  const [touchEffects, setTouchEffects] = useState<FloatingParticle[]>([]);
  const [lastTouchedLetter, setLastTouchedLetter] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [isChallengeActive, setIsChallengeActive] = useState<boolean>(false);
  const [targetLetterChallenge, setTargetLetterChallenge] = useState<AlphabetItem | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<string>('');
  const [soundScaleMuted, setSoundScaleMuted] = useState<boolean>(false);

  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayIndexRef = useRef<number>(0);

  // Play musical pitch corresponding to letter
  const playLetterMusicalTone = (freq: number) => {
    if (soundScaleMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // AudioCtx fallback
    }
  };

  // Speak letter and word
  const speakLetter = (item: AlphabetItem, lang: 'en' | 'fr') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const details = lang === 'en' ? item.en : item.fr;
      // Speech format: "A! Apple!" or "A! Avion!"
      const textToSpeak = `${item.letter}... ${details.word}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Touch letter handler with rich visual effects
  const handleTouchLetter = (item: AlphabetItem, e?: React.MouseEvent) => {
    playLetterMusicalTone(item.noteFreq);
    playPopSound();
    setSelectedLetter(item);
    setLastTouchedLetter(item.letter);

    // Spawn floating particle effect at click location or centered
    const rect = e?.currentTarget.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top : 200;

    const newParticle: FloatingParticle = {
      id: Date.now() + Math.random(),
      letter: item.letter,
      emoji: activeLang === 'en' ? item.en.emoji : item.fr.emoji,
      x,
      y,
    };

    setTouchEffects((prev) => [...prev.slice(-8), newParticle]);
    setTimeout(() => {
      setTouchEffects((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1200);

    // Speak with native pronunciation
    speakLetter(item, activeLang);

    // Check challenge mode
    if (isChallengeActive && targetLetterChallenge) {
      if (item.letter === targetLetterChallenge.letter) {
        playFanfareSound();
        confetti({ particleCount: 50, spread: 60 });
        setChallengeFeedback(`أحسنت يا بطل! هذا هو حرف ${item.letter} (${activeLang === 'en' ? item.en.word : item.fr.word}) 🎯✨ +10 نجوم`);
        if (onEarnStars) onEarnStars(10);
        setTimeout(() => {
          startNewChallenge();
        }, 1800);
      } else {
        playWrongSound();
        setChallengeFeedback(`حاول ثانية! هذا حرف ${item.letter}، ونحن نبحث عن حرف ${targetLetterChallenge.letter} 🔍`);
      }
    } else {
      if (onEarnStars) {
        onEarnStars(2);
      }
    }
  };

  // Start new letter search challenge
  const startNewChallenge = () => {
    const randomItem = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    setTargetLetterChallenge(randomItem);
    setIsChallengeActive(true);
    playSparkleSound();
    setChallengeFeedback(
      `أين تجد حرف "${randomItem.letter}"؟ (كلمة: ${activeLang === 'en' ? randomItem.en.word : randomItem.fr.word} ${activeLang === 'en' ? randomItem.en.emoji : randomItem.fr.emoji}) 🔎`
    );
  };

  // Auto-play rhythmic alphabet melody
  const handleToggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    } else {
      setIsAutoPlaying(true);
      autoPlayIndexRef.current = 0;
      playSparkleSound();
      runAutoPlayStep();
    }
  };

  const runAutoPlayStep = () => {
    const idx = autoPlayIndexRef.current;
    if (idx >= ALPHABET_DATA.length) {
      setIsAutoPlaying(false);
      playFanfareSound();
      confetti({ particleCount: 70, spread: 70 });
      return;
    }
    const current = ALPHABET_DATA[idx];
    setSelectedLetter(current);
    setLastTouchedLetter(current.letter);
    playLetterMusicalTone(current.noteFreq);
    speakLetter(current, activeLang);

    autoPlayIndexRef.current = idx + 1;
    autoPlayTimeoutRef.current = setTimeout(runAutoPlayStep, 1000);
  };

  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    };
  }, []);

  const activeDetails = activeLang === 'en' ? selectedLetter.en : selectedLetter.fr;

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-400/60 p-4 sm:p-6 shadow-2xl transition-all duration-300 bg-gradient-to-b from-[#0a231d] via-[#071a15] to-[#04100d] text-white">
      {/* Background Magical Ambient Light */}
      <div
        className="absolute top-0 right-1/4 w-80 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ background: selectedLetter.bgGlow }}
      />
      <div className="absolute bottom-0 left-10 w-60 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparkle Particles on Touch */}
      {touchEffects.map((p) => (
        <div
          key={p.id}
          className="fixed z-50 pointer-events-none animate-in fade-in zoom-in-50 duration-700 flex flex-col items-center"
          style={{
            left: `${p.x}px`,
            top: `${p.y - 40}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="text-3xl animate-bounce drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]">
            {p.emoji}
          </div>
          <span className="text-xs font-black text-amber-300 px-2 py-0.5 rounded-full bg-black/80 border border-amber-300/60 shadow-lg mt-1">
            {p.letter}! +2 ⭐
          </span>
        </div>
      ))}

      {/* Header Bar: Title + Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-emerald-500/30">
        <div className="flex items-center gap-2.5 text-center sm:text-right">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow-lg ring-2 ring-emerald-300/40">
            🔤
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-300 to-amber-300">
                حديقة الحروف الأبجدية التفاعلية
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black animate-pulse">
                المس واكتشف ✨
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 font-medium">
              المس الحروف لسماع نطقها ومشاهدة بريقها وألحانها الموسيقية!
            </p>
          </div>
        </div>

        {/* Language & Interactive Mode Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Language Toggle: EN / FR */}
          <div className="flex items-center bg-black/40 rounded-2xl p-1 border border-emerald-500/40">
            <button
              onClick={() => {
                playClickSound();
                setActiveLang('en');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                activeLang === 'en'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 shadow-md font-black'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <span>🇬🇧</span>
              <span>English (A-Z)</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveLang('fr');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                activeLang === 'fr'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-black'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <span>🇫🇷</span>
              <span>Français (A-Z)</span>
            </button>
          </div>

          {/* Musical Melodic Tour Button */}
          <button
            onClick={handleToggleAutoPlay}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
              isAutoPlaying
                ? 'bg-rose-500 border-rose-300 text-white animate-pulse'
                : 'bg-emerald-600/30 hover:bg-emerald-600/50 border-emerald-400/40 text-emerald-200'
            }`}
            title="عزف نغمات الحروف تلقائياً كالإكسيليفون 🎶"
          >
            <Music className="w-3.5 h-3.5 text-amber-300" />
            <span>{isAutoPlaying ? 'إيقاف النغمات ⏹️' : 'عزف الحروف 🎶'}</span>
          </button>

          {/* Letter Finding Game Challenge Button */}
          <button
            onClick={() => {
              if (isChallengeActive) {
                setIsChallengeActive(false);
                setChallengeFeedback('');
              } else {
                startNewChallenge();
              }
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
              isChallengeActive
                ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-md'
                : 'bg-teal-600/30 hover:bg-teal-600/50 border-teal-400/40 text-teal-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{isChallengeActive ? 'إغلاق التحدي ✕' : 'تحدي الحروف 🎯'}</span>
          </button>
        </div>
      </div>

      {/* Challenge Alert Bar if Active */}
      {isChallengeActive && challengeFeedback && (
        <div className="relative z-10 mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-teal-500/25 to-emerald-500/25 border border-amber-400/60 flex items-center justify-between gap-2 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-300">
            <span className="text-xl">🎯</span>
            <span>{challengeFeedback}</span>
          </div>
          <button
            onClick={startNewChallenge}
            className="px-2.5 py-1 rounded-xl bg-amber-400 text-amber-950 text-xs font-black hover:scale-105 cursor-pointer flex-shrink-0"
          >
            حرف آخر 🔄
          </button>
        </div>
      )}

      {/* Spotlight Showcase of Current Selected Letter */}
      <div className="relative z-10 my-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-black/50 via-black/35 to-black/50 border border-emerald-400/40 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Giant Animated 3D Letter Badge */}
        <div className="flex items-center gap-4">
          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${selectedLetter.color} border-2 border-white/60 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 group`}
            onClick={() => handleTouchLetter(selectedLetter)}
            style={{ boxShadow: `0 0 35px ${selectedLetter.bgGlow}` }}
          >
            {/* Pulsating Glow Ring */}
            <div className="absolute inset-0 rounded-3xl animate-ping opacity-25 border border-white" />

            <div className="flex items-baseline gap-1 font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              <span className="text-3xl sm:text-4xl">{selectedLetter.letter}</span>
              <span className="text-xl sm:text-2xl opacity-90">{selectedLetter.lower}</span>
            </div>

            <span className="text-[10px] font-bold text-amber-200 mt-0.5 flex items-center gap-0.5">
              <span>{activeLang === 'en' ? 'Letter' : 'Lettre'}</span>
            </span>
          </div>

          {/* Letter Info & Illustrated Word */}
          <div className="space-y-1 text-center sm:text-right">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-2xl sm:text-3xl animate-bounce">
                {activeDetails.emoji}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-yellow-300 tracking-wide font-mono">
                {activeDetails.word}
              </h3>
            </div>

            <div className="flex items-center gap-2 justify-center sm:justify-start text-xs sm:text-sm">
              <span className="font-extrabold text-amber-400">
                المعنى: {activeDetails.translation}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-[11px] text-teal-300/90 dir-ltr">
                {activeDetails.phonetic}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-emerald-100/80 font-medium italic">
              "{activeDetails.sentence}"
            </p>
          </div>
        </div>

        {/* Right: Pronunciation Audio Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => speakLetter(selectedLetter, activeLang)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-900/50 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-200/40"
          >
            <Volume2 className="w-4 h-4 text-emerald-950" />
            <span>نطق حرف ({selectedLetter.letter})</span>
          </button>
        </div>
      </div>

      {/* ===================== THE ALPHABET GRID (A to Z) ===================== */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-300/90 px-1">
          <span>لوحة الحروف الأبجدية (26 حرفاً مع مؤثرات ضوئية وصوتية)</span>
          <span className="text-amber-300">اضغط أي حرف للمفاجأة 🌟</span>
        </div>

        {/* Responsive Grid with 3D Bouncy Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-13 gap-2 sm:gap-2.5">
          {ALPHABET_DATA.map((item) => {
            const isSelected = selectedLetter.letter === item.letter;
            const isJustTouched = lastTouchedLetter === item.letter;
            const details = activeLang === 'en' ? item.en : item.fr;

            return (
              <button
                key={item.letter}
                type="button"
                onClick={(e) => handleTouchLetter(item, e)}
                className={`group relative p-2 sm:p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer select-none overflow-hidden ${
                  isSelected
                    ? `scale-110 z-20 border-white ring-4 ring-amber-300/70 shadow-2xl bg-gradient-to-b ${item.color} -translate-y-1.5`
                    : `bg-slate-900/80 hover:bg-slate-800/90 border-emerald-500/30 hover:${item.borderHover} hover:scale-105 active:scale-90 hover:-translate-y-1`
                }`}
                style={{
                  boxShadow: isSelected
                    ? `0 0 25px ${item.bgGlow}`
                    : undefined,
                }}
                title={`حرف ${item.letter} - ${details.word} (${details.translation})`}
              >
                {/* Glowing neon halo when active */}
                {isSelected && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-40 animate-pulse"
                    style={{ background: item.bgGlow }}
                  />
                )}

                {/* Sparkling star badge on top-right */}
                {isSelected && (
                  <span className="absolute top-1 right-1 text-[8px] animate-ping">
                    ⭐
                  </span>
                )}

                {/* Primary Letter Display */}
                <div
                  className={`font-black text-xl sm:text-2xl font-mono leading-none transition-transform duration-300 group-hover:scale-115 ${
                    isSelected ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-emerald-200 group-hover:text-amber-300'
                  }`}
                >
                  {item.letter}
                </div>

                {/* Lowercase letter */}
                <span
                  className={`text-[10px] font-bold font-mono transition-colors ${
                    isSelected ? 'text-amber-200' : 'text-slate-400 group-hover:text-emerald-300'
                  }`}
                >
                  {item.lower}
                </span>

                {/* Associated Cartoon Emoji */}
                <span className="text-sm mt-1 transition-transform group-hover:scale-125 duration-200">
                  {details.emoji}
                </span>

                {/* Mini word label on hover / select */}
                <span
                  className={`text-[8px] font-bold truncate max-w-full px-1 rounded mt-0.5 ${
                    isSelected
                      ? 'bg-black/40 text-yellow-200'
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  {details.word}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info Tips */}
      <div className="relative z-10 mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200/80">
        <div className="flex items-center gap-1.5 font-medium">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>كل حرف يصدر نغمة موسيقية خاصة ونطقاً صحيحاً مع صور كرتونية معبرة</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-300 font-bold">26 حرفاً إنجليزياً وفرنسياً متكاملاً 🌟</span>
        </div>
      </div>
    </div>
  );
};
