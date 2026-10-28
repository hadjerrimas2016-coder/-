import React, { useState } from 'react';
import { PictureBook, AppMode } from '../types';
import {
  Sparkles,
  BookOpen,
  ChevronLeft,
  Camera,
  Image as ImageIcon,
  Upload,
  Link2,
  Check,
  X,
  Layers,
  Sparkle
} from 'lucide-react';
import { playClickSound, playSparkleSound, playPopSound } from '../utils/audio';
import { CURATED_COVER_CATEGORIES } from '../data/curatedCoversData';
import confetti from 'canvas-confetti';

interface PictureBookBannerProps {
  book: PictureBook;
  mode: AppMode;
  onOpenBook: () => void;
  isOwnerAdmin?: boolean;
  onUpdateBook?: (updatedBook: PictureBook) => void;
}

export const PictureBookBanner: React.FC<PictureBookBannerProps> = ({
  book,
  mode,
  onOpenBook,
  isOwnerAdmin,
  onUpdateBook,
}) => {
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);
  const [selectedCover, setSelectedCover] = useState<string>(book?.coverImage || '');
  const [activeTab, setActiveTab] = useState<'pages' | 'upload' | 'url' | 'gallery'>('pages');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const fallbackCover = '/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png';
  const safeCover = book?.coverImage || fallbackCover;
  const safeTitle = book?.title || 'قصة ليان وسر الجوهرة المصونة';
  const safeBadge = book?.badge || 'كتاب مصوّر تفاعلي بالصفحات والصوت';
  const safeSubtitle =
    book?.subtitle ||
    'تصفّح الحكاية صفحة بصفحة كرسوم كرتونية ساحرة مع نصوص مشكولة. استمع بصوت الراوي 🎧 . وسجّل قراءتك بصوتك لكسب 40+ نقطة خيال!';

  // Available pages that have images inside this book
  const pagesWithImages = (book?.pages || []).filter((p) => p.image && p.image.trim().length > 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenCoverModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOwnerAdmin) {
      onOpenBook();
      return;
    }
    playClickSound();
    setSelectedCover(book?.coverImage || (book?.pages?.[0]?.image ?? ''));
    setShowCoverModal(true);
  };

  const handleSelectCover = (url: string) => {
    playClickSound();
    setSelectedCover(url);
    setUrlError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedCover(dataUrl);
        setUrlError('');
        playSparkleSound();
        showToast('تم تحميل الصورة بنجاح! اضغط حفظ لاعتمادها ✨');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    const trimmed = customUrl.trim();
    if (!trimmed) {
      setUrlError('يرجى كتابة رابط الصورة');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image')) {
      setUrlError('يجب أن يبدأ الرابط بـ https://');
      return;
    }
    setUrlError('');
    setSelectedCover(trimmed);
    playClickSound();
    showToast('تم تطبيق رابط الصورة! عاينها ثم اضغط حفظ الغلاف.');
  };

  const handleSaveCover = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedCover) return;

    playSparkleSound();
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });

    const updatedBook: PictureBook = {
      ...book,
      coverImage: selectedCover,
    };

    if (onUpdateBook) {
      onUpdateBook(updatedBook);
    }

    setImageLoadError(false);
    showToast('تم تحديث وحفظ صورة غلاف الكتاب المصور بنجاح! 🌟');
    setTimeout(() => {
      setShowCoverModal(false);
    }, 500);
  };

  return (
    <>
      <div
        onClick={() => {
          playSparkleSound();
          onOpenBook();
        }}
        className={`group relative rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 hover:scale-[1.008] shadow-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 ${
          mode === 'day'
            ? 'bg-gradient-to-r from-purple-100 via-pink-50 to-amber-50 border-purple-300/80 shadow-purple-200/50 hover:border-pink-500'
            : 'bg-[#180a2c] border-purple-800/80 shadow-[0_0_35px_rgba(40,15,65,0.7)] hover:border-pink-500'
        }`}
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {toastMessage}
          </div>
        )}

        {/* Right Column in RTL: Badge, Title, Subtitle, and Big CTA Button */}
        <div className="space-y-3.5 max-w-xl text-center md:text-right order-2 md:order-1 flex-grow">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-900/50 border border-purple-500/40 text-purple-200 font-extrabold text-xs shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>{safeBadge}</span>
          </div>

          {/* Big Story Title */}
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-black leading-tight flex items-center justify-center md:justify-start gap-2 ${
              mode === 'day' ? 'text-indigo-950' : 'text-white'
            }`}
          >
            <span>{safeTitle}</span>
            <span className="text-2xl">💎</span>
          </h2>

          {/* Description & Rewards */}
          <p
            className={`text-xs sm:text-sm font-medium leading-relaxed ${
              mode === 'day' ? 'text-slate-700' : 'text-purple-200/90'
            }`}
          >
            {safeSubtitle}
          </p>

          {/* Actions: CTA Button + Owner Cover Customizer Button */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playClickSound();
                onOpenBook();
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d926aa] via-[#f72585] to-[#f89b29] hover:from-[#e033b5] hover:to-[#ffa63d] text-white font-black text-xs sm:text-sm shadow-xl shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-pink-300/40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>اقرأ واستمع للكتاب المصوّر</span>
              <BookOpen className="w-4 h-4 fill-current" />
            </button>

            {/* Direct Owner Cover Customizer Trigger - ONLY SHOWN TO OWNER */}
            {isOwnerAdmin && (
              <button
                onClick={handleOpenCoverModal}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400/25 via-yellow-300/20 to-amber-500/25 hover:bg-amber-400/35 border border-amber-300/70 text-amber-300 hover:text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ring-1 ring-amber-400/40"
                title="تغيير صورة عرض الكتاب المصور (خاص بمالكة الموقع فقط)"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>تغيير صورة عرض الكتاب (المالكة) 👑</span>
              </button>
            )}
          </div>
        </div>

        {/* Left Column in RTL: Illustrated Book Cover */}
        <div className="relative flex-shrink-0 order-1 md:order-2">
          <div
            onClick={(e) => {
              if (isOwnerAdmin) {
                handleOpenCoverModal(e);
              } else {
                e.stopPropagation();
                playClickSound();
                onOpenBook();
              }
            }}
            className={`group/cover relative w-44 h-56 sm:w-52 sm:h-64 rounded-3xl overflow-hidden border-2 border-purple-400/50 shadow-2xl transition-all bg-[#120824] flex items-center justify-center cursor-pointer ring-4 ring-purple-500/20 ${
              isOwnerAdmin ? 'hover:scale-105 hover:ring-amber-400/60' : 'hover:scale-[1.02] hover:border-pink-400'
            }`}
            title={isOwnerAdmin ? 'انقري لتغيير صورة عرض الكتاب كمالكة للموقع 👑' : safeTitle}
          >
            <img
              src={imageLoadError ? fallbackCover : safeCover}
              alt={safeTitle}
              onError={(e) => {
                if (!imageLoadError) {
                  setImageLoadError(true);
                } else {
                  // Fallback to svg or stylized background
                  (e.currentTarget as HTMLImageElement).src = fallbackCover;
                }
              }}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
            />

            {/* ONLY SHOWN TO OWNER: Floating Owner Badge on the Cover */}
            {isOwnerAdmin && (
              <div className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/80 text-amber-300 text-[10px] font-black flex items-center gap-1 shadow-md group-hover/cover:scale-105 transition-transform">
                <Camera className="w-3 h-3 text-amber-400" />
                <span>تغيير الغلاف 👑</span>
              </div>
            )}

            {/* ONLY SHOWN TO OWNER: Hover overlay hint */}
            {isOwnerAdmin && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center justify-end p-3 text-center">
                <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs shadow-lg flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>تغيير صورة الغلاف (المالكة) 👑</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Picture Book Cover Picker Modal (نافذة اختيار وتغيير صورة عرض الكتاب المصور - للمالكة فقط) */}
      {showCoverModal && isOwnerAdmin && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
          dir="rtl"
        >
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#23103d] via-[#170a2c] to-[#0f051e] border-2 border-purple-500/60 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-purple-500/30 flex items-center justify-between bg-purple-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center font-black shadow-md">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>اختيار صورة عرض الكتاب المصور</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-purple-200/80">
                    كتاب: <span className="text-amber-300 font-bold">{safeTitle}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setShowCoverModal(false);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-purple-950/60 p-1.5 rounded-2xl border border-purple-500/30">
                <button
                  onClick={() => {
                    playClickSound();
                    setActiveTab('pages');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'pages'
                      ? 'bg-amber-400 text-amber-950 shadow-md scale-[1.02]'
                      : 'text-purple-200 hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>صفحات الكتاب ({pagesWithImages.length})</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    setActiveTab('upload');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-amber-400 text-amber-950 shadow-md scale-[1.02]'
                      : 'text-purple-200 hover:bg-white/5'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    setActiveTab('url');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'url'
                      ? 'bg-amber-400 text-amber-950 shadow-md scale-[1.02]'
                      : 'text-purple-200 hover:bg-white/5'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>رابط صورة</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    setActiveTab('gallery');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'gallery'
                      ? 'bg-amber-400 text-amber-950 shadow-md scale-[1.02]'
                      : 'text-purple-200 hover:bg-white/5'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>معرض الرسومات</span>
                </button>
              </div>

              {/* Tab 1: Pages of this book */}
              {activeTab === 'pages' && (
                <div className="space-y-3">
                  <div className="text-xs text-purple-200 font-bold flex items-center justify-between">
                    <span>اختر إحدى صور صفحات هذا الكتاب لتكون صورة الغلاف مباشرة:</span>
                    <span className="text-[11px] text-amber-400">انقر على الصورة للاختيار</span>
                  </div>

                  {pagesWithImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                      {pagesWithImages.map((page) => {
                        const isChosen = selectedCover === page.image;
                        return (
                          <div
                            key={page.pageNumber}
                            onClick={() => handleSelectCover(page.image)}
                            className={`group/page relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-[3/4] bg-purple-950/60 ${
                              isChosen
                                ? 'border-amber-400 ring-4 ring-amber-400/40 scale-105 shadow-xl'
                                : 'border-purple-500/40 hover:border-pink-400 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={page.image}
                              alt={`صفحة ${page.pageNumber}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/70 text-amber-300 text-[10px] font-black">
                              صفحة {page.pageNumber}
                            </div>
                            {isChosen && (
                              <div className="absolute inset-0 bg-amber-400/20 backdrop-blur-[1px] flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-lg">
                                  <Check className="w-5 h-5 stroke-[3]" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                      <p className="text-xs text-purple-200">
                        لا توجد صور مضافة لصفحات هذا الكتاب حالياً.
                      </p>
                      <p className="text-[11px] text-amber-400">
                        يمكنك رفع صورة من جهازك أو وضع رابط صورة من التبويبات الأخرى!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Upload File */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <label className="block p-8 border-2 border-dashed border-purple-400/60 hover:border-amber-400 rounded-3xl bg-purple-950/30 hover:bg-purple-900/40 text-center cursor-pointer transition-all">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center shadow-lg">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-sm font-black text-amber-300 block">
                          اضغط لاختيار صورة من جهازك أو هاتفك
                        </span>
                        <span className="text-[11px] text-purple-200/70 block mt-1">
                          يدعم صيغ PNG, JPG, JPEG, WebP
                        </span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Tab 3: Custom URL */}
              {activeTab === 'url' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-purple-200">
                    ضع رابط الصورة المباشر (URL):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/cover.jpg"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/50 text-white placeholder-purple-400/50 text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleApplyUrl}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 text-amber-950 font-black text-xs hover:bg-amber-300 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>تطبيق</span>
                    </button>
                  </div>
                  {urlError && <p className="text-xs text-rose-400 font-bold">{urlError}</p>}
                </div>
              )}

              {/* Tab 4: Curated Gallery */}
              {activeTab === 'gallery' && (
                <div className="space-y-4 max-h-64 overflow-y-auto p-1">
                  {CURATED_COVER_CATEGORIES.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <Sparkle className="w-3.5 h-3.5" />
                        <span>{cat.category}</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {cat.images.map((img) => {
                          const isChosen = selectedCover === img.url;
                          return (
                            <div
                              key={img.id}
                              onClick={() => handleSelectCover(img.url)}
                              className={`group/item relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-[3/4] bg-purple-950/60 ${
                                isChosen
                                  ? 'border-amber-400 ring-4 ring-amber-400/40 scale-105 shadow-xl'
                                  : 'border-purple-500/30 hover:border-pink-400 opacity-75 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-x-0 bottom-0 p-1 bg-black/70 text-[9px] font-bold text-center truncate text-purple-200">
                                {img.title}
                              </div>
                              {isChosen && (
                                <div className="absolute inset-0 bg-amber-400/20 backdrop-blur-[1px] flex items-center justify-center">
                                  <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-lg">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Preview Box */}
              {selectedCover && (
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-4">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-amber-400/60 flex-shrink-0 shadow-md">
                    <img
                      src={selectedCover}
                      alt="معاينة الغلاف"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>الصورة المختارة كغلاف حالياً</span>
                    </div>
                    <p className="text-[11px] text-purple-200/80 truncate">
                      سيتم حفظ هذه الصورة كغلاف معروض للكتاب في الصفحة الرئيسية لجميع الزوار.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 sm:p-5 border-t border-purple-500/30 flex items-center justify-between gap-3 bg-purple-950/60">
              <button
                onClick={() => {
                  playClickSound();
                  setShowCoverModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-purple-200 text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>

              <button
                onClick={handleSaveCover}
                disabled={!selectedCover}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>حفظ وتثبيت صورة العرض 🌟</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
