import React, { useState } from 'react';
import { AppMode, ShapePuzzleTemplate, ShapeItem } from '../types';
import {
  Shapes,
  Trophy,
  RotateCw,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  HelpCircle,
  Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playPopSound,
  playSparkleSound,
  playFanfareSound,
  playClickSound,
  playCorrectSound
} from '../utils/audio';

interface ShapeBuilderProps {
  mode: AppMode;
  onEarnStars: (amount: number) => void;
}

// Built-in puzzles
const PUZZLE_TEMPLATES: ShapePuzzleTemplate[] = [
  {
    id: 'rocket',
    name: 'صاروخ رائد الفضائي',
    difficulty: 'سهل',
    previewIcon: '🚀',
    description: 'ركّب أجزاء الصاروخ الفضي لينطلق نحو كواكب الفضاء البعيدة!',
    targets: [
      { id: 't1', type: 'triangle', x: 50, y: 18, width: 80, height: 70, rotation: 0, colorHint: '#ef4444' }, // Nose cone
      { id: 't2', type: 'rectangle', x: 50, y: 50, width: 80, height: 120, rotation: 0, colorHint: '#3b82f6' }, // Body
      { id: 't3', type: 'circle', x: 50, y: 44, width: 44, height: 44, rotation: 0, colorHint: '#38bdf8' }, // Window
      { id: 't4', type: 'triangle', x: 26, y: 68, width: 50, height: 60, rotation: -45, colorHint: '#f59e0b' }, // Left fin
      { id: 't5', type: 'triangle', x: 74, y: 68, width: 50, height: 60, rotation: 45, colorHint: '#f59e0b' }, // Right fin
      { id: 't6', type: 'triangle', x: 50, y: 84, width: 60, height: 50, rotation: 180, colorHint: '#ec4899' }, // Booster flame
    ],
  },
  {
    id: 'house',
    name: 'بيت الأحلام الملون',
    difficulty: 'سهل',
    previewIcon: '🏡',
    description: 'ركّب الجدران والسقف والأبواب لبناء بيت جميل!',
    targets: [
      { id: 'h1', type: 'square', x: 50, y: 60, width: 140, height: 140, rotation: 0, colorHint: '#f97316' }, // Base
      { id: 'h2', type: 'triangle', x: 50, y: 22, width: 160, height: 80, rotation: 0, colorHint: '#ef4444' }, // Roof
      { id: 'h3', type: 'rectangle', x: 50, y: 72, width: 40, height: 70, rotation: 0, colorHint: '#8b5cf6' }, // Door
      { id: 'h4', type: 'square', x: 28, y: 52, width: 36, height: 36, rotation: 0, colorHint: '#38bdf8' }, // Left window
      { id: 'h5', type: 'square', x: 72, y: 52, width: 36, height: 36, rotation: 0, colorHint: '#38bdf8' }, // Right window
      { id: 'h6', type: 'rectangle', x: 70, y: 15, width: 24, height: 44, rotation: 0, colorHint: '#78350f' }, // Chimney
    ],
  },
  {
    id: 'boat',
    name: 'سفينة البحار الشراعية',
    difficulty: 'متوسط',
    previewIcon: '⛵',
    description: 'اصنع قاربًا شراعيًا يمخر عباب الأمواج الزرقاء!',
    targets: [
      { id: 'b1', type: 'semicircle', x: 50, y: 75, width: 180, height: 70, rotation: 180, colorHint: '#0284c7' }, // Hull
      { id: 'b2', type: 'rectangle', x: 50, y: 44, width: 14, height: 110, rotation: 0, colorHint: '#78350f' }, // Mast
      { id: 'b3', type: 'triangle', x: 33, y: 42, width: 70, height: 90, rotation: 0, colorHint: '#ffffff' }, // Left Sail
      { id: 'b4', type: 'triangle', x: 67, y: 45, width: 60, height: 80, rotation: 40, colorHint: '#fde047' }, // Right Sail
      { id: 'b5', type: 'triangle', x: 50, y: 14, width: 30, height: 20, rotation: 90, colorHint: '#ef4444' }, // Flag
    ],
  },
  {
    id: 'fish',
    name: 'السمكة الذهبية السعيدة',
    difficulty: 'سهل',
    previewIcon: '🐠',
    description: 'ركّب جسم السمكة وزعانفها لتسبح في البحيرة!',
    targets: [
      { id: 'f1', type: 'diamond', x: 45, y: 50, width: 140, height: 110, rotation: 0, colorHint: '#f59e0b' }, // Body
      { id: 'f2', type: 'triangle', x: 80, y: 50, width: 70, height: 80, rotation: 90, colorHint: '#f97316' }, // Tail
      { id: 'f3', type: 'triangle', x: 45, y: 22, width: 50, height: 40, rotation: 0, colorHint: '#ec4899' }, // Top Fin
      { id: 'f4', type: 'triangle', x: 45, y: 78, width: 50, height: 40, rotation: 180, colorHint: '#ec4899' }, // Bottom Fin
      { id: 'f5', type: 'circle', x: 26, y: 46, width: 22, height: 22, rotation: 0, colorHint: '#1e293b' }, // Eye
    ],
  },
];

