import React, { useState, useEffect, useRef } from 'react';
import { AppMode, CinemaMovie } from '../types';
import { DEFAULT_CINEMA_MOVIES } from '../data/cinemaMoviesData';
import {
  Film,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Star,
  Heart,
  Plus,
  Trash2,
  Check,
  X,
  Ticket,
  Scissors,
  Clapperboard,
  Tv,
  Crown,
  Eye,
  Smile,
  Glasses
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playClickSound,
  playSparkleSound,
  playPopSound,
  playFanfareSound,
  playChopSound
} from '../utils/audio';

interface CinemaCornerProps {
  mode: AppMode;
  onEarnStars: (amount: number, reason?: string) => void;
  isOwnerAdmin?: boolean;
}

// Helper to convert YouTube watch/short link to embeddable URL
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Match youtube.com/watch?v=ID or youtube.com/embed/ID or youtu.be/ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
  }
  return null;
}

export const CinemaCorner: React.FC<CinemaCornerProps> = ({
  mode,
  onEarnStars,
  isOwnerAdmin = false,
}) => {
  // Load movies from localStorage or default
  const [movies, setMovies] = useState<CinemaMovie[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('raed_cinema_movies');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_CINEMA_MOVIES;
  });

  const [selectedMovie, setSelectedMovie] = useState<CinemaMovie>(movies[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [theaterDimMode, setTheaterDimMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // ---------------- Playful Ticket Booth State (خاصية المزاح لاقتطاع التذكرة) ----------------
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [selectedPopcorn, setSelectedPopcorn] = useState<'caramel' | 'cheese' | 'butter' | 'chocolate'>('caramel');
  const [selected3DGlasses, setSelected3DGlasses] = useState<'classic' | 'neon' | 'gold'>('classic');
  const [ticketSeatNumber] = useState<string>(() => `VIP-${Math.floor(10 + Math.random() * 89)}`);
  const [isTicketTorn, setIsTicketTorn] = useState<boolean>(false);
  const [ticketTornSuccess, setTicketTornSuccess] = useState<boolean>(false);

  // ---------------- Owner Add Movie State (إضافة فيديوهات يوتيوب للسينما) ----------------
  const [showAddMovieModal, setShowAddMovieModal] = useState<boolean>(false);
  const [newMovieTitle, setNewMovieTitle] = useState<string>('');
  const [newMovieDesc, setNewMovieDesc] = useState<string>('');
  const [newMovieVideoUrl, setNewMovieVideoUrl] = useState<string>('');
  const [newMovieCoverUrl, setNewMovieCoverUrl] = useState<string>('');
  const [newMovieDuration, setNewMovieDuration] = useState<string>('12 دقيقة');
  const [newMovieCategory, setNewMovieCategory] = useState<string>('مغامرة كرتونية 🎬');
  const [newMovieAgeRating, setNewMovieAgeRating] = useState<string>('مناسب لجميع الأعمار 🌟');
  const [newMovieDirectorNote, setNewMovieDirectorNote] = useState<string>('');

  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSelectMovie = (movie: CinemaMovie) => {
    playClickSound();
    setSelectedMovie(movie);
    setIsPlaying(true);
    // Smooth scroll to cinema screen
    window.scrollTo({ top: 350, behavior: 'smooth' });
    showToast(`تم تشغيل فيلم: ${movie.title} 🎬🍿`);
  };

  // Playful Ticket Cutting Handler (قص التذكرة للمزاح)
  const handleTearTicket = () => {
    playChopSound();
    setIsTicketTorn(true);

    setTimeout(() => {
      playFanfareSound();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#fbbf24', '#ffffff'],
      });
      setTicketTornSuccess(true);
      onEarnStars(15, 'قص تذكرة سينما رائد الفكاهية 🎟️🍿');
    }, 450);
  };

  const handleResetTicket = () => {
    playClickSound();
    setIsTicketTorn(false);
    setTicketTornSuccess(false);
  };

  // Owner: Add new Movie (YouTube or direct video)
  const handleSaveNewMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovieTitle.trim() || !newMovieVideoUrl.trim()) {
      alert('يرجى كتابة عنوان الفيلم ورابط فيديو اليوتيوب!');
      return;
    }

    playSparkleSound();
    confetti({ particleCount: 60, spread: 70 });

    const created: CinemaMovie = {
      id: `movie-${Date.now()}`,
      title: newMovieTitle.trim(),
      description: newMovieDesc.trim() || 'فيلم كرتوني شيق وممتع للأطفال والعائلة في سينما رائد.',
      duration: newMovieDuration.trim() || '15 دقيقة',
      category: newMovieCategory.trim() || 'مغامرة كرتونية 🎬',
      videoUrl: newMovieVideoUrl.trim(),
      coverImage: newMovieCoverUrl.trim() || '/assets/aistudio/IMG_20261030_214147__2__3f438425.png',
      ageRating: newMovieAgeRating.trim() || 'مناسب لجميع الأعمار 🌟',
      starsReward: 30,
      rating: 5,
      likesCount: 1,
      featured: false,
      directorNote: newMovieDirectorNote.trim() || 'فيلم مضاف من قِبل إدارة سينما رائد 👑',
      addedByOwner: true,
    };

    const updated = [created, ...movies];
    setMovies(updated);
    try {
      localStorage.setItem('raed_cinema_movies', JSON.stringify(updated));
    } catch {}

    setSelectedMovie(created);
    setShowAddMovieModal(false);
    // Reset inputs
    setNewMovieTitle('');
    setNewMovieDesc('');
    setNewMovieVideoUrl('');
    setNewMovieCoverUrl('');
    setNewMovieDirectorNote('');

    showToast('تمت إضافة الفيلم بنجاح ونشره في صالة العرض! 🎬🍿');
  };

  const handleDeleteMovie = (movieId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل أنتِ متأكدة من حذف هذا الفيلم من سينما رائد؟')) return;

    playClickSound();
    const filtered = movies.filter((m) => m.id !== movieId);
    const safe = filtered.length > 0 ? filtered : DEFAULT_CINEMA_MOVIES;
    setMovies(safe);
    try {
      localStorage.setItem('raed_cinema_movies', JSON.stringify(safe));
    } catch {}

    if (selectedMovie.id === movieId) {
      setSelectedMovie(safe[0]);
    }
    showToast('تم حذف الفيلم بنجاح');
  };

  const isYouTube = selectedMovie.videoUrl.includes('youtube.com') || selectedMovie.videoUrl.includes('youtu.be');
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(selectedMovie.videoUrl) : null;

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-7 transition-colors duration-700 font-['Baloo_Bhaijaan_2',_'Nunito',_sans-serif] ${
        theaterDimMode ? 'bg-[#080102] text-white ring-8 ring-black' : ''
      }`}
      dir="rtl"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-2xl border-2 border-amber-300 animate-bounce flex items-center gap-2">
          <span>🍿</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================== HERO CINEMA BANNER (RED THEME + POPCORN & POSTER) ===================== */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-red-500/70 bg-gradient-to-r from-[#42040b] via-[#2d0207] to-[#170104] text-white p-5 sm:p-8">
        {/* Cinema Velvet Curtains & Popcorn Ambient Patterns */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Cinema Emojis Pattern Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none text-2xl flex flex-wrap gap-12 p-6 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i}>{['🍿', '🎬', '🎟️', '🎞️', '🕶️', '📽️', '🥤', '⭐'][i % 8]}</span>
          ))}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Right Text & Controls */}
          <div className="space-y-4 max-w-2xl text-center lg:text-right flex-grow">
            {/* Direct Badge matching Attachment 1 */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border border-amber-400/60 shadow-lg">
              <span className="text-amber-400 text-base">✨</span>
              <span className="text-xs sm:text-sm font-black text-yellow-300 tracking-wide">
                سينما رائد التفاعلية 💫
              </span>
              <span className="text-amber-400 text-base">✨</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-red-200 leading-tight">
              صالة أفلام الأنيميشن للأطفال 🎬🍿
            </h1>

            <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed font-medium">
              أهلاً بكم في صالة العرض الكبرى باللون الأحمر المخملي! استمتعوا بأجمل أفلام ومسلسلات الأنيميشن للأطفال، اقطعوا تذكرتكم السحرية للمزاح، وجهزوا نظارات 3D وعلب الفوشار بالكراميل والجبن!
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
              {/* Playful Ticket Booth Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  playSparkleSound();
                  setShowTicketModal(true);
                  setIsTicketTorn(false);
                  setTicketTornSuccess(false);
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-yellow-200"
              >
                <Ticket className="w-4 h-4 text-amber-950" />
                <span>اقطع تذكرة السينما للمزاح 🎟️✂️ (+15 ⭐)</span>
              </button>

              {/* Theater Mode (Dim/Lights) Toggle */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setTheaterDimMode(!theaterDimMode);
                  showToast(theaterDimMode ? 'تمت إضاءة أنوار الصالة 💡' : 'تم إطفاء أنوار الصالة للسينما 🌙🍿');
                }}
                className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer border ${
                  theaterDimMode
                    ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-md'
                    : 'bg-black/40 hover:bg-black/60 text-white border-white/20'
                }`}
              >
                <span>{theaterDimMode ? '💡 إضاءة الصالة' : '🌙 إطفاء الأضواء'}</span>
              </button>

              {/* OWNER-ONLY BUTTON: Add new YouTube Movie */}
              {isOwnerAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setShowAddMovieModal(true);
                  }}
                  className="px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-xl border border-red-300/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ نشر فيلم فيديو جديد (المالكة) 👑</span>
                </button>
              )}
            </div>
          </div>

          {/* Left: Poster Artwork matching Attachment 2 ("رائد وليان في عالم السينما") */}
          <div className="relative flex-shrink-0 group">
            <div className="relative w-48 h-72 sm:w-60 sm:h-84 rounded-3xl overflow-hidden border-4 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.4)] bg-black transition-transform duration-500 group-hover:scale-105">
              <img
                src="/assets/aistudio/IMG_20261030_214147__2__3f438425.png"
                alt="رائد وليان في عالم السينما"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-3 text-center">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-black mx-auto mb-1 border border-red-400">
                  عرض ثلاثي الأبعاد 3D 🕶️
                </span>
                <span className="text-xs font-black text-yellow-300 drop-shadow">
                  رائد وليان في عالم السينما 🍿
                </span>
              </div>
            </div>

            {/* Popcorn badge hanging on side */}
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-2xl flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
              🍿
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MAIN WIDESCREEN CINEMA PLAYER (16:09 YOUTUBE/VIDEO) ===================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 text-xl">
              📽️
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                <span>شاشة العرض السينمائي (16:09 عريضة)</span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                  YouTube Widescreen
                </span>
              </h2>
              <p className="text-xs text-red-200/80">
                يعرض الآن: <span className="text-yellow-300 font-bold">{selectedMovie.title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-amber-300 font-bold border border-white/10">
              ⏱️ {selectedMovie.duration}
            </span>
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-xs text-red-300 font-bold border border-red-500/30">
              {selectedMovie.ageRating}
            </span>
          </div>
        </div>

        {/* 16:9 Widescreen Cinema Container */}
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black border-4 border-red-600/80 shadow-[0_0_50px_rgba(220,38,38,0.4)] group flex items-center justify-center">
          {/* YouTube Widescreen Player Embed */}
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={selectedMovie.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            /* HTML5 Widescreen Direct Video Player */
            <video
              ref={videoElementRef}
              src={selectedMovie.videoUrl}
              controls
              playsInline
              poster={selectedMovie.coverImage}
              className="w-full h-full object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                playFanfareSound();
                confetti({ particleCount: 70, spread: 70 });
                onEarnStars(selectedMovie.starsReward || 30, `مشاهدة فيلم (${selectedMovie.title}) بالكامل 🎬⭐`);
                showToast(`أحسنت! أكملت مشاهدة الفيلم وربحت +${selectedMovie.starsReward || 30} نجمة خيال ⭐`);
              }}
            />
          )}

          {/* Cinema Corner Curtains Overlay Effect */}
          <div className="absolute top-2 right-3 pointer-events-none z-10 px-3 py-1 rounded-full bg-black/75 backdrop-blur border border-amber-400/50 text-amber-300 text-xs font-black shadow flex items-center gap-1.5">
            <span>🍿</span>
            <span>سينما رائد 16:9 Widescreen</span>
          </div>
        </div>

        {/* Movie Info & Director's Note */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#2e0307] via-[#1f0205] to-[#140103] border border-red-600/40 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center md:text-right flex-1">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-xl">🌟</span>
              <h3 className="text-lg sm:text-xl font-black text-yellow-300">
                {selectedMovie.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed font-medium">
              {selectedMovie.description}
            </p>
            {selectedMovie.directorNote && (
              <p className="text-xs text-amber-300/90 font-medium italic">
                💬 ملاحظة المخرج: {selectedMovie.directorNote}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playSparkleSound();
                setShowTicketModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Ticket className="w-4 h-4 text-amber-950" />
              <span>تذكرة هذا الفيلم 🎟️</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== CINEMA MOVIES GALLERY / CAROUSEL ===================== */}
      <div className="space-y-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-red-400" />
            <h3 className="text-lg sm:text-xl font-black text-white">
              أفلام الكرتون المتوفرة في الصالة ({movies.length} أفلام 🎬)
            </h3>
          </div>
          <span className="text-xs text-amber-300 font-bold">
            اختر فيلماً لمشاهدته فوراً على الشاشة الكبيرة 🍿
          </span>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {movies.map((movie) => {
            const isCurrent = selectedMovie.id === movie.id;
            return (
              <div
                key={movie.id}
                onClick={() => handleSelectMovie(movie)}
                className={`group relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl flex flex-col justify-between ${
                  isCurrent
                    ? 'border-amber-400 bg-gradient-to-b from-[#4a060f] to-[#240307] shadow-red-600/50 ring-2 ring-amber-400/50'
                    : 'border-red-800/60 bg-gradient-to-b from-[#220206] to-[#120103] hover:border-red-500'
                }`}
              >
                {/* Poster Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <img
                    src={movie.coverImage}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Play Overlay Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current translate-x-[-1px]" />
                    </div>
                  </div>

                  {/* Duration Tag */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/75 text-[10px] font-bold text-amber-300 backdrop-blur border border-amber-300/30">
                    ⏱️ {movie.duration}
                  </div>

                  {/* Age Tag */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-red-600 text-[9px] font-black text-white shadow">
                    {movie.ageRating}
                  </div>

                  {/* Owner Delete button */}
                  {isOwnerAdmin && movie.addedByOwner && (
                    <button
                      onClick={(e) => handleDeleteMovie(movie.id, e)}
                      className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/80 hover:bg-rose-600 text-rose-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow z-20"
                      title="حذف الفيلم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2 flex-grow flex flex-col justify-between text-white">
                  <div>
                    <span className="text-[10px] font-bold text-red-300 block">
                      {movie.category}
                    </span>
                    <h4 className="font-black text-sm sm:text-base text-yellow-200 line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {movie.title}
                    </h4>
                    <p className="text-[11px] text-red-100/80 line-clamp-2 mt-1 leading-relaxed font-medium">
                      {movie.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-red-900/50 flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-black flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>+{movie.starsReward}⭐</span>
                    </span>

                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                      isCurrent ? 'bg-amber-400 text-amber-950 font-black' : 'bg-white/10 text-white group-hover:bg-red-600'
                    }`}>
                      {isCurrent ? 'يعرض الآن 🎬' : 'شاهد الفيلم ▶'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================== PLAYFUL TICKET BOOTH MODAL (خاصية المزاح لاقتطاع التذكرة 🎟️✂️) ===================== */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/80 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-gradient-to-b from-[#38040a] via-[#220206] to-[#120103] text-white my-auto p-5 sm:p-6 space-y-5">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-red-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎟️</span>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-yellow-300">
                    شباك تذاكر سينما رائد (للمزاح والمرح) 😄🍿
                  </h3>
                  <p className="text-[11px] text-red-200">
                    اختر نكهة الفوشار ونظارة 3D واقطع تذكرتك للدخول!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTicketModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customizer: Popcorn Flavor */}
            <div className="space-y-1.5 text-xs">
              <label className="font-black text-amber-300 flex items-center gap-1.5">
                <span>🍿 نكهة علبة الفوشار المفضلة:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'caramel' as const, label: 'كراميل ذهبي 🍯' },
                  { id: 'cheese' as const, label: 'جبن لذيذ 🧀' },
                  { id: 'butter' as const, label: 'زبدة كلاسيك 🧈' },
                  { id: 'chocolate' as const, label: 'شوكولاتة 🍫' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setSelectedPopcorn(item.id);
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      selectedPopcorn === item.id
                        ? 'bg-amber-400 text-amber-950 border-white shadow-md font-black scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customizer: 3D Glasses */}
            <div className="space-y-1.5 text-xs">
              <label className="font-black text-amber-300 flex items-center gap-1.5">
                <span>🕶️ لون النظارة ثلاثية الأبعاد 3D:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'classic' as const, label: 'أحمر وأزرق كلاسيك 🔴🔵' },
                  { id: 'neon' as const, label: 'نيون أرجواني 🟣' },
                  { id: 'gold' as const, label: 'ذهبية الأبطال 👑' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setSelected3DGlasses(item.id);
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      selected3DGlasses === item.id
                        ? 'bg-red-600 text-white border-amber-300 shadow-md font-black scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* THE INTERACTIVE TICKET (تذكرة السينما القابلة للقطع ✂️) */}
            <div className="relative rounded-3xl p-4 sm:p-5 border-2 border-dashed border-amber-400 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 text-amber-950 shadow-2xl overflow-hidden">
              {/* Notched Ticket Cutouts on sides */}
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#220206] border-r-2 border-amber-400" />
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#220206] border-l-2 border-amber-400" />

              {/* Ticket Content */}
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-between border-b border-amber-400/40 pb-2 text-[10px] font-black text-amber-900">
                  <span>CINEMA RAED VIP TICKET 🎟️</span>
                  <span>تذكرة سينما الأطفال 🌟</span>
                </div>

                <div className="text-xl sm:text-2xl font-black text-red-950 font-mono tracking-tight">
                  {selectedMovie.title}
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs font-bold bg-amber-200/60 rounded-2xl p-2 border border-amber-300">
                  <div>
                    <span className="block text-[10px] text-amber-800">رقم المقعد 💺</span>
                    <span className="font-black text-red-800">{ticketSeatNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-amber-800">الفوشار 🍿</span>
                    <span className="font-black text-red-800">
                      {selectedPopcorn === 'caramel' ? 'كراميل 🍯' : selectedPopcorn === 'cheese' ? 'جبن 🧀' : selectedPopcorn === 'butter' ? 'زبدة 🧈' : 'شوكولاتة 🍫'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-amber-800">السعر 💸</span>
                    <span className="font-black text-emerald-700">مجاناً! (ابتسامة ودعاء) 😊</span>
                  </div>
                </div>

                {/* Perforated Cut Line */}
                <div className="relative py-2 flex items-center justify-center">
                  <div className="w-full border-t-2 border-dashed border-red-500/70" />
                  <span className="absolute px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center gap-1 shadow">
                    <Scissors className="w-3 h-3 animate-pulse" />
                    <span>خط قطع التذكرة</span>
                  </span>
                </div>

                {/* Stamped Status if Torn */}
                {ticketTornSuccess ? (
                  <div className="p-3 rounded-2xl bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 animate-in zoom-in-75">
                    <Check className="w-5 h-5 text-yellow-300" />
                    <span>تم قص التذكرة بنجاح! تفضل بالدخول لصالة السينما 🍿🎬 (+15 ⭐)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTearTicket}
                    disabled={isTicketTorn}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-700/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-300"
                  >
                    <Scissors className="w-4 h-4 text-yellow-300" />
                    <span>اقطع التذكرة الآن واستمتع بالفيلم! ✂️🎟️</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[11px] text-red-200/80 font-medium flex items-center justify-center gap-1">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span>هذه التذكرة الفكاهية مصممة لإسعاد الأطفال وجعل تجربة السينما تفاعلية وممتعة!</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== OWNER ADD MOVIE MODAL (خاص بالمالكة hadjerrimas2016@gmail.com) ===================== */}
      {showAddMovieModal && isOwnerAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/85 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-gradient-to-b from-[#38040a] via-[#220206] to-[#120103] text-white my-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-base sm:text-lg text-yellow-300">
                    نشر فيلم فيديو جديد في السينما (خاص بمالكة المنصة 👑)
                  </h3>
                  <p className="text-[11px] text-red-200">
                    يمكنك إضافة فيديوهات يوتيوب أو روابط فيديو مباشرة بقياس 16:9
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddMovieModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMovie} className="space-y-3.5 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-black text-amber-300">عنوان الفيلم الكرتوني:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مغامرة رائد والأصدقاء في كوكب الحلوى 🍭"
                  value={newMovieTitle}
                  onChange={(e) => setNewMovieTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-red-500/50 text-white placeholder-red-300/40 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              {/* Video URL (YouTube or MP4) */}
              <div className="space-y-1">
                <label className="font-black text-amber-300 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                  <span>رابط فيديو يوتيوب أو ملف الفيديو (16:9 Widescreen):</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... أو https://youtu.be/... أو رابط mp4"
                  value={newMovieVideoUrl}
                  onChange={(e) => setNewMovieVideoUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-red-500/50 text-white placeholder-red-300/40 text-xs focus:ring-2 focus:ring-amber-400 outline-none dir-ltr text-right"
                />
                <span className="text-[10px] text-amber-200/70 block">
                  يدعم روابط يوتيوب العادية والمختصرة وملفات الفيديو المباشرة
                </span>
              </div>

              {/* Poster Cover URL */}
              <div className="space-y-1">
                <label className="font-black text-amber-300">رابط صورة بوستر الفيلم (Poster):</label>
                <input
                  type="url"
                  placeholder="https://... أو مسار صورة محلية"
                  value={newMovieCoverUrl}
                  onChange={(e) => setNewMovieCoverUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-red-500/50 text-white placeholder-red-300/40 text-xs focus:ring-2 focus:ring-amber-400 outline-none dir-ltr text-right"
                />
              </div>

              {/* Duration & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-black text-amber-300">مدة العرض:</label>
                  <input
                    type="text"
                    placeholder="مثال: 12 دقيقة"
                    value={newMovieDuration}
                    onChange={(e) => setNewMovieDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/60 border border-red-500/50 text-white text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-black text-amber-300">التصنيف:</label>
                  <input
                    type="text"
                    placeholder="مغامرة كرتونية 🎬"
                    value={newMovieCategory}
                    onChange={(e) => setNewMovieCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/60 border border-red-500/50 text-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-black text-amber-300">وصف قصة الفيلم:</label>
                <textarea
                  rows={2}
                  placeholder="نبذة مشوقة عن مغامرة الفيلم ليتشوق الأطفال لمشاهدتها..."
                  value={newMovieDesc}
                  onChange={(e) => setNewMovieDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-red-500/50 text-white placeholder-red-300/40 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              {/* Director's Note */}
              <div className="space-y-1">
                <label className="font-black text-amber-300">ملاحظة المخرجة / نصيحة المشاهدة:</label>
                <input
                  type="text"
                  placeholder="مثال: جهزوا الفشار واستمتعوا بالرحلة مع العائلة!"
                  value={newMovieDirectorNote}
                  onChange={(e) => setNewMovieDirectorNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-red-500/50 text-white text-xs outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMovieModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-200"
                >
                  حفظ ونشر الفيلم في السينما 🎬✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
