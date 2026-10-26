import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload, Link2, Check, RotateCcw, Sparkles } from 'lucide-react';
import { CURATED_COVER_CATEGORIES } from '../data/curatedCoversData';
import { saveStoryCover, resetStoryCover } from '../utils/customCovers';
import { playClickSound, playSparkleSound, playPopSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface StoryCoverPickerModalProps {
  storyId: string;
  storyTitle: string;
  currentCover: string;
  defaultCover: string;
  isOpen: boolean;
  onClose: () => void;
  onCoverUpdated?: (newCoverUrl: string) => void;
}

export const StoryCoverPickerModal: React.FC<StoryCoverPickerModalProps> = ({
  storyId,
  storyTitle,
  currentCover,
  defaultCover,
  isOpen,
  onClose,
  onCoverUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [previewCover, setPreviewCover] = useState<string>(currentCover || defaultCover);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSelectGalleryImage = (url: string) => {
    playClickSound();
    setPreviewCover(url);
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
        setPreviewCover(dataUrl);
        setUrlError('');
        playSparkleSound();
        showToast('تم تحميل الصورة بنجاح! عاينها ثم اضغط حفظ الغلاف ✨');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setUrlError('يرجى كتابة رابط الصورة أولاً');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image')) {
      setUrlError('الرابط يجب أن يبدأ بـ https://');
      return;
    }
    setUrlError('');
    setPreviewCover(trimmed);
    playClickSound();
    showToast('تم تحميل الرابط! عاين الصورة ثم اضغط حفظ الغلاف.');
  };

  const handleSave = () => {
    if (!previewCover) return;
    playSparkleSound();
    saveStoryCover(storyId, previewCover);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    if (onCoverUpdated) {
      onCoverUpdated(previewCover);
    }
    showToast('تم حفظ غلاف القصة الجديد بنجاح! 🌟');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleReset = () => {
    playPopSound();
    resetStoryCover(storyId);
    setPreviewCover(defaultCover);
    if (onCoverUpdated) {
      onCoverUpdated(defaultCover);
    }
    showToast('تمت استعادة الغلاف الافتراضي للقصة ↺');
  };

  const allCuratedImages = CURATED_COVER_CATEGORIES.flatMap((c) => c.images);
  const displayedCategories =
    selectedCategory === 'الكل'
      ? CURATED_COVER_CATEGORIES
      : CURATED_COVER_CATEGORIES.filter((c) => c.category.includes(selectedCategory));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#23103d] via-[#170a2c] to-[#0f051e] border-2 border-purple-500/60 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900/60 via-indigo-950/60 to-purple-900/60 border-b border-purple-500/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 text-white flex items-center justify-center shadow-md">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-amber-300">
                  تخصيص غلاف القصة 🎨
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/30 text-pink-300 border border-pink-400/30">
                  اختيار حر
                </span>
              </div>
              <p className="text-xs text-purple-200 truncate max-w-[260px] sm:max-w-md">
                اختر أو ارفع غلافاً لقصة: <span className="font-bold text-white">{storyTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-all cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-600/90 text-white text-xs font-bold px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-grow no-scrollbar">
          {/* Live Preview Card */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-xl bg-slate-900 flex-shrink-0 group">
              <img
                src={previewCover}
                alt="معاينة الغلاف"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => {
                  setUrlError('تعذر تحميل رابط الصورة. يرجى تجربة رابط آخر أو رفع ملف.');
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <span className="text-[11px] font-black text-amber-300 block truncate">
                  {storyTitle}
                </span>
                <span className="text-[9px] text-purple-200 block">معاينة الغلاف الجديد</span>
              </div>
            </div>

            <div className="space-y-2 text-right flex-grow">
              <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>كيف تود اختيار غلاف قصتك؟</span>
              </h4>
              <p className="text-xs text-purple-200/90 leading-relaxed">
                يمكنك الاختيار من معرض الرسوم الجاهزة والساحرة، أو رفع صورة خاصة من جهازك، أو لصق رابط صورة مباشرة.
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة الغلاف الأصلي</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 bg-black/40 rounded-2xl border border-purple-500/30">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('gallery');
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>معرض الأغلفة المنسقة ({allCuratedImages.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('upload');
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>رفع من جهازك 📤</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('url');
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md font-black'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>رابط صورة مباشر 🔗</span>
            </button>
          </div>

          {/* TAB 1: CURATED GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-3">
              {/* Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {['الكل', 'قلاع', 'فضاء', 'شهرزاد', 'حيوانات', 'نوم', 'بحار'].map((catLabel) => {
                  const isSelected = selectedCategory === catLabel;
                  return (
                    <button
                      key={catLabel}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setSelectedCategory(catLabel);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-amber-950 font-black scale-105 shadow'
                          : 'bg-white/10 text-purple-200 hover:bg-white/20'
                      }`}
                    >
                      {catLabel === 'الكل' ? '🌟 الكل' : catLabel}
                    </button>
                  );
                })}
              </div>

              {/* Grid of options */}
              <div className="space-y-4">
                {displayedCategories.map((group) => (
                  <div key={group.category} className="space-y-2">
                    <h5 className="text-xs font-black text-amber-300/90 flex items-center gap-1.5">
                      <span>{group.category}</span>
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {group.images.map((img) => {
                        const isChosen = previewCover === img.url;
                        return (
                          <div
                            key={img.id}
                            onClick={() => handleSelectGalleryImage(img.url)}
                            className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                              isChosen
                                ? 'border-amber-400 scale-[1.03] ring-4 ring-amber-400/40 shadow-xl'
                                : 'border-white/15 hover:border-purple-400/80 hover:scale-[1.01]'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                              loading="lazy"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                              <p className="text-[10px] text-white font-bold truncate">{img.title}</p>
                            </div>
                            {isChosen && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FROM DEVICE */}
          {activeTab === 'upload' && (
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-purple-500/30">
              <div className="text-center space-y-2">
                <span className="w-14 h-14 rounded-full bg-pink-500/20 text-pink-400 border border-pink-400/40 inline-flex items-center justify-center shadow-lg">
                  <Upload className="w-7 h-7" />
                </span>
                <h4 className="text-sm font-black text-white">اختر صورة من هاتفك أو جهاز الكمبيوتر</h4>
                <p className="text-xs text-purple-200">
                  الصيغ المدعومة: PNG, JPG, WebP. ستحفظ الصورة محلياً وتظهر كغلاف دائم للقصة.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center pt-2">
                <label className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-pink-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span>تصفح واختيار ملف الصورة 🖼️</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-purple-500/30">
              <label className="text-xs font-bold text-amber-300 block">
                الصق رابط الصورة المباشر (Direct Image URL):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/cover-image.jpg"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-grow px-3 py-2.5 rounded-xl bg-black/40 border border-purple-500/50 text-xs text-white placeholder-purple-400/50 focus:border-amber-400 outline-none"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 text-amber-950 font-black text-xs hover:bg-amber-300 transition-all cursor-pointer flex-shrink-0"
                >
                  معاينة 👁️
                </button>
              </div>

              {urlError && (
                <p className="text-xs text-rose-300 font-bold bg-rose-950/60 p-2 rounded-xl border border-rose-500/40">
                  {urlError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border-t border-purple-500/30 flex items-center justify-between gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold transition-all cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>حفظ وتعيين هذا الغلاف للقصة ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
