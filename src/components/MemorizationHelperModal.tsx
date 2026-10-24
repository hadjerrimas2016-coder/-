import React, { useState } from 'react';
import { AppMode } from '../types';
import {
  Mic,
  Volume2,
  X,
  CheckCircle2,
  Sparkles,
  Trophy,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playCorrectSound,
  playSparkleSound,
  playFanfareSound,
  playClickSound,
  speakArabicSpeech,
  stopArabicSpeech
} from '../utils/audio';

interface MemorizationHelperModalProps {
  mode: AppMode;
  onClose: () => void;
  onEarnStars: (amount: number) => void;
}

const MEMORIZE_LESSONS = [
  {
    id: '1',
    title: 'أنشودة الحروف والأمل',
    lines: [
      'ألفٌ أملٌ.. باءٌ بدرُ',
      'تاءٌ تاجٌ.. ثاءٌ ثمرُ',
      'جيمٌ جسرٌ نحو النورِ',
      'بالعلمِ نحققُ كل سرورِ',
    ],
  },
  {
    id: '2',
    title: 'حكمة الأمير الصغير في الصداقة',
    lines: [
      'الأشياءُ الأجملُ في الكونِ',
      'لا تُرى بالعينِ بل تُحسُّ بالقلبِ',
      'والصداقةُ كنزٌ غالٍ يدومُ',
      'بالمحبةِ والوفاءِ والصدقِ',
    ],
  },
  {
    id: '3',
    title: 'أنشودة رواد الفضاء',
    lines: [
      'نحنُ روادُ الفضاءِ الصغارِ',
      'نصعدُ بالهمةِ نحو المدارِ',
      'المريخُ كوكبنا الجارُ',
      'والعلمُ سلاحُ الشطارِ',
    ],
  },
];

export const MemorizationHelperModal: React.FC<MemorizationHelperModalProps> = ({
  mode,
  onClose,
  onEarnStars,
}) => {
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const currentLesson = MEMORIZE_LESSONS[selectedLessonIdx];
  const [currentLineIdx, setCurrentLineIdx] = useState<number>(0);
  const [hideWords, setHideWords] = useState<boolean>(false);
  const [completedLines, setCompletedLines] = useState<{ [idx: number]: boolean }>({});
  const [isDone, setIsDone] = useState<boolean>(false);

  const handleListenLine = (line: string) => {
    speakArabicSpeech(line);
  };

  const handleVerifyLine = (idx: number) => {
    playCorrectSound();
    const updated = { ...completedLines, [idx]: true };
    setCompletedLines(updated);

    if (idx < currentLesson.lines.length - 1) {
      setCurrentLineIdx(idx + 1);
    } else {
      setIsDone(true);
      playFanfareSound();
      onEarnStars(20);
      confetti({ particleCount: 70, spread: 70 });
    }
  };

  const handleReset = () => {
    playClickSound();
    setCompletedLines({});
    setCurrentLineIdx(0);
    setIsDone(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/75 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-teal-500/60 bg-gradient-to-b from-[#0f282a] via-[#091b1c] to-[#050e0f] text-white p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-teal-800/40 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-teal-500/20 text-teal-300">
              <Mic className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h3 className="font-black text-lg sm:text-xl flex items-center gap-1.5">
                <span>ساعدني على الحفظ - المصحح التلقائي</span>
                <Sparkles className="w-4 h-4 text-teal-300" />
              </h3>
              <p className="text-xs text-teal-200/80">استمع وردد سطرًا بسطر وتأكد من حفظك!</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopArabicSpeech();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lesson selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {MEMORIZE_LESSONS.map((ls, idx) => (
            <button
              key={ls.id}
              onClick={() => {
                playClickSound();
                setSelectedLessonIdx(idx);
                setCompletedLines({});
                setCurrentLineIdx(0);
                setIsDone(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedLessonIdx === idx
                  ? 'bg-teal-500 text-teal-950 font-black shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-teal-200'
              }`}
            >
              {ls.title}
            </button>
          ))}
        </div>

        {/* Hide words toggle for memory test */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-950/40 border border-teal-800/40">
          <span className="text-xs font-bold text-teal-300">وضع اختبار الحفظ (إخفاء الكلمات):</span>
          <button
            onClick={() => {
              playClickSound();
              setHideWords(!hideWords);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-600/30 text-teal-200 hover:bg-teal-600/50 text-xs font-bold"
          >
            {hideWords ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hideWords ? 'إظهار الكلمات' : 'إخفاء للاختبار'}</span>
          </button>
        </div>

        {/* Lines recital list */}
        <div className="space-y-3">
          {currentLesson.lines.map((line, idx) => {
            const isCompleted = completedLines[idx];
            const isCurrent = currentLineIdx === idx;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-teal-950/60 border-teal-400 text-teal-200'
                    : isCurrent
                    ? 'bg-teal-900/40 border-amber-400 shadow-md ring-1 ring-amber-400'
                    : 'bg-white/5 border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>

                  <p className="text-base font-bold">
                    {hideWords && !isCompleted ? '•••••••• ••••••••' : line}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleListenLine(line)}
                    className="p-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 transition-all active:scale-90"
                    title="استمع للسطر"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleVerifyLine(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم الحفظ</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>حفظتُ هذا!</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Celebration Banner when completed */}
        {isDone && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center font-black space-y-1 shadow-lg animate-bounce">
            <Trophy className="w-8 h-8 text-yellow-300 mx-auto" />
            <h4 className="text-lg">أحسنت يا بطل رائد!</h4>
            <p className="text-xs">لقد حفظت النشيد بالكامل وحصلت على +20 نجمة ⭐</p>
            <button
              onClick={handleReset}
              className="mt-2 px-4 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة التدريب</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
