export type AppMode = 'day' | 'night';

export type ActiveTab = 
  | 'home' 
  | 'cinema'
  | 'cooking'
  | 'reading_club'
  | 'foreign_languages'
  | 'shahrazad'
  | 'my_story'
  | 'library'
  | 'games'
  | 'religious_stories'
  | 'sunnah'
  | 'challenges' 
  | 'memorize' 
  | 'draw' 
  | 'shapes' 
  | 'profile';

export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'es' | 'de' | 'tr';

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  category: 
    | 'fantasy' 
    | 'space' 
    | 'letters' 
    | 'numbers' 
    | 'nature' 
    | 'adventure' 
    | 'science' 
    | 'shahrazad' 
    | 'heritage' 
    | 'knowledge' 
    | 'sleep' 
    | 'languages'
    | 'foreign_languages'
    | 'cooking'
    | 'religious_stories'
    | 'sunnah';
  categoryLabel: string;
  categoryIcon: string;
  ageRange: string;
  duration: string;
  badge?: string;
  bannerImage?: string;
  coverImage: string;
  audioUrl?: string; // Audio narration track for the story
  videoUrl?: string; // Optional video story (e.g. for cooking stories)
  ingredients?: { name: string; amount?: string; emoji?: string }[];
  recipeSteps?: string[];
  prepTimeMinutes?: number;
  description: string;
  highlightText: string;
  progressPercent?: number;
  pages: {
    text: string;
    tashkeelText?: string;
    imagePromptText?: string;
    pageImage?: string;
    interactiveElements?: {
      id: string;
      label: string;
      emoji: string;
      sound: 'sparkle' | 'pop' | 'chime' | 'roar';
      message: string;
    }[];
  }[];
  moralLesson: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export type SunnahType = 'surah' | 'duaa' | 'dhikr';

export interface SunnahItem {
  id: string;
  title: string;
  subtitle?: string;
  type: SunnahType;
  category: 'daily' | 'sleep' | 'morning_evening' | 'surah' | 'study' | 'meals_travel';
  categoryLabel?: string;
  arabicText: string;
  tashkeelText?: string;
  translation?: string;
  explanation?: string;
  virtue?: string; // فضل السورة أو الدعاء للأطفال
  repeatCount: number; // عدد مرات الترديد أو التسبيح
  audioUrl?: string;
  icon?: string;
  badge?: string;
  isDailyDuaa?: boolean;
  isFavorite?: boolean;
  order?: number;
  authorEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShahrazadCharacter {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  role: string;
  avatarEmoji: string;
  image: string;
  storyId?: string;
  description: string;
  badge: string;
  themeGradient: string;
  accentColor: string;
  borderGlow: string;
  voiceQuote: string;
  companionTip: string;
  traits: string[];
  visualAura?: string;
}

export interface PictureBookPage {
  pageNumber: number;
  chapterTitle: string;
  image: string;
  text: string;
  tashkeelText: string;
  audioDuration?: string;
}

export interface PictureBook {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  coverImage: string;
  ageRange: string;
  totalPages: number;
  creatorsAudioUrl?: string; // Official MP3 track
  moralLesson: string;
  pages: PictureBookPage[];
  authorEmail?: string;
  updatedAt?: string;
  createdAt?: string;
  gapBetweenPagesSec?: number;
  fullStoryAudioUrl?: string;
}

export interface ShapeItem {
  id: string;
  type: 'triangle' | 'square' | 'circle' | 'rectangle' | 'semicircle' | 'star' | 'diamond';
  color: string;
  label: string;
  width: number;
  height: number;
  rotation?: number;
  x?: number;
  y?: number;
}

export interface ShapePuzzleTemplate {
  id: string;
  name: string;
  difficulty: 'سهل' | 'متوسط' | 'ممتع';
  previewIcon: string;
  description: string;
  targets: {
    id: string;
    type: ShapeItem['type'];
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    matched?: boolean;
    colorHint: string;
  }[];
}

export interface SavedDrawing {
  id: string;
  title: string;
  dataUrl: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requiredStars: number;
}

export interface UserAudioRecording {
  id: string;
  title: string;
  storyTitle?: string;
  storyId?: string;
  pageNumber?: number;
  createdAt: string;
  durationSec: number;
  audioBlobUrl: string;
  audioUrl?: string;
  scorePoints?: number;
}

export interface HeroVideoSettings {
  enabled: boolean;
  videoUrl: string;
  title: string;
  subtitle: string;
  badge: string;
  autoPlay: boolean;
  loop: boolean;
}

export const DEFAULT_HERO_VIDEO: HeroVideoSettings = {
  enabled: true,
  videoUrl: '/assets/aistudio/video_z5xqdjk5_20261021184400_87b84f16.mp4',
  title: 'مرحبًا بكم في عالم رائد السحري',
  subtitle: 'شاهد مغامرة القلعة الساحرة بالفيديو المتحرك كي لا تمل أثناء استكشاف القصص والألعاب!',
  badge: 'سينما رائد التفاعلية ✨',
  autoPlay: true,
  loop: true,
};

export interface ReadingClubUser {
  id: string;
  name: string;
  avatar: string;
  isPublic: boolean;
  totalStars: number;
  rankTitle: string;
  bio?: string;
  joinedDate: string;
  recordedStories: UserAudioRecording[];
  likesCount: number;
  cheersCount: number;
}

export interface ReadingClubStory {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  summary: string;
  category: 'fantasy' | 'adventure' | 'foreign_languages' | 'nature' | 'science';
  audioBlobUrl?: string;
  audioDurationSec?: number;
  likes: number;
  createdAt: string;
  tags?: string[];
  comments?: {
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: string;
  }[];
}

export interface CinemaMovie {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g. "12 دقيقة"
  category: string; // e.g. "مغامرة كرتونية"
  videoUrl: string; // YouTube URL or direct MP4/WebM
  coverImage: string; // Movie poster
  ageRating: string; // e.g. "جميع الأعمار 🌟"
  starsReward: number; // e.g. 30
  rating?: number;
  likesCount?: number;
  featured?: boolean;
  directorNote?: string;
  addedByOwner?: boolean;
}

