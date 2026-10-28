// Curated Story Cover Artworks for user selection

export interface CuratedCoverCategory {
  category: string;
  badge: string;
  images: {
    id: string;
    title: string;
    url: string;
  }[];
}

export const CURATED_COVER_CATEGORIES: CuratedCoverCategory[] = [
  {
    category: 'أنا بطلة قصتي وليان 💖',
    badge: 'ليان',
    images: [
      {
        id: 'cov-layan-hero',
        title: 'ليان - أنا بطلة قصتي (قصص أحلام مغامرات)',
        url: '/assets/aistudio/b4cdd488-0afa-42cf-ab73-78c16f31ccb6_5a07aa6c.png',
      },
      {
        id: 'cov-layan-jewel',
        title: 'ليان وسر الجوهرة المصونة',
        url: '/assets/aistudio/Capture_d__cran_2026-10-20_135700_a8f3d8ee.png',
      },
      {
        id: 'cov-layan-morning',
        title: 'المسير الصباحي والمدرسة',
        url: '/assets/aistudio/Capture_d__cran_2026-10-20_135742_9bb46748.png',
      },
      {
        id: 'cov-layan-market',
        title: 'سوق الأقمشة والياسمين',
        url: '/assets/aistudio/Capture_d__cran_2026-10-17_165435_21ae23c9.png',
      },
    ],
  },
  {
    category: 'خيال وسحر وقلاع 🏰',
    badge: 'خيال',
    images: [
      {
        id: 'cov-f-1',
        title: 'قلعة الأحلام الذهبية وسط السحاب',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-f-2',
        title: 'المدينة السحرية في ضوء القمر',
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-f-3',
        title: 'بوابة الغابة السحرية والنجوم',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-f-4',
        title: 'جبل النجوم المضيئة الملونة',
        url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=900&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    category: 'فضاء ومغامرات النجوم 🚀',
    badge: 'فضاء',
    images: [
      {
        id: 'cov-s-1',
        title: 'رائد الفضاء الصغير بين المجرات',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-s-2',
        title: 'الكوكب الوردي والمذنبات اللامعة',
        url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-s-3',
        title: 'سفينة الفضاء الذهبية',
        url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-s-4',
        title: 'سماء مرصعة بنجوم الأرجوان',
        url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=900&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    category: 'عالم شهرزاد وقصص الشرق 🕌',
    badge: 'شهرزاد',
    images: [
      {
        id: 'cov-sh-1',
        title: 'قصر ألف ليلة وليلة تحت النجوم',
        url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-sh-2',
        title: 'مصباح علاء الدين السحري البراق',
        url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-sh-3',
        title: 'واحة الشرق السحرية عند الغروب',
        url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-sh-4',
        title: 'سفينة السندباد عبر البحر الأسطوري',
        url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=900&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    category: 'حيوانات لطيفة وغابات خضراء 🦊',
    badge: 'طبيعة',
    images: [
      {
        id: 'cov-a-1',
        title: 'الثعلب الذكي والذئب الصديق',
        url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-a-2',
        title: 'الدب اللطيف في الغابة المشمسة',
        url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-a-3',
        title: 'طائر الحكمة في الشجرة العريقة',
        url: 'https://images.unsplash.com/photo-1516600164266-f3b8166ae679?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-a-4',
        title: 'الأرنب السريع في حقل الزهور',
        url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=900&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    category: 'أحلام هادئة وراديو النوم 🌙',
    badge: 'نوم',
    images: [
      {
        id: 'cov-b-1',
        title: 'القمر الفضي وسحابة النعاس',
        url: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-b-2',
        title: 'ليلة هادئة دافئة تحت ضوء النجوم',
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-b-3',
        title: 'قارب الأحلام العائم فوق السحاب',
        url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-b-4',
        title: 'فانوس النوم المريح والسكينة',
        url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    category: 'أعماق البحار والمحيطات 🌊',
    badge: 'بحار',
    images: [
      {
        id: 'cov-o-1',
        title: 'الدلفين الودود واللؤلؤة المتلألئة',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-o-2',
        title: 'الشعاب المرجانية الزاهية والأسماك',
        url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=900&auto=format&fit=crop&q=80',
      },
      {
        id: 'cov-o-3',
        title: 'كنز القراصنة المفقود تحت الماء',
        url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=900&auto=format&fit=crop&q=80',
      },
    ],
  },
];
