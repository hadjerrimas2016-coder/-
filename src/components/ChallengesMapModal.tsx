import React from 'react';
import { AppMode } from '../types';
import { X, Trophy, CheckCircle2, Lock, Sparkles, MapPin, ChevronLeft } from 'lucide-react';
import { playClickSound, playSparkleSound } from '../utils/audio';

interface ChallengesMapModalProps {
  mode: AppMode;
  onClose: () => void;
  onSelectStoryById: (id: string) => void;
}

export const ChallengesMapModal: React.FC<ChallengesMapModalProps> = ({
  mode,
  onClose,
  onSelectStoryById,
}) => {
  const questStages = [
    {
      id: 'raed-mars',
      name: 'محطة المريخ الأحمر',
      lore: 'انطلق مع رائد وثعلبه لكشف أسرار التربة البركانية',
      status: 'completed',
      starsReward: 50,
      icon: '🪐',
      color: 'from-orange-500 to-amber-600',
    },
    {
      id: 'little-prince',
      name: 'جزيرة الزهرة الحالمة',
      lore: 'تعلم أسرار الصداقة الحقيقية مع الأمير الصغير',
      status: 'completed',
      starsReward: 40,
      icon: '🌹',
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'shahrazad-young',
      name: 'قصر شهرزاد البنفسجي',
      lore: 'استمع لحكايات ألف ليلة وليلة وسحر البنفسج',
      status: 'current',
      starsReward: 60,
      icon: '🕌',
      color: 'from-purple-600 to-indigo-700',
    },
    {
      id: 'loundja-algeria',
      name: 'واحة لونجة والتراث الجزائري',
      lore: 'اكتشف سر عين الماء العذبة في واحات الصحراء',
      status: 'available',
      starsReward: 45,
      icon: '🌴',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'crystal-gardens',
      name: 'حدائق البلور والينابيع',
      lore: 'اجمع بلورات الصدق في عالم ألف ليلة وليلة',
      status: 'locked',
      starsReward: 70,
      icon: '💎',
      color: 'from-cyan-600 to-blue-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/70 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-purple-800 bg-gradient-to-b from-[#18113b] via-[#100d2b] to-[#080517] text-white p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-400/20 text-yellow-300">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-lg sm:text-xl flex items-center gap-1.5">
                <span>خريطة تحديات رائد 🎯</span>
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              </h3>
              <p className="text-xs text-purple-300/80">اعبر المحطات واجمع نقاط الخيال والأوسمة!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trail / Stages List */}
        <div className="space-y-3 relative before:absolute before:top-4 before:bottom-4 before:right-6 before:w-1 before:bg-gradient-to-b before:from-amber-400 before:via-purple-500 before:to-gray-700">
          {questStages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isLocked = stage.status === 'locked';

            return (
              <div
                key={stage.id}
                onClick={() => {
                  if (!isLocked) {
                    playSparkleSound();
                    onSelectStoryById(stage.id);
                    onClose();
                  }
                }}
                className={`relative pr-12 p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isLocked
                    ? 'opacity-50 bg-black/20 border-white/10 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-purple-900/40 border-amber-400 shadow-lg ring-2 ring-amber-400/40 cursor-pointer hover:scale-[1.02]'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/40 cursor-pointer hover:bg-emerald-950/50'
                    : 'bg-white/5 border-white/10 cursor-pointer hover:bg-white/10'
                }`}
              >
                {/* Node pin indicator on trail line */}
                <div
                  className={`absolute right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 border-white text-white'
                      : isCurrent
                      ? 'bg-amber-400 border-white text-amber-950 animate-ping'
                      : 'bg-slate-700 border-slate-500 text-slate-300'
                  }`}
                />

                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stage.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}
                  >
                    {stage.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                        {stage.name}
                      </h4>
                      {isCompleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> تم الإنجاز
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black">
                          المحطة الحالية ⭐
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-purple-200/70 mt-0.5 line-clamp-1">{stage.lore}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-amber-300">
                    +{stage.starsReward} ⭐
                  </span>
                  {!isLocked ? (
                    <ChevronLeft className="w-4 h-4 text-purple-300" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
