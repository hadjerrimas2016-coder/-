import React, { useState } from 'react';
import { Story, AppMode } from '../types';
import { PRESET_STORY_PACKS, StoryPack } from '../data/multiStoryPacks';
import { publishStoryToFirestore } from '../firebase';
import {
  Zap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Layers,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Play,
  ArrowRight,
  Flame,
  Award,
  Crown,
  UtensilsCrossed,
  Rocket
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSparkleSound, playFanfareSound, playClickSound, playPopSound } from '../utils/audio';

interface InstantMultiStoryStudioProps {
  mode: AppMode;
  onSaveStory: (story: Story) => void;
  onClose?: () => void;
  existingStories?: Story[];
}

interface CustomBatchStory {
  id: string;
  title: string;
  subtitle: string;
  category: Story['category'];
  categoryLabel: string;
  categoryIcon: string;
  ageRange: string;
  coverImage: string;
  description: string;
  moralLesson: string;
  page1Text: string;
  page2Text: string;
  quizQuestion: string;
  quizOption1: string;
  quizOption2: string;
}

export const InstantMultiStoryStudio: React.FC<InstantMultiStoryStudioProps> = ({
  mode,
  onSaveStory,
  onClose,
  existingStories = [],
}) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'customBatch' | 'templates'>('packs');
  const [publishingPackId, setPublishingPackId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [publishedCount, setPublishedCount] = useState<number>(0);

  // Batch Custom Stories State
  const [batchStories, setBatchStories] = useState<CustomBatchStory[]>([
    {
      id: `batch-${Date.now()}-1`,
      title: 'مغامرة رائد في غابة الفراشات المضيئة',
      subtitle: 'حكاية عن الصداقة وحماية أسرار الطبيعة',
      category: 'nature',
      categoryLabel: 'عالم الطبيعة',
      categoryIcon: '🌿',
      ageRange: '5 - 9 سنوات',
      coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
      description: 'ينطلق رائد في رحلة شيقة ليكتشف كيف تنير الفراشات طريق الحيوانات التائهة في الغابة ليلاً.',
      moralLesson: 'مساعدة الآخرين والتعاون يجعلان العالم مكاناً أجمل.',
      page1Text: 'في أعماق الغابة الهادئة، التقى رائد بفراشة صغيرة تشع نوراً زمردياً لطيفاً أرشده إلى طريق الأمان.',
      page2Text: 'تعلم رائد أن لكل كائن حي دوراً مهماً في توازن الطبيعة وجمالها.',
      quizQuestion: 'بماذا تشع الفراشة الصغيرة في الغابة؟',
      quizOption1: 'بنور زمردي لطيف',
      quizOption2: 'بنار حارقة',
    },
    {
      id: `batch-${Date.now()}-2`,
      title: 'أسرار أعماق المحيط ولؤلؤة الشجاعة',
      subtitle: 'رحلة بحرية ممتعة في قاع البحر الأزرق',
      category: 'adventure',
      categoryLabel: 'مغامرات شيقة',
      categoryIcon: '🗺️',
      ageRange: '6 - 11 سنة',
      coverImage: '/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png',
      description: 'يغوص رائد في غواصته الصفراء ليكتشف حدائق المرجان وحوت العنبر الودود.',
      moralLesson: 'الشجاعة ليست غياب الخوف، بل التغلب عليه بحكمة.',
      page1Text: 'نزلت الغواصة في أعماق البحر الأزرق، وشاهد رائد أسراب الأسماك الفضية تسبح بانسجام بديع.',
      page2Text: 'هناك التقى بالسلحفاة الحكيمة التي أهدته لؤلؤة الصدق والأمانة.',
      quizQuestion: 'من أهدى رائد لؤلؤة الصدق؟',
      quizOption1: 'السلحفاة الحكيمة',
      quizOption2: 'سمكة القرش',
    },
  ]);

  // Handle publishing a single pre-built pack of stories
  const handlePublishPack = async (pack: StoryPack) => {
    playClickSound();
    setPublishingPackId(pack.id);
    setStatusMessage(`جارٍ نشر ${pack.stories.length} قصص من ${pack.title} إلى Firebase...`);

    try {
      let count = 0;
      for (const st of pack.stories) {
        await publishStoryToFirestore({
          ...st,
          authorEmail: 'hadjerrimas2016@gmail.com',
          authorId: 'admin',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
        onSaveStory(st);
        count++;
      }

      playFanfareSound();
      confetti({ particleCount: 80, spread: 70 });
      setPublishedCount((prev) => prev + count);
      setStatusMessage(`تم نشر ${count} قصص بنجاح في الموقع وقاعدة بيانات Firebase! 🌟`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      alert(`خطأ أثناء النشر السحابي: ${err?.message || err}`);
      setStatusMessage('');
    } finally {
      setPublishingPackId(null);
    }
  };

  // Master Button: Publish ALL preset packs at once!
  const handlePublishAllPacks = async () => {
    if (!confirm('هل تريد نشر جميع الباقات السابقة (8+ قصص جديدة متكاملة) فوراً إلى الموقع وفايربيز؟')) {
      return;
    }

    playClickSound();
    setPublishingPackId('all');
    setStatusMessage('جارٍ نشر جميع باقات القصص التأسيسية دفعة واحدة إلى Firebase...');

    try {
      let totalCount = 0;
      for (const pack of PRESET_STORY_PACKS) {
        for (const st of pack.stories) {
          await publishStoryToFirestore({
            ...st,
            authorEmail: 'hadjerrimas2016@gmail.com',
            authorId: 'admin',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });
          onSaveStory(st);
          totalCount++;
        }
      }

      playFanfareSound();
      confetti({ particleCount: 120, spread: 90 });
      setPublishedCount((prev) => prev + totalCount);
      setStatusMessage(`ألف مبروك! تم نشر ${totalCount} قصة جديدة بالكامل بنجاح في Firebase! 🎉`);
      setTimeout(() => setStatusMessage(''), 5000);
    } catch (err: any) {
      alert(`خطأ أثناء النشر الجماعي: ${err?.message || err}`);
      setStatusMessage('');
    } finally {
      setPublishingPackId(null);
    }
  };

  // Add a new empty custom story card
  const handleAddBatchCard = () => {
    playPopSound();
    setBatchStories((prev) => [
      ...prev,
      {
        id: `batch-${Date.now()}-${prev.length + 1}`,
        title: '',
        subtitle: 'مغامرة جديدة ممتعة',
        category: 'fantasy',
        categoryLabel: 'قصص خيالية',
        categoryIcon: '✨',
        ageRange: '6 - 10 سنوات',
        coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
        description: '',
        moralLesson: 'الأخلاق الفاضلة كنز الإنسان.',
        page1Text: '',
        page2Text: '',
        quizQuestion: '',
        quizOption1: '',
        quizOption2: '',
      },
    ]);
  };

  // Remove a custom story card
  const handleRemoveBatchCard = (id: string) => {
    playClickSound();
    setBatchStories((prev) => prev.filter((b) => b.id !== id));
  };

  // Publish all written custom batch stories
  const handlePublishCustomBatch = async () => {
    const validStories = batchStories.filter((b) => b.title.trim() && b.page1Text.trim());
    if (validStories.length === 0) {
      alert('يرجى ملء عنوان القصة وصفحة واحدة على الأقل لقصة واحدة قبل النشر!');
      return;
    }

    setPublishingPackId('custom');
    setStatusMessage(`جارٍ نشر ${validStories.length} قصة مخصصة إلى Firebase...`);

    try {
      let count = 0;
      for (const b of validStories) {
        const pages = [{ text: b.page1Text.trim() }];
        if (b.page2Text.trim()) pages.push({ text: b.page2Text.trim() });

        const quiz = b.quizQuestion.trim()
          ? [
              {
                question: b.quizQuestion.trim(),
                options: [b.quizOption1.trim() || 'الإجابة الأولى', b.quizOption2.trim() || 'الإجابة الثانية'],
                correctIndex: 0,
                explanation: 'أحسنت يا بطل!',
              },
            ]
          : [];

        const newStory: Story = {
          id: b.id,
          title: b.title.trim(),
          subtitle: b.subtitle.trim() || 'قصة مشوقة للأبطال',
          category: b.category,
          categoryLabel: b.categoryLabel,
          categoryIcon: b.categoryIcon,
          ageRange: b.ageRange,
          duration: '06:00',
          badge: 'جديد',
          coverImage: b.coverImage || '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png',
          description: b.description.trim() || b.page1Text.slice(0, 100),
          highlightText: 'قصة موثقة على المنصة',
          moralLesson: b.moralLesson.trim() || 'العلم والأخلاق ينيران المستقبل.',
          pages,
          quiz,
        };

        await publishStoryToFirestore({
          ...newStory,
          authorEmail: 'hadjerrimas2016@gmail.com',
          authorId: 'admin',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
        onSaveStory(newStory);
        count++;
      }

      playFanfareSound();
      confetti({ particleCount: 90, spread: 80 });
      setStatusMessage(`تم نشر ${count} قصة مخصصة بنجاح في Firebase والموقع! 🎉`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      alert(`خطأ أثناء نشر القصص: ${err?.message || err}`);
    } finally {
      setPublishingPackId(null);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#180e36] via-[#100926] to-[#0a0518] border-2 border-amber-400/60 shadow-2xl space-y-5 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-xl shadow-lg">
            <Zap className="w-6 h-6 fill-current" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-amber-300">
                استوديو النشر الفوري لقصص متعددة دفعة واحدة 🚀
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/40">
                خاص بالمالك 👑
              </span>
            </div>
            <p className="text-xs text-purple-200/80">
              انشر باقات قصص جاهزة أو أنشئ قصصاً متعددة دفعة واحدة بضغطة زر دون تكرار الخطوات!
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Notice Toast */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('packs');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'packs'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow'
              : 'text-purple-200 hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>باقات القصص الجاهزة للنشر الفوري (8+ قصص)</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('customBatch');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'customBatch'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
              : 'text-purple-200 hover:bg-white/10'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>مُنشئ القصص المتعددة المخصص ({batchStories.length})</span>
        </button>
      </div>

      {/* TAB 1: PRESET STORY PACKS */}
      {activeTab === 'packs' && (
        <div className="space-y-4">
          {/* Master 1-Click Button */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-pink-500/20 border-2 border-amber-400/70 shadow-xl flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-0.5">
              <h4 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                <span>🌟 الزر الذهبي: نشر جميع الباقات السابقة دفعة واحدة</span>
              </h4>
              <p className="text-xs text-purple-200/90">
                ينشر 8+ قصص متكاملة (شهرزاد، طبخ وفيديو، فضاء وعلوم) مع صفحاتها واختباراتها وصورها فوراً إلى Firebase!
              </p>
            </div>

            <button
              onClick={handlePublishAllPacks}
              disabled={publishingPackId !== null}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              {publishingPackId === 'all' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ النشر الجماعي السحابي...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>نشر جميع الباقات فوراً إلى Firebase 🚀</span>
                </>
              )}
            </button>
          </div>

          {/* Individual Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {PRESET_STORY_PACKS.map((pack) => {
              const isPublishing = publishingPackId === pack.id;
              return (
                <div
                  key={pack.id}
                  className={`p-4 rounded-3xl bg-gradient-to-b ${pack.color} border shadow-lg space-y-3 flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{pack.icon}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-amber-300 text-[10px] font-black border border-white/10">
                        {pack.badge}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white">{pack.title}</h4>

                    <div className="space-y-1.5 pt-1">
                      {pack.stories.map((st, idx) => (
                        <div key={st.id} className="p-2 rounded-xl bg-white/5 border border-white/5 text-xs space-y-0.5">
                          <span className="font-bold text-amber-300 block truncate">
                            {idx + 1}. {st.title}
                          </span>
                          <span className="text-[10px] text-purple-200/70 block truncate">
                            {st.subtitle}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePublishPack(pack)}
                    disabled={publishingPackId !== null}
                    className="w-full mt-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جارٍ النشر...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>نشر هذه الباقة فوراً ({pack.stories.length} قصص)</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM BATCH STORY CREATOR */}
      {activeTab === 'customBatch' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-purple-200">
              اكتب وحرر {batchStories.length} قصص هنا ثم انقر "نشر كل القصص" لنقلها إلى Firebase دفعة واحدة:
            </span>

            <button
              onClick={handleAddBatchCard}
              className="px-3 py-1.5 rounded-xl bg-purple-700/60 hover:bg-purple-600 text-white text-xs font-black flex items-center gap-1 transition-all cursor-pointer border border-purple-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قصة أخرى إلى القائمة (+1)</span>
            </button>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
            {batchStories.map((bStory, idx) => (
              <div
                key={bStory.id}
                className="p-4 rounded-2xl bg-white/5 border border-purple-600/40 space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    <span>القصة رقم {idx + 1}</span>
                  </span>

                  {batchStories.length > 1 && (
                    <button
                      onClick={() => handleRemoveBatchCard(bStory.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                      title="حذف هذه القصة من القائمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400">عنوان القصة:</label>
                    <input
                      type="text"
                      value={bStory.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBatchStories((prev) =>
                          prev.map((s) => (s.id === bStory.id ? { ...s, title: val } : s))
                        );
                      }}
                      placeholder="عنوان القصة الممتعة"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400">العنوان الفرعي:</label>
                    <input
                      type="text"
                      value={bStory.subtitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBatchStories((prev) =>
                          prev.map((s) => (s.id === bStory.id ? { ...s, subtitle: val } : s))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-purple-300">نص الصفحة الأولى (Page 1):</label>
                  <textarea
                    rows={2}
                    value={bStory.page1Text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBatchStories((prev) =>
                        prev.map((s) => (s.id === bStory.id ? { ...s, page1Text: val } : s))
                      );
                    }}
                    placeholder="اكتب بداية القصة هنا..."
                    className="w-full p-2 rounded-xl bg-white/10 border border-purple-700 text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-purple-300">نص الصفحة الثانية (Page 2 - اختياري):</label>
                  <textarea
                    rows={2}
                    value={bStory.page2Text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBatchStories((prev) =>
                        prev.map((s) => (s.id === bStory.id ? { ...s, page2Text: val } : s))
                      );
                    }}
                    placeholder="تكملة ونهاية القصة..."
                    className="w-full p-2 rounded-xl bg-white/10 border border-purple-700 text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-purple-300">العبرة والدرس المستفاد:</label>
                    <input
                      type="text"
                      value={bStory.moralLesson}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBatchStories((prev) =>
                          prev.map((s) => (s.id === bStory.id ? { ...s, moralLesson: val } : s))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-purple-300">سؤال الاختبار للطفل:</label>
                    <input
                      type="text"
                      value={bStory.quizQuestion}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBatchStories((prev) =>
                          prev.map((s) => (s.id === bStory.id ? { ...s, quizQuestion: val } : s))
                        );
                      }}
                      placeholder="سؤال بسيط وممتع..."
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-purple-700 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              onClick={handleAddBatchCard}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قصة أخرى</span>
            </button>

            <button
              onClick={handlePublishCustomBatch}
              disabled={publishingPackId !== null}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              {publishingPackId === 'custom' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ النشر الجماعي إلى Firebase...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>نشر كل القصص المكتوبة فوراً ({batchStories.length} قصص) 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
