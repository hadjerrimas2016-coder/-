/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppMode, ActiveTab, Story, PictureBook, UserAudioRecording, SupportedLanguage, SunnahItem, HeroVideoSettings, DEFAULT_HERO_VIDEO } from './types';
import { STORIES_DATA } from './data/storiesData';
import { DEFAULT_PICTURE_BOOK, PRESET_PICTURE_BOOKS } from './data/pictureBooksData';
import { DEFAULT_SUNNAH_ITEMS } from './data/sunnahData';
import { SunnahCorner } from './components/SunnahCorner';
import { SkyBackground } from './components/SkyBackground';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeHero } from './components/HomeHero';
import { StoriesLibrary } from './components/StoriesLibrary';
import { DrawingStudio } from './components/DrawingStudio';
import { ShapeBuilder } from './components/ShapeBuilder';
import { GamesCorner } from './components/GamesCorner';
import { ProfileModal } from './components/ProfileModal';
import { StoryModal } from './components/StoryModal';
import { SleepRadioModal } from './components/SleepRadioModal';
import { SpaceMiniGameModal } from './components/SpaceMiniGameModal';
import { ChallengesMapModal } from './components/ChallengesMapModal';
import { MemorizationHelperModal } from './components/MemorizationHelperModal';
import { StoryAuthoringModal } from './components/StoryAuthoringModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { PictureBookModal } from './components/PictureBookModal';
import { ReadingClub } from './components/ReadingClub';
import { ForeignLanguagesCorner } from './components/ForeignLanguagesCorner';
import { ShahrazadCorner } from './components/ShahrazadCorner';
import { CookingCorner } from './components/CookingCorner';
import { DEFAULT_COOKING_STORIES } from './data/cookingStoriesData';
import { playSparkleSound } from './utils/audio';
import {
  auth,
  isOwnerAdmin,
  subscribeToStories,
  subscribeToPictureBooks,
  publishPictureBookToFirestore,
  deletePictureBookFromFirestore,
  subscribeToSunnah,
  subscribeToHeroVideo,
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [mode, setMode] = useState<AppMode>('night');
  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('ar');
  const [stories, setStories] = useState<Story[]>(() => {
    const list = [...STORIES_DATA];
    for (const cs of DEFAULT_COOKING_STORIES) {
      if (!list.some((s) => s.id === cs.id)) {
        list.push(cs);
      }
    }
    return list;
  });
  const [pictureBook, setPictureBook] = useState<PictureBook>(() => {
    try {
      const saved = localStorage.getItem('raed_picture_book');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_PICTURE_BOOK;
  });
  const [allPictureBooks, setAllPictureBooks] = useState<PictureBook[]>(() => {
    try {
      const saved = localStorage.getItem('raed_all_picture_books');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return PRESET_PICTURE_BOOKS;
  });
  const [sunnahItems, setSunnahItems] = useState<SunnahItem[]>(DEFAULT_SUNNAH_ITEMS);
  const [heroVideo, setHeroVideo] = useState<HeroVideoSettings>(() => {
    try {
      const saved = localStorage.getItem('raed_hero_video_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_HERO_VIDEO;
  });
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [starsCount, setStarsCount] = useState<number>(350);
  const [favorites, setFavorites] = useState<string[]>(['raed-mars', 'little-prince', 'bilingual-little-astronaut']);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // User recordings for all kids / visitors (مكتبتي الصوتية)
  const [userRecordings, setUserRecordings] = useState<UserAudioRecording[]>([]);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // Modals state
  const [showSleepRadio, setShowSleepRadio] = useState<boolean>(false);
  const [showSpaceGame, setShowSpaceGame] = useState<boolean>(false);
  const [showChallengesMap, setShowChallengesMap] = useState<boolean>(false);
  const [showMemorizeHelper, setShowMemorizeHelper] = useState<boolean>(false);
  const [showStoryAuthoring, setShowStoryAuthoring] = useState<boolean>(false);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [showPictureBook, setShowPictureBook] = useState<boolean>(false);
  const [openPictureBookPublisherDirect, setOpenPictureBookPublisherDirect] = useState<boolean>(false);

  // Listen to Auth State
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Listen to Firestore real-time updates for Stories & PictureBooks
  useEffect(() => {
    const unsubStories = subscribeToStories((cloudStories: Story[]) => {
      if (cloudStories && cloudStories.length > 0) {
        const merged = [...cloudStories];
        for (const defaultStory of STORIES_DATA) {
          if (!merged.some((s) => s.id === defaultStory.id)) {
            merged.push(defaultStory);
          }
        }
        for (const cookingStory of DEFAULT_COOKING_STORIES) {
          if (!merged.some((s) => s.id === cookingStory.id)) {
            merged.push(cookingStory);
          }
        }
        setStories(merged);
        try {
          localStorage.setItem('raed_published_stories', JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
    });

    const unsubBooks = subscribeToPictureBooks((cloudBooks: PictureBook[]) => {
      if (cloudBooks && cloudBooks.length > 0) {
        setAllPictureBooks((prev) => {
          const merged = [...cloudBooks];
          for (const preset of PRESET_PICTURE_BOOKS) {
            if (!merged.some((b) => b.id === preset.id)) {
              merged.push(preset);
            }
          }
          try {
            localStorage.setItem('raed_all_picture_books', JSON.stringify(merged));
          } catch {}
          return merged;
        });

        setPictureBook((current) => {
          const matched = cloudBooks.find((b) => b.id === current.id);
          if (matched && Array.isArray(matched.pages) && matched.pages.length > 0) {
            try {
              localStorage.setItem('raed_picture_book', JSON.stringify(matched));
            } catch {}
            return matched;
          }
          return current;
        });
      }
    });

    const unsubSunnah = subscribeToSunnah((cloudItems: SunnahItem[]) => {
      if (cloudItems && cloudItems.length > 0) {
        const merged = [...cloudItems];
        for (const defaultItem of DEFAULT_SUNNAH_ITEMS) {
          if (!merged.some((i) => i.id === defaultItem.id)) {
            merged.push(defaultItem);
          }
        }
        setSunnahItems(merged);
        try {
          localStorage.setItem('raed_sunnah_items', JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
    });

    const unsubHeroVideo = subscribeToHeroVideo((cloudVideoSettings: any) => {
      if (cloudVideoSettings && cloudVideoSettings.videoUrl) {
        setHeroVideo(cloudVideoSettings);
        try {
          localStorage.setItem('raed_hero_video_settings', JSON.stringify(cloudVideoSettings));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      unsubStories();
      unsubBooks();
      unsubSunnah();
      unsubHeroVideo();
    };
  }, []);

  // Load state from localStorage on first render
  useEffect(() => {
    try {
      const savedStars = localStorage.getItem('raed_stars_count');
      if (savedStars) setStarsCount(parseInt(savedStars, 10));

      const savedMode = localStorage.getItem('raed_app_mode') as AppMode;
      if (savedMode) setMode(savedMode);

      const savedLang = localStorage.getItem('raed_app_lang') as SupportedLanguage;
      if (savedLang) {
        setCurrentLang(savedLang);
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      }

      const savedFavs = localStorage.getItem('raed_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedStories = localStorage.getItem('raed_published_stories');
      if (savedStories) {
        setStories(JSON.parse(savedStories));
      }

      const savedBook = localStorage.getItem('raed_picture_book');
      if (savedBook) {
        try {
          const parsed = JSON.parse(savedBook);
          if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
            setPictureBook({
              ...DEFAULT_PICTURE_BOOK,
              ...parsed,
            });
          } else {
            setPictureBook(DEFAULT_PICTURE_BOOK);
          }
        } catch {
          setPictureBook(DEFAULT_PICTURE_BOOK);
        }
      } else {
        setPictureBook(DEFAULT_PICTURE_BOOK);
      }

      const savedRecordings = localStorage.getItem('raed_user_recordings');
      if (savedRecordings) {
        setUserRecordings(JSON.parse(savedRecordings));
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  const handleToggleMode = () => {
    const nextMode = mode === 'day' ? 'night' : 'day';
    setMode(nextMode);
    try {
      localStorage.setItem('raed_app_mode', nextMode);
    } catch {
      // ignore
    }
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem('raed_app_lang', lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleEarnStars = (amount: number) => {
    playSparkleSound();
    setStarsCount((prev) => {
      const updated = prev + amount;
      try {
        localStorage.setItem('raed_stars_count', updated.toString());
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleToggleFavorite = (storyId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId];
      try {
        localStorage.setItem('raed_favorites', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSaveAdminStory = (storyToSave: Story) => {
    setStories((prev) => {
      const exists = prev.some((s) => s.id === storyToSave.id);
      const updated = exists
        ? prev.map((s) => (s.id === storyToSave.id ? storyToSave : s))
        : [storyToSave, ...prev];
      try {
        localStorage.setItem('raed_published_stories', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteStory = (storyId: string) => {
    setStories((prev) => {
      const updated = prev.filter((s) => s.id !== storyId);
      try {
        localStorage.setItem('raed_published_stories', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSavePictureBook = (updatedBook: PictureBook) => {
    setPictureBook(updatedBook);
    setAllPictureBooks((prev) => {
      const exists = prev.some((b) => b.id === updatedBook.id);
      const updated = exists
        ? prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
        : [updatedBook, ...prev];
      try {
        localStorage.setItem('raed_all_picture_books', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      localStorage.setItem('raed_picture_book', JSON.stringify(updatedBook));
    } catch {
      // ignore
    }
    publishPictureBookToFirestore(updatedBook).catch(() => {});
  };

  const handleDeletePictureBook = (bookId: string) => {
    setAllPictureBooks((prev) => {
      const filtered = prev.filter((b) => b.id !== bookId);
      const safe = filtered.length > 0 ? filtered : PRESET_PICTURE_BOOKS;
      try {
        localStorage.setItem('raed_all_picture_books', JSON.stringify(safe));
      } catch {
        // ignore
      }
      return safe;
    });
    setPictureBook((current) => {
      if (current.id === bookId) {
        const fallback = PRESET_PICTURE_BOOKS[0];
        try {
          localStorage.setItem('raed_picture_book', JSON.stringify(fallback));
        } catch {
          // ignore
        }
        return fallback;
      }
      return current;
    });
    deletePictureBookFromFirestore(bookId).catch(() => {});
  };

  const handleSaveHeroVideo = (settingsToSave: HeroVideoSettings) => {
    setHeroVideo(settingsToSave);
    try {
      localStorage.setItem('raed_hero_video_settings', JSON.stringify(settingsToSave));
    } catch {
      // ignore
    }
  };

  const handleSaveSunnahItem = (itemToSave: SunnahItem) => {
    setSunnahItems((prev) => {
      const exists = prev.some((i) => i.id === itemToSave.id);
      const updated = exists
        ? prev.map((i) => (i.id === itemToSave.id ? itemToSave : i))
        : [itemToSave, ...prev];
      try {
        localStorage.setItem('raed_sunnah_items', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteSunnahItem = (id: string) => {
    setSunnahItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem('raed_sunnah_items', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSaveUserRecording = (rec: UserAudioRecording) => {
    setUserRecordings((prev) => {
      const updated = [rec, ...prev];
      try {
        localStorage.setItem('raed_user_recordings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteUserRecording = (id: string) => {
    setUserRecordings((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('raed_user_recordings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'challenges') {
      setShowChallengesMap(true);
    } else if (tab === 'memorize') {
      setShowMemorizeHelper(true);
    } else {
      setCurrentTab(tab);
    }
  };

  const isOwner = isOwnerAdmin(currentUser);

  return (
    <div
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen relative font-['Baloo_Bhaijaan_2',_'Nunito',_system-ui,_sans-serif] transition-colors duration-700 pb-20 sm:pb-10 ${
        mode === 'day' ? 'text-slate-800' : 'text-slate-100'
      }`}
    >
      {/* Dynamic Animated Sky Background: Clouds in Day mode, Stars in Night mode */}
      <SkyBackground mode={mode} />

      {/* Main Top Header with Universal Language Selector & Translation */}
      <Header
        mode={mode}
        onToggleMode={handleToggleMode}
        starsCount={starsCount}
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(!soundMuted)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSleepRadio={() => setShowSleepRadio(true)}
        onOpenAdmin={() => setShowAdminPanel(true)}
        currentUser={currentUser}
        isOwnerAdmin={isOwner}
        currentLang={currentLang}
        onSelectLang={handleSelectLanguage}
      />

      {/* Primary Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        mode={mode}
        currentLang={currentLang}
      />

      {/* Dynamic Main Views */}
      <main className="transition-opacity duration-300">
        {currentTab === 'sunnah' && (
          <SunnahCorner
            items={sunnahItems}
            mode={mode}
            onAddStar={() => handleEarnStars(5)}
          />
        )}
        {currentTab === 'home' && (
          <HomeHero
            mode={mode}
            stories={stories}
            pictureBook={pictureBook}
            heroVideoSettings={heroVideo}
            starsCount={starsCount}
            onOpenStory={setActiveStory}
            onOpenPictureBook={() => setShowPictureBook(true)}
            onSelectTab={handleSelectTab}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenSpaceGame={() => setShowSpaceGame(true)}
            onOpenChallengesMap={() => setShowChallengesMap(true)}
            onOpenSleepRadio={() => setShowSleepRadio(true)}
            onOpenMemorizeHelper={() => setShowMemorizeHelper(true)}
            onOpenStoryAuthoring={() => setShowStoryAuthoring(true)}
          />
        )}

        {currentTab === 'shahrazad' && (
          <ShahrazadCorner
            mode={mode}
            stories={stories}
            onOpenStory={setActiveStory}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onEarnStars={handleEarnStars}
            onSaveUserRecording={handleSaveUserRecording}
          />
        )}

        {currentTab === 'reading_club' && (
          <ReadingClub
            mode={mode}
            userRecordings={userRecordings}
            starsCount={starsCount}
            onEarnStars={handleEarnStars}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'cooking' && (
          <CookingCorner
            stories={stories}
            mode={mode}
            onOpenStory={setActiveStory}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onEarnStars={handleEarnStars}
            onSaveUserRecording={handleSaveUserRecording}
            onOpenAdmin={() => setShowAdminPanel(true)}
          />
        )}

        {currentTab === 'foreign_languages' && (
          <ForeignLanguagesCorner
            stories={stories}
            mode={mode}
            onOpenStory={setActiveStory}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onEarnStars={handleEarnStars}
          />
        )}

        {currentTab === 'library' && (
          <StoriesLibrary
            stories={stories}
            mode={mode}
            onOpenStory={setActiveStory}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            pictureBook={pictureBook}
            onOpenPictureBook={() => setShowPictureBook(true)}
          />
        )}

        {currentTab === 'draw' && (
          <DrawingStudio
            mode={mode}
            onEarnStars={handleEarnStars}
          />
        )}

        {currentTab === 'shapes' && (
          <ShapeBuilder
            mode={mode}
            onEarnStars={handleEarnStars}
          />
        )}

        {currentTab === 'challenges' && (
          <ChallengesMapModal
            mode={mode}
            onClose={() => setCurrentTab('home')}
            starsCount={starsCount}
            onEarnStars={handleEarnStars}
            stories={stories}
            onSelectStoryById={(id) => {
              const found = stories.find((s) => s.id === id);
              if (found) setActiveStory(found);
            }}
          />
        )}

        {currentTab === 'games' && (
          <GamesCorner
            mode={mode}
            onEarnStars={handleEarnStars}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileModal
            mode={mode}
            starsCount={starsCount}
            favoriteIds={favorites}
            totalStoriesCount={stories.length}
            currentUser={currentUser}
            onOpenAdmin={() => setShowAdminPanel(true)}
            userRecordings={userRecordings}
            onDeleteRecording={handleDeleteUserRecording}
          />
        )}
      </main>

      {/* Story Player & Reader Modal */}
      {activeStory && (
        <StoryModal
          story={activeStory}
          mode={mode}
          onClose={() => setActiveStory(null)}
          onEarnStars={handleEarnStars}
          isFavorite={favorites.includes(activeStory.id)}
          onToggleFavorite={handleToggleFavorite}
          onSaveUserRecording={handleSaveUserRecording}
        />
      )}

      {/* Sleep Radio Modal (راديو النوم 🌙) */}
      {showSleepRadio && (
        <SleepRadioModal
          mode={mode}
          onClose={() => setShowSleepRadio(false)}
        />
      )}

      {/* 3D Space Rocket Game Modal (لعبة الفضاء 3D 🚀) */}
      {showSpaceGame && (
        <SpaceMiniGameModal
          mode={mode}
          onClose={() => setShowSpaceGame(false)}
          onEarnStars={handleEarnStars}
        />
      )}

      {/* Challenges Adventure Map (خريطة التحديات 🎯) */}
      {showChallengesMap && (
        <ChallengesMapModal
          mode={mode}
          onClose={() => setShowChallengesMap(false)}
          starsCount={starsCount}
          onEarnStars={handleEarnStars}
          stories={stories}
          onSelectStoryById={(id) => {
            const found = stories.find((s) => s.id === id);
            if (found) setActiveStory(found);
          }}
        />
      )}

      {/* Memorization & Recital Assistant (ساعدني على الحفظ 🎙️) */}
      {showMemorizeHelper && (
        <MemorizationHelperModal
          mode={mode}
          onClose={() => setShowMemorizeHelper(false)}
          onEarnStars={handleEarnStars}
        />
      )}

      {/* Story Authoring & Drawing for Kids (تأليف قصة ورسم ✍️) */}
      {showStoryAuthoring && (
        <StoryAuthoringModal
          mode={mode}
          onClose={() => setShowStoryAuthoring(false)}
          onSaveStory={handleSaveAdminStory}
          onEarnStars={handleEarnStars}
        />
      )}

      {/* Admin Panel Modal (لوحة تحكم المشرف الحصرية والمحمية لمالك المنصة) */}
      {showAdminPanel && (
        <AdminPanelModal
          mode={mode}
          stories={stories}
          pictureBook={pictureBook}
          sunnahItems={sunnahItems}
          heroVideoSettings={heroVideo}
          onSaveHeroVideo={handleSaveHeroVideo}
          onClose={() => setShowAdminPanel(false)}
          onSaveStory={handleSaveAdminStory}
          onDeleteStory={handleDeleteStory}
          onSavePictureBook={handleSavePictureBook}
          onSaveSunnahItem={handleSaveSunnahItem}
          onDeleteSunnahItem={handleDeleteSunnahItem}
        />
      )}

      {/* 10-Page Interactive Picture Book Modal (كتاب مصور تفاعلي بالصفحات والصوت 💎) */}
      {showPictureBook && (
        <PictureBookModal
          book={pictureBook}
          allBooks={allPictureBooks}
          mode={mode}
          onClose={() => {
            setShowPictureBook(false);
            setOpenPictureBookPublisherDirect(false);
          }}
          onEarnStars={handleEarnStars}
          onUpdateBook={handleSavePictureBook}
          onSelectBook={(selected) => setPictureBook(selected)}
          onDeleteBook={handleDeletePictureBook}
          onSaveUserRecording={handleSaveUserRecording}
          existingRecordings={userRecordings}
          initialOpenPublisher={openPictureBookPublisherDirect}
        />
      )}
    </div>
  );
}
