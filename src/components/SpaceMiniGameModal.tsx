import React, { useState, useEffect, useRef } from 'react';
import { AppMode } from '../types';
import { X, Trophy, Rocket, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSparkleSound, playPopSound, playFanfareSound, playWrongSound } from '../utils/audio';

interface SpaceMiniGameModalProps {
  mode: AppMode;
  onClose: () => void;
  onEarnStars: (amount: number) => void;
}

export const SpaceMiniGameModal: React.FC<SpaceMiniGameModalProps> = ({ mode, onClose, onEarnStars }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);

  const gameState = useRef({
    shipX: 160,
    stars: [] as { x: number; y: number; size: number }[],
    asteroids: [] as { x: number; y: number; r: number }[],
    speed: 3,
    running: true,
  });

  const resetGame = () => {
    gameState.current = {
      shipX: 160,
      stars: [],
      asteroids: [],
      speed: 3,
      running: true,
    };
    setScore(0);
    setGameOver(false);
    setHasWon(false);
  };

  const moveShip = (dir: 'left' | 'right') => {
    if (!gameState.current.running) return;
    if (dir === 'left') {
      gameState.current.shipX = Math.max(30, gameState.current.shipX - 35);
    } else {
      gameState.current.shipX = Math.min(290, gameState.current.shipX + 35);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw cosmic background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0a061c');
      grad.addColorStop(1, '#1b0e3d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn stars to collect
      if (frame % 45 === 0) {
        gameState.current.stars.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -10,
          size: 14,
        });
      }

      // Spawn asteroids to dodge
      if (frame % 70 === 0) {
        gameState.current.asteroids.push({
          x: Math.random() * (canvas.width - 50) + 25,
          y: -20,
          r: 16,
        });
      }

      // Update & Draw stars
      ctx.fillStyle = '#fde047';
      gameState.current.stars.forEach((st, idx) => {
        st.y += gameState.current.speed;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Check collision with ship
        const dx = st.x - gameState.current.shipX;
        const dy = st.y - (canvas.height - 50);
        if (Math.hypot(dx, dy) < 28) {
          playSparkleSound();
          setScore((s) => {
            const newS = s + 10;
            if (newS >= 100) {
              setHasWon(true);
              gameState.current.running = false;
              playFanfareSound();
              onEarnStars(30);
              confetti({ particleCount: 80, spread: 80 });
            }
            return newS;
          });
          gameState.current.stars.splice(idx, 1);
        }
      });

      // Update & Draw asteroids
      ctx.fillStyle = '#94a3b8';
      gameState.current.asteroids.forEach((ast, idx) => {
        ast.y += gameState.current.speed * 0.9;
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.r, 0, Math.PI * 2);
        ctx.fill();

        // Check collision with ship
        const dx = ast.x - gameState.current.shipX;
        const dy = ast.y - (canvas.height - 50);
        if (Math.hypot(dx, dy) < 24) {
          playWrongSound();
          setGameOver(true);
          gameState.current.running = false;
        }
      });

      // Draw Raed's Rocket Ship
      const sx = gameState.current.shipX;
      const sy = canvas.height - 50;

      // Thruster flame
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(sx - 8, sy + 18);
      ctx.lineTo(sx, sy + 30 + Math.random() * 8);
      ctx.lineTo(sx + 8, sy + 18);
      ctx.fill();

      // Rocket fuselage
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx, sy - 22);
      ctx.lineTo(sx + 14, sy + 16);
      ctx.lineTo(sx - 14, sy + 16);
      ctx.closePath();
      ctx.fill();

      // Fins
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(sx - 14, sy + 6);
      ctx.lineTo(sx - 24, sy + 18);
      ctx.lineTo(sx - 14, sy + 18);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(sx + 14, sy + 6);
      ctx.lineTo(sx + 24, sy + 18);
      ctx.lineTo(sx + 14, sy + 18);
      ctx.fill();

      // Window
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(sx, sy - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      if (gameState.current.running) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveShip('left');
      if (e.key === 'ArrowRight') moveShip('right');
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/70 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-purple-700 bg-gradient-to-b from-[#18113b] via-[#100d2b] to-[#080517] text-white p-5 space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/30 text-amber-300">
              <Rocket className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-base sm:text-lg">لعبة الفضاء ثلاثية الأبعاد 🚀</h3>
              <p className="text-[11px] text-purple-300">اجمع النجوم الذهبية وتفادى الكويكبات!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score & Status */}
        <div className="flex items-center justify-between px-2 text-xs font-bold text-amber-300">
          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span>النقاط: {score} / 100</span>
          </span>
          <span className="text-purple-300">الهدف: 100 نقطة للفوز!</span>
        </div>

        {/* Game Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500 shadow-inner flex items-center justify-center bg-black">
          <canvas ref={canvasRef} width={320} height={360} className="w-full max-w-[320px] h-[360px]" />

          {/* Overlays on Win/Loss */}
          {hasWon && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4 text-center space-y-2 animate-in zoom-in-95">
              <span className="text-5xl">🏆</span>
              <h4 className="font-black text-xl text-yellow-300">مبروك يا رائد الفضاء!</h4>
              <p className="text-xs text-purple-200">حققت 100 نقطة واكتسبت 30 نجمة جديدة ⭐</p>
              <button
                onClick={resetGame}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow hover:bg-purple-700"
              >
                العب مجددًا 🔄
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4 text-center space-y-2 animate-in zoom-in-95">
              <span className="text-4xl">💥</span>
              <h4 className="font-black text-lg text-rose-400">اصطدمت بكويكب!</h4>
              <p className="text-xs text-purple-200">مجموع نقاطك: {score}</p>
              <button
                onClick={resetGame}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow hover:bg-purple-700"
              >
                حاول مرة أخرى 🚀
              </button>
            </div>
          )}
        </div>

        {/* Steering Buttons for Touch Devices */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={() => moveShip('right')}
            className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 font-black text-sm text-center"
          >
            يمين ➔
          </button>
          <button
            onClick={() => moveShip('left')}
            className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 font-black text-sm text-center"
          >
            ⬅ يسار
          </button>
        </div>
      </div>
    </div>
  );
};
