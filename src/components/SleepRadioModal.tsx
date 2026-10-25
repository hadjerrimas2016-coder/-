import React, { useState, useEffect, useRef } from 'react';
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
  SkipBack,
  SkipForward,
  ListMusic,
  Check,
  Headphones,
  Sliders
} from 'lucide-react';
import { playClickSound, playSparkleSound, speakArabicSpeech, stopArabicSpeech } from '../utils/audio';
import { SLEEP_TRACKS, SleepTrack, sleepAudioEngine } from '../utils/sleepAudio';

interface SleepRadioModalProps {
  mode: AppMode;
  onClose: () => void;
}

export const SleepRadioModal: React.FC<SleepRadioModalProps> = ({ mode, onClose }) => {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(30);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30 * 60);
  const [showTrackPicker, setShowTrackPicker] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentProgressSec, setCurrentProgressSec] = useState<number>(332); // 05:32 matching Screenshot 2
  const [enableVoiceStory, setEnableVoiceStory] = useState<boolean>(true);

  const currentTrack: SleepTrack = SLEEP_TRACKS[selectedTrackIndex] || SLEEP_TRACKS[0];

  // Start sleep audio on mount or when track changes
  useEffect(() => {
    if (isPlaying) {
      sleepAudioEngine.playTrack(currentTrack.id);
      sleepAudioEngine.setVolume(isMuted ? 0 : volume);

      if (enableVoiceStory) {
        speakArabicSpeech(
          `أهلاً بك في راديو نوم رائد.. استمع إلى ${currentTrack.title}.. تنفس بهدوء ودع جفونك ترتاح بسلام في واحة الأحلام الساحرة.. أحلاماً هانئة وسعيدة.`
        );
      }
    }

    return () => {
      sleepAudioEngine.stop();
      stopArabicSpeech();
    };
  }, [selectedTrackIndex]);

  // Volume synchronization
  useEffect(() => {
    sleepAudioEngine.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Progress timer & Auto shutoff timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Advance progress
      setCurrentProgressSec((prev) => {
        if (prev >= currentTrack.durationSec) return 0;
        return prev + 1;
      });

      // Count down sleep timer
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          sleepAudioEngine.stop();
          stopArabicSpeech();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.durationSec]);

  // Handle Play/Pause toggle
  const handleTogglePlay = () => {
    playClickSound();
    if (isPlaying) {
      setIsPlaying(false);
      sleepAudioEngine.stop();
      stopArabicSpeech();
    } else {
      setIsPlaying(true);
      sleepAudioEngine.playTrack(currentTrack.id);
      sleepAudioEngine.setVolume(isMuted ? 0 : volume);
      if (enableVoiceStory) {
        speakArabicSpeech(
          `نواصل الاسترخاء مع ${currentTrack.title}.. استمتع بالهدوء التام والراحة.`
        );
      }
    }
  };

  // Next and Previous Track Handlers
  const handleNextTrack = () => {
    playClickSound();
    setSelectedTrackIndex((prev) => (prev + 1) % SLEEP_TRACKS.length);
    setCurrentProgressSec(0);
  };

  const handlePrevTrack = () => {
    playClickSound();
    setSelectedTrackIndex((prev) => (prev - 1 + SLEEP_TRACKS.length) % SLEEP_TRACKS.length);
    setCurrentProgressSec(0);
  };

  const handleSelectTrack = (idx: number) => {
    playSparkleSound();
    setSelectedTrackIndex(idx);
    setShowTrackPicker(false);
    setCurrentProgressSec(0);
    setIsPlaying(true);
  };

  const handleSetTimer = (mins: number) => {
    playClickSound();
    setSleepTimerMinutes(mins);
    setRemainingSeconds(mins * 60);
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-2xl bg-black/85 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-600/70 bg-gradient-to-b from-[#180f38] via-[#100a2b] to-[#080517] text-white my-auto p-5 sm:p-6 space-y-5">
        {/* Top Header Bar matching Screenshot 2 */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-xl shadow">
              🌙
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
                  راديو رائد 📻
                </span>
                <span className="text-[11px] text-purple-300 font-bold">قبل النوم</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                قصص هادئة وموسيقى مريحة
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTrackPicker(!showTrackPicker)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                showTrackPicker
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                  : 'bg-white/10 hover:bg-white/20 text-purple-200 border-white/15'
              }`}
              title="اختر موسيقى النوم"
            >
              <ListMusic className="w-4 h-4" />
              <span className="hidden sm:inline">اختر الموسيقى</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                sleepAudioEngine.stop();
                stopArabicSpeech();
                onClose();
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Track Picker Drawer / Overlay */}
        {showTrackPicker ? (
          <div className="p-4 rounded-3xl bg-black/50 border border-purple-500/40 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-amber-400" />
                <span>اختر ألحان وموسيقى النوم المفضلة:</span>
              </span>
              <span className="text-[10px] text-purple-300">{SLEEP_TRACKS.length} ألحان هادئة</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
              {SLEEP_TRACKS.map((track, idx) => {
                const isSelected = selectedTrackIndex === idx;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-700/60 to-indigo-700/60 border-amber-400 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center text-lg flex-shrink-0">
                        {track.icon}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-white truncate">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-purple-300/80 truncate">{track.genre}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSelected ? (
                        <span className="p-1.5 rounded-full bg-amber-400 text-amber-950">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-2 py-1 rounded-lg bg-white/10 text-[10px] font-bold text-amber-300 hover:bg-white/20"
                        >
                          تشغيل
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Main Player Display matching Screenshot 2 */
          <div className="space-y-4">
            {/* Center Circular Artwork with Moon and sleeping Raed & Fox */}
            <div className="relative flex flex-col items-center justify-center py-2">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2 bg-gradient-to-b from-indigo-500/30 via-purple-600/20 to-black/60 border-2 border-purple-400/50 shadow-[0_0_50px_rgba(168,85,247,0.35)] flex items-center justify-center overflow-hidden">
                {/* Embedded Sleeping Raed and Fox Visual */}
                <img
                  src="/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png"
                  alt="نوم هادئ"
                  className="w-full h-full object-cover rounded-full opacity-85 filter brightness-95"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#100a2b] via-transparent to-transparent opacity-80" />

                {/* Glowing Crescent Moon in top corner */}
                <div className="absolute top-2 right-4 text-3xl animate-pulse">
                  🌙
                </div>
                <div className="absolute top-6 left-6 text-xl text-amber-300 animate-bounce">
                  ✨
                </div>

                {/* Sound wave ripple indicator */}
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full border-2 border-amber-300/30 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                )}
              </div>

              {/* Current Track Info */}
              <div className="text-center mt-3 space-y-1">
                <span className="px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-amber-300 text-[11px] font-black inline-flex items-center gap-1.5 shadow">
                  <span>{currentTrack.icon}</span>
                  <span>{currentTrack.title}</span>
                </span>
                <p className="text-[11px] text-purple-200/80 max-w-xs mx-auto leading-relaxed">
                  {currentTrack.subtitle}
                </p>
              </div>
            </div>

            {/* Scrub Slider (Matching 05:32 / 20:00 from Screenshot 2) */}
            <div className="space-y-1.5 px-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-purple-300">
                <span className="font-bold text-amber-300">{formatTime(currentProgressSec)}</span>
                <span>{formatTime(currentTrack.durationSec)}</span>
              </div>

              <div className="relative w-full">
                <input
                  type="range"
                  min={0}
                  max={currentTrack.durationSec}
                  value={currentProgressSec}
                  onChange={(e) => setCurrentProgressSec(parseInt(e.target.value, 10))}
                  className="w-full h-2 rounded-full appearance-none bg-purple-950 border border-purple-700/50 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Playback Controls (Previous / Play / Next) */}
            <div className="flex items-center justify-center gap-6 pt-1">
              <button
                onClick={handlePrevTrack}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 flex items-center justify-center transition-all cursor-pointer border border-white/10"
                title="المقطوعة السابقة"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9c27b0] via-[#673ab7] to-[#e91e63] text-white flex items-center justify-center shadow-xl shadow-purple-900/70 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/30"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current translate-x-[-2px]" />
                )}
              </button>

              <button
                onClick={handleNextTrack}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 flex items-center justify-center transition-all cursor-pointer border border-white/10"
                title="المقطوعة التالية"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* Auto-off Timer Presets matching Screenshot 2 (15 د، 30 د، 45 د، 60 د) */}
        <div className="p-3 rounded-2xl bg-white/5 border border-purple-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-200">
            <span className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>مؤقت الإغلاق التلقائي:</span>
            </span>
            <span className="text-amber-300 font-mono text-[11px]">
              {isPlaying && remainingSeconds > 0
                ? `ينطفئ بعد: ${formatTime(remainingSeconds)}`
                : `${sleepTimerMinutes} دقيقة`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSetTimer(mins)}
                className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                  sleepTimerMinutes === mins
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md'
                    : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/15'
                }`}
              >
                {mins} د
              </button>
            ))}
          </div>
        </div>

        {/* Volume & Bedtime Story voice toggle */}
        <div className="flex items-center justify-between gap-3 text-xs pt-1 border-t border-white/10">
          <div className="flex items-center gap-2 flex-grow max-w-xs">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-300" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1.5 rounded-full appearance-none bg-purple-950 accent-amber-400 cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              playClickSound();
              const nextState = !enableVoiceStory;
              setEnableVoiceStory(nextState);
              if (!nextState) stopArabicSpeech();
            }}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              enableVoiceStory
                ? 'bg-amber-400 text-amber-950 border-amber-300 font-black'
                : 'bg-white/5 text-purple-300 border-white/10'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>حكاية صوتية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
