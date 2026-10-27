import React, { useState, useRef, useEffect } from 'react';
import {
  Star,
  BookOpen,
  Mic,
  Gamepad2,
  Crown,
  Sparkles,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Volume2
} from 'lucide-react';
import { AppMode, UserAudioRecording } from '../types';
import {
  playSparkleSound,
  playClickSound,
  playPopSound,
  playFanfareSound
} from '../utils/audio';
import confetti from 'canvas-confetti';

interface StarsRewardBannerProps {
  starsCount: number;
  mode: AppMode;
  onOpenReadingClub?: () => void;
  onOpenLibrary?: () => void;
  onOpenGames?: () => void;
  onEarnStars?: (amount: number) => void;
  onSaveUserRecording?: (recording: UserAudioRecording) => void;
  onOpenSubscription?: () => void;
}

export const StarsRewardBanner: React.FC<StarsRewardBannerProps> = ({
  starsCount,
  mode,
  onOpenReadingClub,
  onOpenLibrary,
  onOpenGames,
  onEarnStars,
  onSaveUserRecording,
  onOpenSubscription,
}) => {
  // Rank calculations
  const ranks = [
    { title: 'المستكشف المبتدئ 🌟', min: 0, max: 150 },
    { title: 'قارئ النجوم الواعد ⭐', min: 150, max: 350 },
    { title: 'حارس الحكايات الذهبية 💫', min: 350, max: 600 },
    { title: 'أمير المعرفة والبيان 👑', min: 600, max: 1000 },
    { title: 'أسطورة نادي القراءة 🏆', min: 1000, max: 9999 },
  ];

  const currentRank = ranks.find((r) => starsCount >= r.min && starsCount < r.max) || ranks[ranks.length - 1];
  const nextRank = ranks[ranks.indexOf(currentRank) + 1] || currentRank;
  const progressToNext = Math.min(
    100,
    Math.max(10, Math.round(((starsCount - currentRank.min) / (nextRank.max - currentRank.min)) * 100))
  );

  // Quick Voice Studio Modal State
  const [showVoiceStudio, setShowVoiceStudio] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState<boolean>(false);
  const [recordingError, setRecordingError] = useState<string>('');
  const [bannerToast, setBannerToast] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (msg: string) => {
    setBannerToast(msg);
    setTimeout(() => setBannerToast(''), 3500);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Handler 1: Go to Stories Library to Read Story (+20 Stars)
  const handleStoryReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    if (onOpenLibrary) {
      onOpenLibrary();
      showToast('انتقلت إلى مكتبة القصص! اقرأ قصة كاملة لكسب +20 نجمة ⭐');
    }
  };

  // Handler 2: Open Recording Studio & Start Recording (+40 Stars)
  const handleOpenVoiceRecorder = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setShowVoiceStudio(true);
    setRecordingError('');
  };

  // Handler 3: Go to Games Portal (+35 Stars)
  const handleGamesPortalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSparkleSound();
    if (onOpenGames) {
      onOpenGames();
      showToast('انتقلت إلى بوابة ألعاب التحدي! العب وتحدى ذكاءك لكسب +35 نجمة 🎮⭐');
    }
  };

  // Real Microphone Recording Logic
  const handleStartRecording = async () => {
    playSparkleSound();
    setRecordingError('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setRecordingError('الميكروفون غير مدعوم في هذا المتصفح.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setRecordedAudioUrl(null);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setRecordingError('يرجى السماح بصلاحية الميكروفون لتسجيل صوتك الجميل.');
    }
  };

  const handleStopRecording = () => {
    playPopSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTogglePlayRecorded = () => {
    if (!recordedAudioUrl) return;

    if (!audioPlayerRef.current || audioPlayerRef.current.src !== recordedAudioUrl) {
      audioPlayerRef.current = new Audio(recordedAudioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingRecorded(false);
    }

    if (isPlayingRecorded) {
      audioPlayerRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      audioPlayerRef.current.play().catch(() => {});
      setIsPlayingRecorded(true);
    }
  };

  const handleSaveAndEarnStars = () => {
    if (!recordedAudioUrl) return;
    playFanfareSound();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    // Save recording
    const recId = `rec-${Date.now()}`;
    const newRec: UserAudioRecording = {
      id: recId,
      title: `تسجيل بصوت رائد البطل (${new Date().toLocaleDateString('ar-SA')})`,
      audioBlobUrl: recordedAudioUrl,
      audioUrl: recordedAudioUrl,
      durationSec: recordingSeconds || 10,
      createdAt: new Date().toLocaleDateString('ar-SA'),
      scorePoints: 40,
    };

    if (onSaveUserRecording) {
      onSaveUserRecording(newRec);
    }

    if (onEarnStars) {
      onEarnStars(40);
    }

    showToast('✨ رائع جداً! تم حفظ تسجيلك بنجاح وكسبت +40 نجمة خيال ⭐!');
    setTimeout(() => {
      setShowVoiceStudio(false);
      setRecordedAudioUrl(null);
      setRecordingSeconds(0);
    }, 1500);
  };

  return (
    <>
      <div
        className={`relative rounded-3xl p-4 sm:p-5 border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
          mode === 'day'
            ? 'bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-50 border-amber-300/80 text-amber-950'
            : 'bg-gradient-to-r from-[#211403] via-[#1a0f02] to-[#120a01] border-amber-500/60 text-white shadow-[0_0_30px_rgba(245,158,11,0.2)]'
        }`}
      >
        {/* Right Side: Rank and Stars */}
        <div className="flex items-center gap-3.5 text-center md:text-right">
          <div
            onClick={playSparkleSound}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-400/40 animate-pulse cursor-pointer hover:scale-105 transition-transform"
          >
            ⭐
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                نظام مكافآت النجوم
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {currentRank.title}
              </span>
              {onOpenSubscription && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSparkleSound();
                    onOpenSubscription();
                  }}
                  className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 hover:bg-yellow-300 text-amber-950 flex items-center gap-1 shadow cursor-pointer transition-transform hover:scale-105"
                  title="خطط الترقية والاشتراك (حسابك مجاني)"
                >
                  <Crown className="w-2.5 h-2.5 fill-current" />
                  <span>الاشتراك 👑</span>
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono">
                {starsCount}
              </span>
              <span className="text-xs font-bold text-amber-200">نجمة خيال مكتسبة</span>
            </div>
          </div>
        </div>

        {/* Middle: Progress Bar */}
        <div className="w-full max-w-xs space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-amber-300/90">
            <span>الرتبة القادمة: {nextRank.title}</span>
            <span>{starsCount} / {nextRank.max} ⭐</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden p-0.5 border border-amber-400/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 transition-all duration-700 shadow-md"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>

        {/* Left: Interactive Star Reward Action Buttons (قراءة قصة / تسجيل صوتك / ألعاب التحدي) */}
        <div className="flex items-center gap-2 flex-wrap justify-center text-[11px] font-bold">
          {/* Button 1: Read a story -> Go to Library */}
          <button
            type="button"
            onClick={handleStoryReadClick}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-amber-400 hover:text-amber-950 border border-white/20 hover:border-amber-400 text-amber-300 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm group"
            title="انقر للانتقال إلى مكتبة القصص وقراءة قصة لكسب +20 نجمة ⭐"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-950 transition-colors" />
            <span>قراءة قصة: +20 ⭐</span>
          </button>

          {/* Button 2: Record Voice -> Live Mic Recording Studio */}
          <button
            type="button"
            onClick={handleOpenVoiceRecorder}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse ring-2 ring-rose-400/50'
                : 'bg-pink-900/40 hover:bg-pink-600 hover:text-white border-pink-400/40 text-pink-200'
            }`}
            title="انقر لبدء تسجيل صوتك فورياً ونيل +40 نجمة خيال 🎙️⭐"
          >
            <Mic className={`w-3.5 h-3.5 ${isRecording ? 'animate-bounce text-white' : 'text-pink-400'}`} />
            <span>{isRecording ? `تسجيل نشط (${recordingSeconds}ث)` : 'تسجيل صوتك: +40 ⭐'}</span>
          </button>

          {/* Button 3: Challenge Games -> Go to Games Portal */}
          <button
            type="button"
            onClick={handleGamesPortalClick}
            className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-600 hover:text-white border border-purple-400/40 text-purple-200 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm group"
            title="انقر للانتقال إلى بوابة ألعاب التحدي وكسب +35 نجمة 🎮⭐"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-purple-300 group-hover:text-white transition-colors" />
            <span>ألعاب التحدي: +35 ⭐</span>
          </button>
        </div>
      </div>

      {/* Banner Feedback Toast */}
      {bannerToast && (
        <div className="w-full max-w-xl mx-auto -mt-3 mb-2 p-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs text-center shadow-lg animate-bounce flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{bannerToast}</span>
        </div>
      )}

      {/* LIVE QUICK VOICE RECORDING STUDIO MODAL */}
      {showVoiceStudio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
          dir="rtl"
        >
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#2a0e3a] via-[#1a0827] to-[#11041c] border-2 border-pink-500 text-white rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-md">
                  <Mic className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-pink-300">
                    استوديو تسجيل صوتك الفوري 🎙️✨
                  </h4>
                  <p className="text-[11px] text-purple-200">
                    سجّل صوتك وأنت تقرأ أو تردد حكمة لكسب <strong className="text-amber-300">+40 نجمة</strong>!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  handleStopRecording();
                  setShowVoiceStudio(false);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {recordingError && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs text-center font-bold">
                {recordingError}
              </div>
            )}

            {/* Central Recording Visualizer Area */}
            <div className="p-6 rounded-3xl bg-black/40 border border-purple-500/30 text-center space-y-4">
              {/* Pulsing Visual Waveform / Mic Icon */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-rose-500/40 animate-pulse" />
                  </>
                )}
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                    isRecording
                      ? 'bg-rose-600 text-white scale-110 shadow-rose-600/50 ring-4 ring-rose-400/50'
                      : recordedAudioUrl
                      ? 'bg-emerald-600 text-white shadow-emerald-600/40'
                      : 'bg-purple-800 text-purple-200'
                  }`}
                >
                  <Mic className="w-9 h-9" />
                </div>
              </div>

              {/* Status & Timer */}
              <div>
                {isRecording ? (
                  <div className="space-y-1">
                    <span className="text-xs font-black text-rose-300 flex items-center justify-center gap-1.5 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>جارٍ تسجيل صوتك الآن...</span>
                    </span>
                    <span className="text-2xl font-black font-mono text-white">
                      00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                    </span>
                  </div>
                ) : recordedAudioUrl ? (
                  <div className="space-y-1">
                    <span className="text-xs font-black text-emerald-300 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم تسجيل صوتك بنجاح! ({recordingSeconds} ثانية)</span>
                    </span>
                    <p className="text-[11px] text-purple-200">
                      استمع إلى تسجيلك أو اضغط حفظ لكسب الـ 40 نجمة ⭐
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-xs font-black text-amber-300">
                      الميكروفون جاهز لتسجيل صوتك
                    </span>
                    <p className="text-[11px] text-purple-300">
                      اضغط على زر التسجيل أدناه وابدأ بالقراءة بصوتك العذب!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {!isRecording && !recordedAudioUrl && (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 cursor-pointer active:scale-95 transition-all"
                >
                  <Mic className="w-5 h-5" />
                  <span>ابدأ التسجيل الآن بصوتك 🎙️</span>
                </button>
              )}

              {isRecording && (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-900/50 cursor-pointer animate-pulse active:scale-95 transition-all"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>إنهاء وحفظ التسجيل ⏹️</span>
                </button>
              )}

              {recordedAudioUrl && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlayRecorded}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    {isPlayingRecorded ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlayingRecorded ? 'إيقاف الاستماع' : 'استمع لتسجيلك 🎧'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-purple-200 transition-all cursor-pointer"
                    title="إعادة التسجيل من جديد"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndEarnStars}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/40 hover:brightness-110 cursor-pointer active:scale-95 transition-all"
                  >
                    <Star className="w-4 h-4 fill-current text-amber-950" />
                    <span>حفظ وكسب +40 نجمة ⭐</span>
                  </button>
                </div>
              )}

              {onOpenReadingClub && (
                <button
                  type="button"
                  onClick={() => {
                    setShowVoiceStudio(false);
                    onOpenReadingClub();
                  }}
                  className="w-full text-center text-[11px] text-purple-300 hover:text-amber-300 underline pt-1 cursor-pointer"
                >
                  الانتقال إلى نادي القراءة الكامل واستكشاف تسجيلات الأصدقاء 🎧
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
