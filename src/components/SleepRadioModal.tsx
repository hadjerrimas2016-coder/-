import React, { useState, useEffect } from 'react';
import { AppMode } from '../types';
import {
  Moon,
  X,
  Play,
  Pause,
  Timer,
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  Waves
} from 'lucide-react';
import { playClickSound, speakArabicSpeech, stopArabicSpeech } from '../utils/audio';

interface SleepRadioModalProps {
  mode: AppMode;
  onClose: () => void;
}

export const SleepRadioModal: React.FC<SleepRadioModalProps> = ({ mode, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(30);
  const [ambientSound, setAmbientSound] = useState<'lullaby' | 'waves' | 'night'>('lullaby');

  useEffect(() => {
    // Start calm speech narration
    speakArabicSpeech(
      'أهلاً بك في راديو نوم رائد.. أغمض عينيك الجميلتين بسلام.. واستمع إلى همسات النجوم وألحان الهدوء.. أحلاماً سعيدة مليئة بالسلام والنور.'
    );

    return () => {
      stopArabicSpeech();
    };
  }, []);

  const handleTogglePlay = () => {
    playClickSound();
    if (isPlaying) {
      setIsPlaying(false);
      stopArabicSpeech();
    } else {
      setIsPlaying(true);
      speakArabicSpeech(
        'نحن الآن في واحة الأحلام الساحرة.. تنفس بعمق وهدوء.. دع كل أفكار اليوم تنام بسلام تحت سماء النجوم.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xl bg-black/75 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-purple-800/80 bg-gradient-to-b from-[#18113b] via-[#100b2b] to-[#080517] text-white my-auto p-6 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-400/20 text-yellow-300">
              <Moon className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-1.5">
                <span>راديو النوم الهادئ</span>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </h2>
              <p className="text-xs text-purple-300/80">قصص مهدئة وألحان استرخاء لنوم هنيء</p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              stopArabicSpeech();
              onClose();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Visual Moon & Character in Sleep Radio */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-300/60 p-1 shadow-[0_0_50px_rgba(168,85,247,0.4)] flex items-center justify-center animate-pulse">
              <span className="text-6xl select-none">🌙</span>
            </div>
            <span className="absolute -top-1 -right-1 text-2xl animate-bounce">⭐</span>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-amber-300">همسات النجوم ووادي الأحلام</h3>
            <p className="text-xs text-purple-200/70 max-w-xs">
              قصة تهويدة بصوت دافئ لمساعدة بطلك الصغير على الاسترخاء والسكينة
            </p>
          </div>
        </div>

        {/* Ambient Sound Presets */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-purple-300 block">صوت الخلفية المهدئ:</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'lullaby' as const, label: 'تهويدة سحرية', icon: Music },
              { id: 'waves' as const, label: 'أمواج لطيفة', icon: Waves },
              { id: 'night' as const, label: 'سكون الليل', icon: Moon },
            ].map((snd) => {
              const Icon = snd.icon;
              const isSelected = ambientSound === snd.id;
              return (
                <button
                  key={snd.id}
                  onClick={() => {
                    playClickSound();
                    setAmbientSound(snd.id);
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-purple-300 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{snd.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sleep Timer Preset Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-300">
            <span className="flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>مؤقت الإيقاف التلقائي:</span>
            </span>
            <span className="text-amber-300">{sleepTimerMinutes} دقيقة</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  playClickSound();
                  setSleepTimerMinutes(mins);
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  sleepTimerMinutes === mins
                    ? 'bg-amber-400 text-amber-950 border-amber-300 font-extrabold shadow'
                    : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                }`}
              >
                {mins} د
              </button>
            ))}
          </div>
        </div>

        {/* Play/Pause Button */}
        <div className="pt-2 flex items-center justify-center">
          <button
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-purple-900/60 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-[-1px]" />}
          </button>
        </div>
      </div>
    </div>
  );
};
