import React, { useRef, useState, useEffect } from 'react';
import { AppMode, SavedDrawing } from '../types';
import {
  Palette,
  Eraser,
  RotateCcw,
  Download,
  Trash2,
  Sparkles,
  Save,
  Check,
  Smile,
  Brush,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playPopSound,
  playSparkleSound,
  playClickSound,
  playFanfareSound
} from '../utils/audio';

interface DrawingStudioProps {
  mode: AppMode;
  onEarnStars: (amount: number) => void;
}

export const DrawingStudio: React.FC<DrawingStudioProps> = ({ mode, onEarnStars }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');
  const [brushSize, setBrushSize] = useState<number>(10);
  const [tool, setTool] = useState<'brush' | 'rainbow' | 'eraser' | 'stamp'>('brush');
  const [selectedStamp, setSelectedStamp] = useState<string>('⭐');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);
  const [rainbowHue, setRainbowHue] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Undo history
  const [history, setHistory] = useState<ImageData[]>([]);

  const colors = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#facc15', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#78350f', // Brown
    '#0f172a', // Navy/Black
    '#ffffff', // White
  ];

  const stamps = ['⭐', '🚀', '🦊', '👑', '🌹', '🦖', '🤖', '🎈', '❤️', '🌈'];

  const templates = [
    { id: 'blank', title: 'لوحة بيضاء حرة', icon: '🎨' },
    { id: 'rocket', title: 'صاروخ رائد الفضائي', icon: '🚀' },
    { id: 'fox', title: 'الثعلب اللطيف', icon: '🦊' },
    { id: 'castle', title: 'القلعة السحرية', icon: '🏰' },
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI support
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    loadTemplate(selectedTemplate);
  }, []);

  const loadTemplate = (templateId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / 2;
    const height = canvas.height / 2;

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (templateId === 'rocket') {
      // Draw child-friendly rocket outline
      ctx.beginPath();
      // Body
      ctx.moveTo(width / 2, 40);
      ctx.quadraticCurveTo(width / 2 + 55, 140, width / 2 + 55, 230);
      ctx.lineTo(width / 2 - 55, 230);
      ctx.quadraticCurveTo(width / 2 - 55, 140, width / 2, 40);
      ctx.stroke();

      // Window
      ctx.beginPath();
      ctx.arc(width / 2, 130, 28, 0, Math.PI * 2);
      ctx.stroke();

      // Fins
      ctx.beginPath();
      ctx.moveTo(width / 2 - 55, 180);
      ctx.lineTo(width / 2 - 100, 240);
      ctx.lineTo(width / 2 - 55, 230);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width / 2 + 55, 180);
      ctx.lineTo(width / 2 + 100, 240);
      ctx.lineTo(width / 2 + 55, 230);
      ctx.stroke();

      // Flame
      ctx.beginPath();
      ctx.moveTo(width / 2 - 35, 230);
      ctx.lineTo(width / 2, 280);
      ctx.lineTo(width / 2 + 35, 230);
      ctx.stroke();

      // Decorative stars
      drawStar(ctx, width / 2 - 110, 80, 5, 14, 7);
      drawStar(ctx, width / 2 + 110, 100, 5, 18, 9);
      drawStar(ctx, width / 2 - 90, 180, 5, 12, 6);
    } else if (templateId === 'fox') {
      // Draw cute fox outline
      const cx = width / 2;
      const cy = height / 2 - 10;
      
      // Face
      ctx.beginPath();
      ctx.ellipse(cx, cy, 65, 50, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Ears
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - 25);
      ctx.lineTo(cx - 65, cy - 85);
      ctx.lineTo(cx - 20, cy - 45);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 50, cy - 25);
      ctx.lineTo(cx + 65, cy - 85);
      ctx.lineTo(cx + 20, cy - 45);
      ctx.stroke();

      // Eyes & Nose
      ctx.beginPath();
      ctx.arc(cx - 25, cy - 5, 6, 0, Math.PI * 2);
      ctx.arc(cx + 25, cy - 5, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Cute nose
      ctx.beginPath();
      ctx.arc(cx, cy + 18, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Smile
      ctx.beginPath();
      ctx.arc(cx - 10, cy + 28, 10, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 10, cy + 28, 10, 0, Math.PI);
      ctx.stroke();
    } else if (templateId === 'castle') {
      // Draw cute fairytale castle outline
      const cx = width / 2;
      ctx.strokeRect(cx - 80, 140, 160, 120);

      // Towers
      ctx.strokeRect(cx - 120, 110, 40, 150);
      ctx.strokeRect(cx + 80, 110, 40, 150);

      // Roof cones
      ctx.beginPath();
      ctx.moveTo(cx - 120, 110);
      ctx.lineTo(cx - 100, 60);
      ctx.lineTo(cx - 80, 110);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 80, 110);
      ctx.lineTo(cx + 100, 60);
      ctx.lineTo(cx + 120, 110);
      ctx.closePath();
      ctx.stroke();

      // Center tower
      ctx.strokeRect(cx - 35, 90, 70, 50);
      ctx.beginPath();
      ctx.moveTo(cx - 35, 90);
      ctx.lineTo(cx, 40);
      ctx.lineTo(cx + 35, 90);
      ctx.closePath();
      ctx.stroke();

      // Castle Gate
      ctx.beginPath();
      ctx.arc(cx, 220, 25, Math.PI, 0);
      ctx.lineTo(cx + 25, 260);
      ctx.lineTo(cx - 25, 260);
      ctx.closePath();
      ctx.stroke();
    }

    saveState();
  };

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.stroke();
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), imgData]);
  };

  const handleUndo = () => {
    playClickSound();
    if (history.length <= 1) return;
    const newHist = [...history];
    newHist.pop(); // remove current
    const prevState = newHist[newHist.length - 1];
    setHistory(newHist);

    const canvas = canvasRef.current;
    if (!canvas || !prevState) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(prevState, 0, 0);
  };

  const handleClear = () => {
    playPopSound();
    loadTemplate(selectedTemplate);
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'stamp') {
      playSparkleSound();
      ctx.font = `${brushSize * 4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
      saveState();
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === 'stamp') return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
    } else if (tool === 'rainbow') {
      const nextHue = (rainbowHue + 3) % 360;
      setRainbowHue(nextHue);
      ctx.strokeStyle = `hsl(${nextHue}, 100%, 55%)`;
    } else {
      ctx.strokeStyle = selectedColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleSaveDrawing = () => {
    playFanfareSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    const newDrawing: SavedDrawing = {
      id: Date.now().toString(),
      title: `لوحة رائد رقم ${savedDrawings.length + 1}`,
      dataUrl,
      createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setSavedDrawings((prev) => [newDrawing, ...prev]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Award child stars!
    onEarnStars(15);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDownload = () => {
    playSparkleSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `raed-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Studio Header Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 ${
          mode === 'day'
            ? 'bg-gradient-to-r from-amber-100 via-yellow-50 to-pink-50 border-amber-200'
            : 'bg-gradient-to-r from-indigo-950 via-purple-950 to-pink-950 border-purple-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md text-2xl">
            🎨
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">مرسم رائد الصغير للألوان</h2>
            <p className="text-xs sm:text-sm opacity-80 font-medium">
              لوّن وارسم واستخدم الفرشاة السحرية والملصقات اللامعة!
            </p>
          </div>
        </div>

        {/* Templates Picker Pills */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                playClickSound();
                setSelectedTemplate(tpl.id);
                loadTemplate(tpl.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedTemplate === tpl.id
                  ? 'bg-purple-600 text-white shadow-md scale-105'
                  : 'bg-white/40 hover:bg-white/70 dark:bg-white/10 dark:hover:bg-white/20'
              }`}
            >
              <span>{tpl.icon}</span>
              <span>{tpl.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Toolbox & Controls (Left / Column 1) */}
        <div
          className={`p-4 rounded-3xl border shadow-md space-y-4 lg:col-span-1 ${
            mode === 'day'
              ? 'bg-white/90 border-sky-100'
              : 'bg-[#181339]/90 border-purple-800/60'
          }`}
        >
          {/* Tool Modes */}
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold block text-amber-500">أداة الرسم:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setTool('brush');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  tool === 'brush'
                    ? 'bg-purple-600 text-white border-purple-500 shadow'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Brush className="w-4 h-4" />
                <span>فرشاة</span>
              </button>

              <button
                onClick={() => {
                  playSparkleSound();
                  setTool('rainbow');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  tool === 'rainbow'
                    ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white shadow animate-pulse'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Sparkles className="w-4 h-4 text-yellow-200" />
                <span>قوس قزح</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setTool('stamp');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  tool === 'stamp'
                    ? 'bg-amber-500 text-amber-950 font-black shadow'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Smile className="w-4 h-4" />
                <span>ملصقات</span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  setTool('eraser');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  tool === 'eraser'
                    ? 'bg-rose-500 text-white border-rose-400 shadow'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span>ممحاة</span>
              </button>
            </div>
          </div>

          {/* Color Palette (When tool is brush) */}
          {tool === 'brush' && (
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold block text-amber-500">ألوان رائد:</span>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      playClickSound();
                      setSelectedColor(color);
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform active:scale-90 ${
                      selectedColor === color
                        ? 'border-indigo-600 dark:border-white scale-110 shadow-md ring-2 ring-amber-400'
                        : 'border-black/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stamps Palette (When tool is stamp) */}
          {tool === 'stamp' && (
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold block text-amber-500">اختر الملصق واضغط عاللوحة:</span>
              <div className="grid grid-cols-5 gap-2">
                {stamps.map((stamp) => (
                  <button
                    key={stamp}
                    onClick={() => {
                      playSparkleSound();
                      setSelectedStamp(stamp);
                    }}
                    className={`text-2xl p-1 rounded-xl transition-all ${
                      selectedStamp === stamp
                        ? 'bg-amber-300 scale-125 shadow'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {stamp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brush Size Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-amber-500">حجم الخط:</span>
              <span>{brushSize} px</span>
            </div>
            <input
              type="range"
              min="4"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] opacity-70">
              <span>دقيق</span>
              <span>متوسط</span>
              <span>عريض</span>
            </div>
          </div>

          {/* Canvas Actions */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleUndo}
                className="p-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 flex items-center justify-center gap-1 text-xs font-bold transition-all"
                title="تراجع عن خطوة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تراجع</span>
              </button>

              <button
                onClick={handleClear}
                className="p-2 rounded-xl border border-rose-300/30 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 dark:text-rose-300 flex items-center justify-center gap-1 text-xs font-bold transition-all"
                title="مسح كل اللوحة"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح</span>
              </button>
            </div>

            <button
              onClick={handleSaveDrawing}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-98 transition-all"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم حفظ اللوحة! (+15 ⭐)</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>احفظ لوحتي في المعرض</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-700 dark:text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تحميل كصورة لجهازي (PNG)</span>
            </button>
          </div>
        </div>

        {/* Drawing Board Canvas Area (Right / Column 2-4) */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          <div
            className={`relative rounded-3xl overflow-hidden border-4 shadow-2xl p-2 sm:p-4 touch-none flex items-center justify-center ${
              mode === 'day'
                ? 'bg-amber-100/60 border-amber-300'
                : 'bg-purple-950/60 border-purple-700'
            }`}
          >
            {/* The interactive HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[380px] sm:h-[460px] bg-white rounded-2xl shadow-inner cursor-crosshair border border-slate-200"
            />

            {/* Hint overlay on bottom right */}
            <div className="absolute bottom-6 left-6 pointer-events-none px-3 py-1 rounded-full bg-black/50 text-white text-[11px] font-bold backdrop-blur">
              🎨 ارسم بإصبعك أو بالفأرة
            </div>
          </div>

          {/* Saved Art Gallery Preview */}
          {savedDrawings.length > 0 && (
            <div
              className={`p-4 rounded-3xl border ${
                mode === 'day'
                  ? 'bg-white/80 border-sky-100'
                  : 'bg-indigo-950/60 border-purple-800'
              }`}
            >
              <h4 className="font-extrabold text-sm mb-2 flex items-center gap-1.5 text-amber-500">
                <ImageIcon className="w-4 h-4" />
                <span>معرض رسوماتي المحفوظة ({savedDrawings.length})</span>
              </h4>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {savedDrawings.map((drawItem) => (
                  <div
                    key={drawItem.id}
                    className="flex-shrink-0 w-28 rounded-xl overflow-hidden border border-white/20 bg-white p-1 shadow-md hover:scale-105 transition-transform"
                  >
                    <img
                      src={drawItem.dataUrl}
                      alt={drawItem.title}
                      className="w-full h-20 object-contain rounded-lg bg-white"
                    />
                    <div className="p-1 text-center">
                      <span className="text-[10px] font-bold text-slate-800 truncate block">
                        {drawItem.title}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {drawItem.createdAt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
