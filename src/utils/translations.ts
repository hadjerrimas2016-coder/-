import { SupportedLanguage } from '../types';

export interface TranslationDictionary {
  appName: string;
  appSlogan: string;
  pointsLabel: string;
  sleepRadio: string;
  signIn: string;
  signOut: string;
  ownerPortal: string;
  myAccount: string;
  homeTab: string;
  sunnahTab: string;
  challengesTab: string;
  libraryTab: string;
  gamesTab: string;
  memorizeTab: string;
  drawTab: string;
  shapesTab: string;
  profileTab: string;
  allStories: string;
  startReading: string;
  pictureBookBannerTitle: string;
  pictureBookBannerSub: string;
  openPictureBook: string;
  shahrazadTitle: string;
  shahrazadSub: string;
  favorites: string;
  searchPlaceholder: string;
  categories: string;
  languagesCategory: string;
  listenNarrator: string;
  stopNarrator: string;
  recordVoice: string;
  stopRecord: string;
  myAudioLibrary: string;
  savedAudios: string;
  playRecording: string;
  downloadAudio: string;
  deleteAudio: string;
  moralLessonTitle: string;
  quizTitle: string;
  nextPage: string;
  prevPage: string;
  close: string;
  dayMode: string;
  nightMode: string;
  translateNotice: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  ar: {
    appName: 'رائِد',
    appSlogan: 'قصص .. تعلّم .. مغامرات',
    pointsLabel: 'نقطة خيال',
    sleepRadio: 'راديو النوم 🌙',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    ownerPortal: 'لوحة المالك والنشر 👑',
    myAccount: 'حسابي',
    homeTab: 'الرئيسية',
    sunnahTab: 'قصص دينية وأدعية 🕌📖',
    challengesTab: 'خريطة التحديات',
    libraryTab: 'مكتبة القصص',
    gamesTab: 'ركن الألعاب',
    memorizeTab: 'ساعدني على الحفظ',
    drawTab: 'مرسم رائد',
    shapesTab: 'تركيب الأشكال',
    profileTab: 'الملف الشخصي',
    allStories: 'جميع القصص والمغامرات',
    startReading: 'ابدأ القراءة الآن',
    pictureBookBannerTitle: 'كتاب مصور تفاعلي بالصفحات والصوت',
    pictureBookBannerSub: 'قصة ليان وسر الجوهرة المصونة (10 صفحات ممتدة مع ميكروفون للأطفال)',
    openPictureBook: 'افتح الكتاب المصور 💎',
    shahrazadTitle: 'عالم شهرزاد وقصص ألف ليلة وليلة',
    shahrazadSub: 'حكايات أسطورية من التراث العربي الخالد مليئة بالحكمة والأسرار',
    favorites: 'المفضلة',
    searchPlaceholder: 'ابحث عن قصة، كوكب، بطل، أو مغامرة...',
    categories: 'التصنيفات',
    languagesCategory: 'قصص باللغات (Languages)',
    listenNarrator: 'استماع للقارئ',
    stopNarrator: 'إيقاف الاستماع',
    recordVoice: 'سجل صوتك بالقراءة',
    stopRecord: 'إيقاف التسجيل',
    myAudioLibrary: 'مكتبتي الصوتية',
    savedAudios: 'تسجيلاتي المحفوظة',
    playRecording: 'استماع للتسجيل',
    downloadAudio: 'تحميل التسجيل',
    deleteAudio: 'حذف التسجيل',
    moralLessonTitle: 'العبرة والقيمة المستفادة',
    quizTitle: 'اختبار ذكاء البطل',
    nextPage: 'الصفحة التالية',
    prevPage: 'الصفحة السابقة',
    close: 'إغلاق',
    dayMode: 'سماء السحب النهارية',
    nightMode: 'سماء النجوم الليلية',
    translateNotice: 'تم تفعيل الترجمة الفورية للموقع',
  },
  en: {
    appName: 'Raed',
    appSlogan: 'Stories .. Learning .. Adventures',
    pointsLabel: 'Imagination Points',
    sleepRadio: 'Sleep Radio 🌙',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    ownerPortal: 'Owner CMS Portal 👑',
    myAccount: 'My Profile',
    homeTab: 'Home',
    sunnahTab: 'Sunnah & Duas',
    challengesTab: 'Quest Map',
    libraryTab: 'Stories Library',
    gamesTab: 'Games Corner',
    memorizeTab: 'Memorize & Recite',
    drawTab: 'Drawing Studio',
    shapesTab: 'Shape Builder',
    profileTab: 'My Profile',
    allStories: 'All Stories & Adventures',
    startReading: 'Start Reading Now',
    pictureBookBannerTitle: 'Interactive Illustrated Picture Book',
    pictureBookBannerSub: 'Story of Lyan & The Protected Gem (10 Extended Pages with Kids Microphone)',
    openPictureBook: 'Open Picture Book 💎',
    shahrazadTitle: 'World of Shahrazad & 1001 Nights',
    shahrazadSub: 'Legendary Eastern folk tales filled with wisdom and wonder',
    favorites: 'Favorites',
    searchPlaceholder: 'Search for a story, hero, planet, or adventure...',
    categories: 'Categories',
    languagesCategory: 'Languages & Bilingual Stories',
    listenNarrator: 'Listen to Narrator',
    stopNarrator: 'Stop Audio',
    recordVoice: 'Record Your Voice',
    stopRecord: 'Stop Recording',
    myAudioLibrary: 'My Audio Library',
    savedAudios: 'My Voice Recordings',
    playRecording: 'Play Recording',
    downloadAudio: 'Download Audio',
    deleteAudio: 'Delete Recording',
    moralLessonTitle: 'Moral & Life Lesson',
    quizTitle: 'Hero Comprehension Quiz',
    nextPage: 'Next Page',
    prevPage: 'Previous Page',
    close: 'Close',
    dayMode: 'Day Clouds Sky',
    nightMode: 'Night Stars Sky',
    translateNotice: 'Instant website translation enabled',
  },
  fr: {
    appName: 'Raed',
    appSlogan: 'Histoires .. Apprentissage .. Aventures',
    pointsLabel: 'Points Magiques',
    sleepRadio: 'Radio du Sommeil 🌙',
    signIn: 'Connexion',
    signOut: 'Déconnexion',
    ownerPortal: 'Portail Propriétaire 👑',
    myAccount: 'Mon Compte',
    homeTab: 'Accueil',
    sunnahTab: 'Sunnah & Douas',
    challengesTab: 'Carte des Défis',
    libraryTab: 'Bibliothèque',
    gamesTab: 'Coin Jeux',
    memorizeTab: 'Aide à Mémoriser',
    drawTab: 'Atelier Dessin',
    shapesTab: 'Formes Magiques',
    profileTab: 'Mon Profil',
    allStories: 'Toutes les Histoires',
    startReading: 'Lire Maintenant',
    pictureBookBannerTitle: 'Livre Illustré Interactif et Audio',
    pictureBookBannerSub: 'Lyan et le Joyau Précieux (10 Pages avec Micro Enfant)',
    openPictureBook: 'Ouvrir le Livre 💎',
    shahrazadTitle: 'Le Monde de Shéhérazade & 1001 Nuits',
    shahrazadSub: 'Contes légendaires pleins de sagesse et de merveilles',
    favorites: 'Favoris',
    searchPlaceholder: 'Chercher une histoire, un héros ou une aventure...',
    categories: 'Catégories',
    languagesCategory: 'Histoires Multilingues',
    listenNarrator: 'Écouter la Voix',
    stopNarrator: 'Arrêter la Voix',
    recordVoice: 'Enregistrer ma Voix',
    stopRecord: 'Arrêter Enregistrement',
    myAudioLibrary: 'Ma Bibliothèque Vocale',
    savedAudios: 'Mes Enregistrements',
    playRecording: 'Écouter',
    downloadAudio: 'Télécharger',
    deleteAudio: 'Supprimer',
    moralLessonTitle: 'Morale et Sagesse',
    quizTitle: 'Quiz du Petit Héros',
    nextPage: 'Page Suivante',
    prevPage: 'Page Précédente',
    close: 'Fermer',
    dayMode: 'Ciel Nuageux de Jour',
    nightMode: 'Ciel Étoilé de Nuit',
    translateNotice: 'Traduction instantanée activée',
  },
  es: {
    appName: 'Raed',
    appSlogan: 'Cuentos .. Aprendizaje .. Aventuras',
    pointsLabel: 'Puntos de Fantasía',
    sleepRadio: 'Radio del Sueño 🌙',
    signIn: 'Iniciar Sesión',
    signOut: 'Cerrar Sesión',
    ownerPortal: 'Panel del Propietario 👑',
    myAccount: 'Mi Perfil',
    homeTab: 'Inicio',
    sunnahTab: 'Sunnah y Súplicas',
    challengesTab: 'Mapa de Retos',
    libraryTab: 'Biblioteca',
    gamesTab: 'Rincón de Juegos',
    memorizeTab: 'Ayuda a Memorizar',
    drawTab: 'Taller de Dibujo',
    shapesTab: 'Constructor de Formas',
    profileTab: 'Mi Perfil',
    allStories: 'Todos los Cuentos',
    startReading: 'Empezar a Leer',
    pictureBookBannerTitle: 'Libro Ilustrado Interactivo con Audio',
    pictureBookBannerSub: 'Lyan y la Joya Encantada (10 Páginas con Micrófono infantil)',
    openPictureBook: 'Abrir Libro 💎',
    shahrazadTitle: 'El Mundo de Sherezade y 1001 Noches',
    shahrazadSub: 'Cuentos legendarios llenos de sabiduría y maravilla',
    favorites: 'Favoritos',
    searchPlaceholder: 'Buscar un cuento, planeta, héroe o aventura...',
    categories: 'Categorías',
    languagesCategory: 'Cuentos en Idiomas',
    listenNarrator: 'Escuchar Narrador',
    stopNarrator: 'Detener Audio',
    recordVoice: 'Grabar mi Voz',
    stopRecord: 'Detener Grabación',
    myAudioLibrary: 'Mi Fonoteca Personal',
    savedAudios: 'Mis Grabaciones',
    playRecording: 'Reproducir',
    downloadAudio: 'Descargar',
    deleteAudio: 'Eliminar',
    moralLessonTitle: 'Lección y Valor Moral',
    quizTitle: 'Cuestionario del Héroe',
    nextPage: 'Página Siguiente',
    prevPage: 'Página Anterior',
    close: 'Cerrar',
    dayMode: 'Cielo Nublado de Día',
    nightMode: 'Cielo Estrellado de Noche',
    translateNotice: 'Traducción instantánea activada',
  },
  de: {
    appName: 'Raed',
    appSlogan: 'Geschichten .. Lernen .. Abenteuer',
    pointsLabel: 'Fantasiepunkte',
    sleepRadio: 'Schlaf-Radio 🌙',
    signIn: 'Anmelden',
    signOut: 'Abmelden',
    ownerPortal: 'Admin-Portal 👑',
    myAccount: 'Mein Profil',
    homeTab: 'Startseite',
    sunnahTab: 'Sunnah & Bittgebete',
    challengesTab: 'Abenteuerkarte',
    libraryTab: 'Bibliothek',
    gamesTab: 'Spieleecke',
    memorizeTab: 'Auswendiglernen',
    drawTab: 'Malstudio',
    shapesTab: 'Formenbau',
    profileTab: 'Mein Profil',
    allStories: 'Alle Geschichten',
    startReading: 'Jetzt Lesen',
    pictureBookBannerTitle: 'Interaktives Bilderbuch mit Audio',
    pictureBookBannerSub: 'Lyan und das geschützte Juwel (10 Seiten mit Mikrofon)',
    openPictureBook: 'Bilderbuch öffnen 💎',
    shahrazadTitle: 'Welt von Scheherazade & 1001 Nacht',
    shahrazadSub: 'Legendäre orientalische Märchen voller Weisheit',
    favorites: 'Favoriten',
    searchPlaceholder: 'Suche nach Geschichten, Planeten, Helden...',
    categories: 'Kategorien',
    languagesCategory: 'Sprachgeschichten',
    listenNarrator: 'Vorlesen anhören',
    stopNarrator: 'Audio stoppen',
    recordVoice: 'Stimme aufnehmen',
    stopRecord: 'Aufnahme stoppen',
    myAudioLibrary: 'Meine Audio-Bibliothek',
    savedAudios: 'Meine Aufnahmen',
    playRecording: 'Abspielen',
    downloadAudio: 'Herunterladen',
    deleteAudio: 'Löschen',
    moralLessonTitle: 'Moral & Lebenslektion',
    quizTitle: 'Helden-Quiz',
    nextPage: 'Nächste Seite',
    prevPage: 'Vorherige Seite',
    close: 'Schließen',
    dayMode: 'Tageshimmel mit Wolken',
    nightMode: 'Nachthimmel mit Sternen',
    translateNotice: 'Sofortige Übersetzung aktiviert',
  },
  tr: {
    appName: 'Raed',
    appSlogan: 'Hikayeler .. Öğrenme .. Maceralar',
    pointsLabel: 'Hayal Puanı',
    sleepRadio: 'Uyku Radyosu 🌙',
    signIn: 'Giriş Yap',
    signOut: 'Çıkış Yap',
    ownerPortal: 'Yönetici Paneli 👑',
    myAccount: 'Profilim',
    homeTab: 'Ana Sayfa',
    sunnahTab: 'Sünnet ve Dualar',
    challengesTab: 'Görev Haritası',
    libraryTab: 'Hikaye Kütüphanesi',
    gamesTab: 'Oyun Köşesi',
    memorizeTab: 'Ezberleme Yardımcısı',
    drawTab: 'Çizim Atölyesi',
    shapesTab: 'Şekil Yapıcı',
    profileTab: 'Profilim',
    allStories: 'Tüm Hikayeler',
    startReading: 'Hemen Oku',
    pictureBookBannerTitle: 'İnteraktif Sesli Resimli Kitap',
    pictureBookBannerSub: 'Lyan ve Korunan Mücevher (Mikrofonlu 10 Sayfa)',
    openPictureBook: 'Kitabı Aç 💎',
    shahrazadTitle: 'Şehrazat ve Binbir Gece Masalları',
    shahrazadSub: 'Hikmet dolu efsanevi Doğu masalları',
    favorites: 'Favoriler',
    searchPlaceholder: 'Hikaye, kahraman veya macera ara...',
    categories: 'Kategoriler',
    languagesCategory: 'Dillerde Hikayeler',
    listenNarrator: 'Dinle',
    stopNarrator: 'Durdur',
    recordVoice: 'Sesini Kaydet',
    stopRecord: 'Kaydı Durdur',
    myAudioLibrary: 'Ses Kütüphanem',
    savedAudios: 'Kayıtlarım',
    playRecording: 'Oynat',
    downloadAudio: 'İndir',
    deleteAudio: 'Sil',
    moralLessonTitle: 'Kıssadan Hisse',
    quizTitle: 'Kahraman Testi',
    nextPage: 'Sonraki Sayfa',
    prevPage: 'Önceki Sayfa',
    close: 'Kapat',
    dayMode: 'Gündüz Bulutlu Gökyüzü',
    nightMode: 'Gece Yıldızlı Gökyüzü',
    translateNotice: 'Anında web sitesi çevirisi etkinleştirildi',
  },
};

export const AVAILABLE_LANGUAGES: { code: SupportedLanguage; label: string; flag: string; dir: 'rtl' | 'ltr' }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', label: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
];

export function applyGoogleTranslation(targetLang: string) {
  try {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event('change'));
    } else {
      document.cookie = `googtrans=/ar/${targetLang}; path=/;`;
      document.cookie = `googtrans=/ar/${targetLang}; domain=${window.location.hostname}; path=/;`;
    }
  } catch (err) {
    console.warn('Google translate dispatch issue:', err);
  }
}