export const ShapeBuilder: React.FC<ShapeBuilderProps> = ({ mode, onEarnStars }) => {
  const [activeTab, setActiveTab] = useState<'puzzle' | 'free'>('puzzle');
  const [selectedPuzzleIdx, setSelectedPuzzleIdx] = useState<number>(0);
  const currentPuzzle = PUZZLE_TEMPLATES[selectedPuzzleIdx];

  // Placed targets in current puzzle
  const [placedTargets, setPlacedTargets] = useState<{ [targetId: string]: boolean }>({});
  const [completedPuzzles, setCompletedPuzzles] = useState<{ [id: string]: boolean }>({});

  // Freeform canvas state
  const [freeShapes, setFreeShapes] = useState<ShapeItem[]>([
    { id: '1', type: 'triangle', color: '#ef4444', label: 'مثلث', width: 80, height: 70, rotation: 0, x: 120, y: 90 },
    { id: '2', type: 'square', color: '#3b82f6', label: 'مربع', width: 80, height: 80, rotation: 0, x: 230, y: 90 },
    { id: '3', type: 'circle', color: '#facc15', label: 'دائرة', width: 80, height: 80, rotation: 0, x: 340, y: 90 },
  ]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const availableColors = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Handle puzzle slot matching
  const handleSnapPiece = (targetId: string) => {
    if (placedTargets[targetId]) return;

    playCorrectSound();
    const updated = { ...placedTargets, [targetId]: true };
    setPlacedTargets(updated);

    // Check if puzzle is fully completed!
    const allPlaced = currentPuzzle.targets.every((t) => updated[t.id]);
    if (allPlaced) {
      playFanfareSound();
      setCompletedPuzzles((prev) => ({ ...prev, [currentPuzzle.id]: true }));
      onEarnStars(20);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleResetPuzzle = () => {
    playPopSound();
    setPlacedTargets({});
  };

  // Freeform builder actions
  const addFreeShape = (type: ShapeItem['type'], color: string) => {
    playPopSound();
    const newShape: ShapeItem = {
      id: Date.now().toString(),
      type,
      color,
      label: type,
      width: 75,
      height: 75,
      rotation: 0,
      x: 100 + Math.random() * 150,
      y: 80 + Math.random() * 150,
    };
    setFreeShapes((prev) => [...prev, newShape]);
    setSelectedShapeId(newShape.id);
  };

  const handleRotateSelected = () => {
    if (!selectedShapeId) return;
    playClickSound();
    setFreeShapes((prev) =>
      prev.map((s) => (s.id === selectedShapeId ? { ...s, rotation: ((s.rotation || 0) + 45) % 360 } : s))
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedShapeId) return;
    playPopSound();
    setFreeShapes((prev) => prev.filter((s) => s.id !== selectedShapeId));
    setSelectedShapeId(null);
  };

  const handleChangeSelectedColor = (color: string) => {
    if (!selectedShapeId) return;
    playSparkleSound();
    setFreeShapes((prev) =>
      prev.map((s) => (s.id === selectedShapeId ? { ...s, color } : s))
    );
  };

  const renderShapeSvg = (type: ShapeItem['type'], color: string, w: number, h: number) => {
    switch (type) {
      case 'circle':
        return (
          <svg width={w} height={h} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill={color} />
          </svg>
        );
      case 'square':
        return (
          <svg width={w} height={h} viewBox="0 0 100 100">
            <rect x="4" y="4" width="92" height="92" rx="8" fill={color} />
          </svg>
        );
      case 'rectangle':
        return (
          <svg width={w} height={h} viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="96" rx="6" fill={color} />
          </svg>
        );
      case 'triangle':
        return (
          <svg width={w} height={h} viewBox="0 0 100 100">
            <polygon points="50,4 96,96 4,96" fill={color} />
          </svg>
        );
      case 'semicircle':
        return (
          <svg width={w} height={h} viewBox="0 0 100 50">
            <path d="M4,48 A46,46 0 0,1 96,48 Z" fill={color} />
          </svg>
        );
      case 'diamond':
        return (
          <svg width={w} height={h} viewBox="0 0 100 100">
            <polygon points="50,4 96,50 50,96 4,50" fill={color} />
          </svg>
        );
      case 'star':
        return (
          <svg width={w} height={h} viewBox="0 0 100 100">
            <polygon
              points="50,4 64,36 98,36 71,58 82,92 50,70 18,92 29,58 2,36 36,36"
              fill={color}
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const isCurrentPuzzleDone = currentPuzzle.targets.every((t) => placedTargets[t.id]);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 ${
          mode === 'day'
            ? 'bg-gradient-to-r from-yellow-100 via-amber-50 to-orange-100 border-amber-200'
            : 'bg-gradient-to-r from-purple-950 via-indigo-950 to-blue-950 border-purple-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md text-2xl">
            🧩
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">ركن تركيب الأشكال الهندسية</h2>
            <p className="text-xs sm:text-sm opacity-80 font-medium">
              جمّع المثلثات والمربعات والدوائر لصناعة الصواريخ والبيوت والحيوانات!
            </p>
          </div>
        </div>

        {/* Tab switch between Puzzle Mode & Free Construction */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/30 dark:bg-black/30 border border-white/20">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('puzzle');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'puzzle'
                ? 'bg-purple-600 text-white shadow-md'
                : 'hover:bg-white/20'
            }`}
          >
            بناء النماذج 🚀
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('free');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'free'
                ? 'bg-purple-600 text-white shadow-md'
                : 'hover:bg-white/20'
            }`}
          >
            التركيب الحر 🎨
          </button>
        </div>
      </div>

      {activeTab === 'puzzle' ? (
        /* PUZZLE SOLVING MODE */
        <div className="space-y-4">
          {/* Puzzle selector pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {PUZZLE_TEMPLATES.map((pzl, idx) => {
              const isSelected = selectedPuzzleIdx === idx;
              const isDone = completedPuzzles[pzl.id];
              return (
                <button
                  key={pzl.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedPuzzleIdx(idx);
                    setPlacedTargets({});
                  }}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 border-amber-300 shadow-md scale-102'
                      : mode === 'day'
                      ? 'bg-white/80 border-sky-100 hover:bg-white'
                      : 'bg-indigo-950/70 border-purple-800 hover:bg-indigo-900/60'
                  }`}
                >
                  <span className="text-xl">{pzl.previewIcon}</span>
                  <span>{pzl.name}</span>
                  {isDone && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                </button>
              );
            })}
          </div>

          {/* Puzzle Board Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* The Silhouette Assembly Canvas (2 cols) */}
            <div
              className={`lg:col-span-2 relative h-[380px] sm:h-[430px] rounded-3xl border-4 p-4 shadow-xl overflow-hidden flex items-center justify-center transition-all ${
                mode === 'day'
                  ? 'bg-gradient-to-b from-sky-50 to-indigo-50/50 border-amber-300/80'
                  : 'bg-gradient-to-b from-[#141030] to-[#0a071c] border-purple-700/80'
              }`}
            >
              {/* Completed Fanfare Banner */}
              {isCurrentPuzzleDone && (
                <div className="absolute top-4 inset-x-4 z-20 p-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold text-sm sm:text-base flex items-center justify-between shadow-xl animate-bounce">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                    <span>أحسنت يا بطل رائد! لقد أكملت الشكل بنجاح (+20 ⭐)</span>
                  </div>
                  <button
                    onClick={handleResetPuzzle}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة</span>
                  </button>
                </div>
              )}

              {/* Silhouette outline targets container */}
              <div className="relative w-full max-w-[340px] h-[340px]">
                {currentPuzzle.targets.map((tgt) => {
                  const isPlaced = placedTargets[tgt.id];
                  return (
                    <div
                      key={tgt.id}
                      onClick={() => handleSnapPiece(tgt.id)}
                      style={{
                        position: 'absolute',
                        left: `${tgt.x}%`,
                        top: `${tgt.y}%`,
                        transform: `translate(-50%, -50%) rotate(${tgt.rotation}deg)`,
                        width: `${tgt.width}px`,
                        height: `${tgt.height}px`,
                      }}
                      className={`cursor-pointer transition-all duration-300 flex items-center justify-center ${
                        isPlaced
                          ? 'scale-100 filter drop-shadow-md'
                          : 'scale-95 border-2 border-dashed border-purple-400/60 hover:border-amber-400 hover:scale-105 bg-white/10 dark:bg-white/5'
                      }`}
                      title={isPlaced ? 'مكتمل' : 'اضغط لتركيب هذا الجزء'}
                    >
                      {isPlaced ? (
                        renderShapeSvg(tgt.type, tgt.colorHint, tgt.width, tgt.height)
                      ) : (
                        <div className="opacity-40 text-center flex flex-col items-center">
                          <span className="text-[10px] font-bold">اضغط هنا</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Helper badge */}
              <div className="absolute bottom-3 right-3 text-xs opacity-70 flex items-center gap-1 bg-black/30 text-white px-2.5 py-1 rounded-full backdrop-blur">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>اضغط على الأماكن المحددة لتركيب كل شكل!</span>
              </div>
            </div>

            {/* Shape Pieces Tray & Tools (1 col) */}
            <div
              className={`p-4 rounded-3xl border shadow-md space-y-4 lg:col-span-1 flex flex-col justify-between ${
                mode === 'day'
                  ? 'bg-white/90 border-sky-100'
                  : 'bg-[#181339]/90 border-purple-800/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-amber-500">
                    قطع تركيب {currentPuzzle.name}
                  </h3>
                  <button
                    onClick={handleResetPuzzle}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1"
                    title="إعادة ضبط"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>إعادة</span>
                  </button>
                </div>

                <p className="text-xs opacity-80 leading-relaxed">
                  {currentPuzzle.description}
                </p>

                {/* Pieces waiting to be placed */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {currentPuzzle.targets.map((tgt, idx) => {
                    const isPlaced = placedTargets[tgt.id];
                    return (
                      <button
                        key={tgt.id}
                        disabled={isPlaced}
                        onClick={() => handleSnapPiece(tgt.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isPlaced
                            ? 'opacity-30 bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95 border-white/20 shadow'
                        }`}
                      >
                        <div style={{ transform: `rotate(${tgt.rotation}deg)` }}>
                          {renderShapeSvg(tgt.type, tgt.colorHint, 42, 42)}
                        </div>
                        <span className="text-[11px] font-bold">
                          {isPlaced ? 'تم التركيب ✓' : `قطعة ${idx + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress counter */}
              <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-300/30 text-center">
                <div className="text-xs font-bold text-amber-500 mb-1">
                  التقدم: {Object.values(placedTargets).filter(Boolean).length} من {currentPuzzle.targets.length}
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-purple-900/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                    style={{
                      width: `${(Object.values(placedTargets).filter(Boolean).length / currentPuzzle.targets.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FREEFORM CONSTRUCTION SANDBOX */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left / Shape Library to insert */}
          <div
            className={`p-4 rounded-3xl border shadow-md space-y-4 lg:col-span-1 ${
              mode === 'day'
                ? 'bg-white/90 border-sky-100'
                : 'bg-[#181339]/90 border-purple-800/60'
            }`}
          >
            <h3 className="font-extrabold text-sm text-amber-500">أضف أشكالاً إلى لوحتك:</h3>
            
            {/* Shape types buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'triangle' as const, label: 'مثلث', color: '#ef4444' },
                { type: 'square' as const, label: 'مربع', color: '#3b82f6' },
                { type: 'circle' as const, label: 'دائرة', color: '#facc15' },
                { type: 'rectangle' as const, label: 'مستطيل', color: '#8b5cf6' },
                { type: 'semicircle' as const, label: 'نصف دائرة', color: '#22c55e' },
                { type: 'star' as const, label: 'نجمة', color: '#f59e0b' },
                { type: 'diamond' as const, label: 'معين', color: '#ec4899' },
              ].map((s) => (
                <button
                  key={s.type}
                  onClick={() => addFreeShape(s.type, s.color)}
                  className="p-2.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer"
                >
                  {renderShapeSvg(s.type, s.color, 32, 32)}
                  <span className="text-[10px] font-bold">{s.label}</span>
                </button>
              ))}
            </div>

            {/* Selected shape controls */}
            {selectedShapeId && (
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-400/30 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">تحكم في الشكل المحدد:</span>
                
                {/* Rotate & Delete */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleRotateSelected}
                    className="p-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-purple-700 active:scale-95"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>تدوير</span>
                  </button>

                  <button
                    onClick={handleDeleteSelected}
                    className="p-2 rounded-xl bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-rose-600 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

                {/* Change Color */}
                <div className="pt-1">
                  <span className="text-[11px] block opacity-80 mb-1">تغيير اللون:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {availableColors.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleChangeSelectedColor(c)}
                        style={{ backgroundColor: c }}
                        className="w-5 h-5 rounded-full border border-black/30 transition-transform active:scale-90"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right / Freeform canvas area */}
          <div
            className={`lg:col-span-3 relative h-[440px] rounded-3xl border-4 p-4 shadow-xl overflow-hidden touch-none select-none ${
              mode === 'day'
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-[#120e29] border-purple-700'
            }`}
          >
            {/* Shapes on the board */}
            {freeShapes.map((shape) => {
              const isSelected = shape.id === selectedShapeId;
              return (
                <div
                  key={shape.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedShapeId(shape.id);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${shape.x}px`,
                    top: `${shape.y}px`,
                    transform: `rotate(${shape.rotation || 0}deg)`,
                    cursor: 'grab',
                  }}
                  className={`p-1 transition-all ${
                    isSelected ? 'ring-2 ring-amber-400 ring-offset-2 rounded-xl shadow-lg' : ''
                  }`}
                >
                  {renderShapeSvg(shape.type, shape.color, shape.width, shape.height)}
                </div>
              );
            })}

            <div className="absolute bottom-4 left-4 pointer-events-none px-3 py-1.5 rounded-full bg-black/40 text-white text-xs backdrop-blur font-bold">
              💡 اضغط على أي شكل لتحديده وتدويره أو تغيير لونه
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
