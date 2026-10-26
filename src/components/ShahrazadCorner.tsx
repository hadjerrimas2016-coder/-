import React, { useState } from 'react';
import { Story, AppMode, ShahrazadCharacter } from '../types';
import { SHAHRAZAD_CHARACTERS } from '../data/storiesData';
import {
  Crown,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Star,
  Play,
  Heart,
  Mic,
  Award,
  Compass,
  CheckCircle2,
  HelpCircle,
  Flame,
  Info,
  ChevronRight,
  Shield,
  Gem,
  Moon,
  Feather,
  Check,
  X,
  RefreshCw,
  UserCheck,
  Smile
} from 'lucide-react';
import { ShahrazadCharacterAvatar } from './ShahrazadCharacterAvatar';
import confetti from 'canvas-confetti';
import {
  playSparkleSound,
  playFanfareSound,
  playClickSound,
  playPopSound,
  speakArabicSpeech,
  stopArabicSpeech
} from '../utils/audio';

// Detailed One Thousand and One Nights Stories for Shahrazad's World
export const ARABIAN_NIGHTS_STORIES: Story[] = [
  {
    id: 'shahrazad-origin',
    title: 'شهرزاد والملك شهريار: حكاية البداية وألف ليلة وليلة',
    subtitle: 'كيف استطاعت الأميرة الحكيمة شهرزاد نشر الأمان والعدل بنور الحكايات كل ليلة',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '👸',
    ageRange: '6 - 13 سنة',
    duration: '09:20',
    badge: 'الحكاية الأم 👑',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'في قصر بغداد العظيم ذي القباب البنفسجية، جلست شهرزاد بذكائها وحكمتها تروي كل ليلة حكاية مليئة بالعبر والقيم حتى يبزغ الفجر، معلنة انتصار الحكمة والعفو على القسوة.',
    highlightText: 'قصة التأسيس الأسطورية: الحكمة والصبر والكلمة الطيبة تصنع المعجزات',
    moralLesson: 'العقل الراجح واللسان الصادق قادران على معالجة أصعب المحن ونشر السلام في العالم.',
    pages: [
      {
        text: 'كَانَتْ شَهْرَزَادُ شَابَّةً ذَكِيَّةً، قَرَأَتْ كُتُبَ التَّارِيخِ وَالْحِكْمَةِ وَأَمْثَالَ الشُّعُوبِ. رَأَتْ أَنَّ بِلَادَهَا تَمُرُّ بِظُرُوفٍ صَعْبَةٍ، فَقَرَّرَتْ أَنْ تَسْتَخْدِمَ كَنْزَ مَعْرِفَتِهَا لِإِعَادَةِ الْأَمَانِ وَالْفَرَحِ إِلَى كُلِّ بَيْتٍ.',
        interactiveElements: [
          { id: 'origin-book', label: 'ديوان الحكمة', emoji: '📜', sound: 'sparkle', message: 'القراءة والاطلاع هما أعظم أسلحة الأبطال!' },
          { id: 'origin-palace', label: 'قصر بغداد', emoji: '🕌', sound: 'chime', message: 'قباب مذهبة وأروقة من الفضة والرياحين.' }
        ]
      },
      {
        text: 'دَخَلَتْ شَهْرَزَادُ الْقَصْرَ الْكَبِيرَ، وَطَلَبَتْ مِنْ أُخْتِهَا دُنْيَازَادَ أَنْ تَطْلُبَ مِنْهَا حِكَايَةً عِنْدَ مُنْتَصَفِ اللَّيْلِ. فَبَدَأَتْ تَرْوِي حِكَايَاتِ الصَّبْرِ وَالْوَفَاءِ وَالْفُرُوسِيَّةِ، بِأُسْلُوبٍ شَيِّقٍ يَجْعَلُ الْقُلُوبَ تَتَشَوَّقُ لِسَمَاعِ الْخَاتِمَةِ.',
        interactiveElements: [
          { id: 'origin-stars', label: 'نجوم السماء', emoji: '⭐', sound: 'sparkle', message: 'كل ليلة نجمة مضيئة تهدي الساهرين!' }
        ]
      },
      {
        text: 'وَهَكَذَا مَرَّتْ أَلْفُ لَيْلَةٍ وَلَيْلَةٌ، وَشَهْرَزَادُ تَزْرَعُ الْعَدْلَ وَالرَّحْمَةَ فِي كُلِّ لَيْلَةٍ، حَتَّى عَادَ الْفَرَحُ يَعُمُّ الْمَمْلَكَةَ وَأَصْبَحَتْ حِكَايَاتُهَا خَالِدَةً تَتَوَارَثُهَا الْأَجْيَالُ.',
        interactiveElements: [
          { id: 'origin-peace', label: 'راية السلام', emoji: '🕊️', sound: 'sparkle', message: 'انتصرت الحكمة والعفو والمحبة!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'ما هي الوسيلة التي اعتمدت عليها شهرزاد لإحلال السلام في القصر؟',
        options: ['الحكايات الهادفة والعقل والحكمة', 'الذهب والأموال الكثيرة', 'الشكوى والصراخ'],
        correctIndex: 0,
        explanation: 'ممتاز! الكلمة الطيبة والحكمة الهادفة هما أصلح طريق لنشر الخير والمحبة.'
      }
    ]
  },
  {
    id: 'aladdin-lamp',
    title: 'علاء الدين والمصباح السحري ومارد الأماني',
    subtitle: 'سر الكهف العجيب، والمصباح النحاسي القديم، واختبار الصدق والأمانة',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '🪔',
    ageRange: '5 - 12 سنة',
    duration: '08:45',
    badge: 'المصباح العجيب ✨',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'شاب شجاع يكتشف في أعماق مغارة الأسرار مصباحاً نحاسياً قديماً، وعندما يمسحه يخرج مارد عملاق ودود يلبي الأمنيات التي تعمر الأرض وتعين الضعفاء.',
    highlightText: 'من أشهر حكايات ألف ليلة وليلة: القوة الحقيقية ليست في السحر بل في نقاء الضمير',
    moralLesson: 'المصباح الحقيقي الذي يضيء طريقك هو عقلك الصادق وعملك المخلص لنفع الناس.',
    pages: [
      {
        text: 'وَقَفَ عَلَاءُ الدِّينِ فِي مَغَارَةِ الْعَجَائِبِ، حَوْلَهُ أَشْجَارٌ تُثْمِرُ يَاقُوتًا وَزُمُرُّدًا، لَكِنَّهُ لَمْ يَنْبَهِرْ بِالْبَرِيقِ، بَلْ بَحَثَ عَنِ الْمِصْبَاحِ النُّحَاسِيِّ الْبَسِيطِ الَّذِي أَوْصَتْهُ أُمُّهُ بِحِفْظِهِ.',
        interactiveElements: [
          { id: 'lamp-gem', label: 'أشجار الزمرّد', emoji: '💎', sound: 'chime', message: 'كنوز ملونة تتلألأ في عتمة المغارة!' },
          { id: 'lamp-brass', label: 'المصباح النحاسي', emoji: '🪔', sound: 'sparkle', message: 'مصباح متواضع يخبئ سراً عظيماً!' }
        ]
      },
      {
        text: 'عِنْدَمَا مَسَحَ عَلَاءُ الدِّينِ الْمِصْبَاحَ، تَصَاعَدَ دُخَانٌ أَزْرَقُ عَبِقٌ بِرَائِحَةِ الْعَنْبَرِ، وَظَهَرَ مَارِدٌ ضَخْمٌ يَسْجُدُ شَاكِرًا وَيَقُولُ: "شُبَّيْك لُبَّيْك! مَا هِيَ أُمْنِيَّتُكَ يَا صَاحِبَ الْقَلْبِ النَّقِيِّ؟".',
        interactiveElements: [
          { id: 'genie-magic', label: 'مارد المصباح', emoji: '🧞', sound: 'sparkle', message: 'أنا مارد وفيّ لمن يحفظ الأمانة!' }
        ]
      },
      {
        text: 'قَالَ عَلَاءُ الدِّينِ: "أُرِيدُ أَنْ نَبْنِيَ مَدَارِسَ وَآبَارَ مَاءٍ لِأَهْلِ الْمَدِينَةِ، وَأَنْ نُطْعِمَ كُلَّ مِسْكِينٍ". فَفَرِحَ الْمَارِدُ وَأَصْبَحَا صَدِيقَيْنِ مُخْلِصَيْنِ يُسَافِرَانِ بِالْبِسَاطِ الطَّائِرِ لِنَشْرِ الْخَيْرِ.',
        interactiveElements: [
          { id: 'carpet-flight', label: 'بساط الريح', emoji: '✨', sound: 'pop', message: 'نحلق فوق السحاب بين النجوم!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'ماذا طلب علاء الدين من مارد المصباح ليثبت نقاء قلبه؟',
        options: ['بناء المدارس والآبار ومساعدة الفقراء', 'جمع كل الذهب لنفسه فقط', 'النوم والراحة الدائمة'],
        correctIndex: 0,
        explanation: 'إجابة صحيحة يا بطل! علاء الدين فضل نفع المجتمع ومساعدة المحتاجين.'
      }
    ]
  },
  {
    id: 'ali-baba-morgiana',
    title: 'علي بابا والأربعون حرامياً وذكاء مرجانة',
    subtitle: 'سر كلمة "افتح يا سمسم" ودهاليز المغارة وحكمة حسن التدبير',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '🗝️',
    ageRange: '6 - 12 سنة',
    duration: '09:00',
    badge: 'افتح يا سمسم 🚪',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'حطاب بسيط يكتشف بالصدفة سر مغارة الكنوز وكلمتها السحرية الشهيرة، وبفضل ذكاء وفطنة الفتاة النبيهة مرجانة، ينجو الجميع وتُرد الحقوق لأصحابها.',
    highlightText: 'قصة الإخلاص واليقظة: حسن التصرف يحمي العائلة ويدفع الأخطار',
    moralLesson: 'اليقظة والفطنة وسرعة البديهة هي الحصن المنيع في مواجهة المكائد.',
    pages: [
      {
        text: 'كَانَ عَلِي بَابَا حَطَّابًا أَمِينًا يَجْمَعُ الْحَطَبَ مِنَ الْغَابَةِ، وَفِي يَوْمٍ مِنَ الْأَيَّامِ سَمِعَ صَوْتَ خُيُولٍ فَاخْتَبَأَ خَلْفَ شَجَرَةٍ عَالِيَةٍ، وَرَأَى رَئِيسَ الْفُرْسَانِ يَقِفُ أَمَامَ صَخْرَةٍ صَمَّاءَ وَيُنَادِي: "افْتَحْ يَا سِمْسِم!".',
        interactiveElements: [
          { id: 'sesame-rock', label: 'صخرة سمسم', emoji: '🪨', sound: 'pop', message: 'الصخرة تنشق بكلمة السر السحرية!' },
          { id: 'woodcutter', label: 'حطب الغابة', emoji: '🪵', sound: 'chime', message: 'العمل الشريف رزق وبركة.' }
        ]
      },
      {
        text: 'انْفَتَحَتِ الصَّخْرَةُ عَنْ مَغَارَةٍ مَلِيئَةٍ بِالذَّهَبِ وَالْفِضَّةِ وَالْأَقْمِشَةِ الْحَرِيرِيَّةِ. أَخَذَ عَلِي بَابَا قَدْرَ حَاجَتِهِ فَقَطْ لِيَسُدَّ دُيُونَ الْجِيرَانِ، لَكِنَّ اللُّصُوصَ حَاوَلُوا التَّسَلُّلَ إِلَى مَنْزِلِهِ لِاسْتِرْدَادِ الْكَنْزِ.',
        interactiveElements: [
          { id: 'treasure-chest', label: 'صناديق الحرير', emoji: '🎁', sound: 'sparkle', message: 'الأمانة تقتضي عدم الطمع الزائد!' }
        ]
      },
      {
        text: 'هُنَا ظَهَرَ ذَكَاءُ الْفَتَاةِ النَّبِيهَةِ مَرْجَانَةَ، حَيْثُ كَشَفَتْ خُطَّةَ اللُّصُوصِ الْمُتَخَفِّينَ فِي جِرَارِ الزَّيْتِ، وَأَبْلَغَتِ الْحُرَّاسَ، فَتَمَّ الْقَبْضُ عَلَيْهِمْ وَعَمَّ الْأَمَانُ أَرْجَاءَ الْمَدِينَةِ.',
        interactiveElements: [
          { id: 'morgiana-smart', label: 'فطنة مرجانة', emoji: '🧠', sound: 'sparkle', message: 'الذكاء وسرعة البديهة ينقذان الجميع!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'ما هي الكلمة السحرية التي كانت تفتح صخرة المغارة؟',
        options: ['افتح يا سمسم', 'افتح يا قمر', 'افتح يا ليل'],
        correctIndex: 0,
        explanation: 'صحيح! "افتح يا سمسم" هي أشهر كلمة سر في الأدب العالمي.'
      }
    ]
  },
  {
    id: 'sinbad-sailor',
    title: 'سندباد البحري ورحلاته السبع العجيبة',
    subtitle: 'مغامرة طائر الرخ العملاق، وادي الألماس الأخضر، وجزيرة الحوت النائم',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '⛵',
    ageRange: '6 - 13 سنة',
    duration: '10:15',
    badge: 'البحار السبع 🌊',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'الربان المغوار السندباد يبحر بسفينته الشراعية عبر البحار السبعة، يواجه العواصف ويلتقي بطائر الرخ الأسطوري ويكتشف جزر التوابل واللؤلؤ بشجاعة وصبر لا ينفدان.',
    highlightText: 'ملحمة الشجاعة والاستكشاف: لا يوجد بحر مستحيل أمام الإصرار والعزيمة',
    moralLesson: 'المغامرة تفتح العقول، والصبر عند الشدائد هو مرساة النجاة في كل عاصفة.',
    pages: [
      {
        text: 'رَكِبَ السِّنْدِبَادُ سَفِينَتَهُ الشِّرَاعِيَّةَ الْبَيْضَاءَ مِنْ مِينَاءِ الْبَصْرَةِ، يَرْفَعُ رَايَاتِ التِّجَارَةِ وَيَتَطَلَّعُ لِرُؤْيَةِ جُزُرِ الشَّرْقِ الْبَعِيدَةِ حَيْثُ تَفُوحُ رَائِحَةُ الْقِرْفَةِ وَالْقَرَنْفُلِ.',
        interactiveElements: [
          { id: 'sinbad-ship', label: 'السفينة الشراعية', emoji: '⛵', sound: 'pop', message: 'الأشرعة مفرودة مع رياح الخير!' },
          { id: 'ocean-waves', label: 'أمواج المحيط', emoji: '🌊', sound: 'chime', message: 'خرير الأمواج ينادي المغامرين الصغار.' }
        ]
      },
      {
        text: 'فِي إِحْدَى الْجُزُرِ، هَبَطَ السِّنْدِبَادُ لِيَرْتَاحَ فَوَجَدَ نَفْسَهُ فِي وَادٍ عَمِيقٍ تَسْكُنُهُ طُيُورُ الرُّخِّ الْعِمْلَاقَةُ، فَاسْتَخْدَمَ حِيلَةً ذَكِيَّةً حَيْثُ رَبَطَ نَفْسَهُ بِقَدَمِ الطَّائِرِ لِيَطِيرَ بِهِ خَارِجَ الْوَادِي حَامِلًا مَعَهُ قِطْعَةَ أَلْمَاسٍ نَادِرَةٍ.',
        interactiveElements: [
          { id: 'roc-bird', label: 'طائر الرخ', emoji: '🦅', sound: 'sparkle', message: 'جناحاه يغطيان ضوء الشمس من ضخامته!' }
        ]
      },
      {
        text: 'عَادَ السِّنْدِبَادُ إِلَى وَطَنِهِ سَالِمًا، وَقَسَّمَ أَمْوَالَهُ بَيْنَ رِفَاقِهِ وَالْفُقَرَاءِ، وَجَلَسَ فِي حَدِيقَتِهِ يَحْكِي لِلْأَطْفَالِ دُرُوسَ الصَّبْرِ وَالْإِيمَانِ عِنْدَ مُوَاجَهَةِ الْأَمْوَاجِ الْعَاتِيَةِ.',
        interactiveElements: [
          { id: 'compass-return', label: 'بوصلة الأمان', emoji: '🧭', sound: 'sparkle', message: 'العودة إلى الوطن سالماً هي أحلى أمنية.' }
        ]
      }
    ],
    quiz: [
      {
        question: 'ما اسم الطائر الأسطوري العملاق الذي ساعد السندباد على الخروج من الوادي؟',
        options: ['طائر الرخ', 'طائر الطنان', 'النسر الذهبي فقط'],
        correctIndex: 0,
        explanation: 'رائع جداً! طائر الرخ من أشهر المخلوقات الأسطورية في رحلات السندباد.'
      }
    ]
  },
  {
    id: 'ebony-horse',
    title: 'الحصان الأبنوسي السحري الطائر',
    subtitle: 'اختراع الحكيم الفارسي، ومفتاح التحليق بين الغيوم، وشجاعة الأمير الصغير',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '🐎',
    ageRange: '5 - 11 سنة',
    duration: '08:30',
    badge: 'سحر التحليق ☁️',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'حصان منحوت من خشب الأبنوس الأسود المرصع بالذهب، يملك لولباً خفياً عند تحريكه يطير في عنان السماء كالشهاب الثاقب، ويخوض الأمير على ظهره مغامرة فروسية مشوقة.',
    highlightText: 'قصة تدمج بين إبداع الاختراع والخيال العلمي المبكر في التراث العربي',
    moralLesson: 'العلم والاختراع قوة عظيمة يجب استخدامها لنشر الخير ومساعدة الأصدقاء.',
    pages: [
      {
        text: 'أَحْضَرَ حَكِيمٌ بَارِعٌ إِلَى قَصْرِ الْمَلِكِ حِصَانًا مَصْنُوعًا مِنْ خَشَبِ الْأَبْنُوسِ النَّادِرِ، عَيْنَاهُ مِنْ يَاقُوتٍ أَحْمَرَ وَفِي عُنُقِهِ مِفْتَاحٌ صَغِيرٌ مَخْفِيٌّ.',
        interactiveElements: [
          { id: 'ebony-carv', label: 'خشب الأبنوس', emoji: '🐎', sound: 'pop', message: 'نحت دقيق وخشب أسود لامع كالمرآة!' }
        ]
      },
      {
        text: 'قَفَزَ الْأَمِيرُ الشَّابُّ فَوْقَ صَهْوَةِ الْحِصَانِ وَأَدَارَ الْمِفْتَاحَ، فَإِذَا بِأَجْنِحَةٍ خَفِيَّةٍ تَنْفَرِدُ وَيَرْتَفِعُ الْحِصَانُ نَحْوَ قِمَمِ الْجِبَالِ وَالسَّحَابِ فِي مَشْهَدٍ يُبْهِرُ الْأَبْصَارَ.',
        interactiveElements: [
          { id: 'sky-fly', label: 'التحليق بين السحاب', emoji: '☁️', sound: 'sparkle', message: 'الهواء العليل يداعب الوجوه السعيدة!' }
        ]
      },
      {
        text: 'تَعَلَّمَ الْأَمِيرُ كَيْفِيَّةَ التَّحَكُّمِ بِسُرْعَةِ الْحِصَانِ بِحِكْمَةٍ، وَاسْتَخْدَمَهُ لِإِيصَالِ الْأَدْوِيَةِ إِلَى الْقُرَى الْبَعِيدَةِ الْمَحْصُورَةِ بَيْنَ الثُّلُوجِ، فَنَالَ مَحَبَّةَ كُلِّ النَّاسِ.',
        interactiveElements: [
          { id: 'help-cure', label: 'نجدة المرضى', emoji: '🌿', sound: 'sparkle', message: 'استخدام الاختراعات في شفاء الناس وإسعادهم.' }
        ]
      }
    ],
    quiz: [
      {
        question: 'من أي نوع من الخشب الثمين صُنع الحصان الطائر السحري؟',
        options: ['خشب الأبنوس الأسود', 'خشب الصنوبر العادي', 'القش والصلصال'],
        correctIndex: 0,
        explanation: 'أحسنت! خشب الأبنوس الفاخر المرصع بالجواهر والذهب.'
      }
    ]
  },
  {
    id: 'fisherman-jinni',
    title: 'الصياد الفقير والمارد النحاسي في القمقم',
    subtitle: 'حكمة الصياد في التغلب على جبروت المارد بذكائه وسرعة بديهته',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '🏺',
    ageRange: '6 - 12 سنة',
    duration: '07:40',
    badge: 'حكمة الصياد 🧠',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'صياد مسن يرمي شبكته في البحر فيخرج له قمقم نحاسي مختوم بخاتم قديم، وعندما يفتحه يخرج مارد عملاق غاضب، فيغلبه الصياد بذكائه وحيلته العقلية.',
    highlightText: 'درس خالد في قوة العقل والذكاء في مواجهة الضخامة والتهديد',
    moralLesson: 'العقل والهدوء يفوقان القوة العضلية والتهديد بمراحل.',
    pages: [
      {
        text: 'رَمَى الصَّيَّادُ الشَّيْخُ شَبَكَتَهُ بِتَوَكُّلٍ وَأَمَلٍ، فَلَمْ تَصْطَدْ سَمَكًا بَلْ أَخْرَجَتْ قُمْقُمًا نُحَاسِيًّا ثَقِيلًا مُغْلَقًا بِسِدَادَةٍ مَخْتُومَةٍ.',
        interactiveElements: [
          { id: 'flask-seal', label: 'خاتم القمقم', emoji: '🏺', sound: 'pop', message: 'قمقم نحاسي أثري مغلق منذ مئات السنين!' }
        ]
      },
      {
        text: 'عِنْدَمَا نَزَعَ الصَّيَّادُ السِّدَادَةَ، خَرَجَ دُخَانٌ كَثِيفٌ ارْتَفَعَ إِلَى عَنَانِ السَّمَاءِ ثُمَّ تَجَمَّعَ لِيُصْبِحَ مَارِدًا هَائِلَ الْحَجْمِ يُرْعِدُ صَوْتُهُ كَالْبَرْقِ.',
        interactiveElements: [
          { id: 'smoke-monster', label: 'المارد الضخم', emoji: '💨', sound: 'chime', message: 'دخان يتصاعد في الهواء كالغيوم الكثيفة.' }
        ]
      },
      {
        text: 'لَمْ يَفْزَعِ الصَّيَّادُ، بَلْ قَالَ لِلْمَارِدِ بِهُدُوءٍ: "لَا أُصَدِّقُ أَنَّ جِسْمَكَ الْعِمْلَاقَ هَذَا كَانَ يَسَعُهُ هَذَا الْقُمْقُمُ الصَّغِيرُ حَتَّى أَرَاهُ بِعَيْنِي!". فَدَخَلَ الْمَارِدُ لِيُثْبِتَ ذَلِكَ، فَسَارَعَ الصَّيَّادُ وَأَغْلَقَهُ مُعَلِّمًا إِيَّاهُ أَنَّ الْعَقْلَ أَقْوَى مِنَ الْقُوَّةِ.',
        interactiveElements: [
          { id: 'smart-trap', label: 'حيلة الصياد الذكي', emoji: '🧠', sound: 'sparkle', message: 'الحكمة والهدوء حلا أصعب المشكلات!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'كيف استطاع الصياد إعادة المارد داخل القمقم النحاسي؟',
        options: ['بالتحدي والتشكيك في قدرته على الدخول في القمقم', 'بالقتال بالسيف', 'بالاستسلام والخوف'],
        correctIndex: 0,
        explanation: 'إجابة صحيحة! استدرجه بحكمة وذكاء شديدين ليدخل القمقم بنفسه.'
      }
    ]
  }
];

// Shahrazad's Riddles for Kids
const SHAHRAZAD_RIDDLES = [
  {
    id: 'riddle-1',
    question: 'شيء يطير بلا أجنحة، ويبكي بلا عيون، ويحمل علاء الدين وياسمين بين الغيوم.. ما هو؟',
    options: ['بساط الريح السحري', 'عصفور الحديقة', 'البالون المنفوخ'],
    correct: 0,
    reward: 30,
    hint: 'منسوج من خيوط الحرير ويتحرك بأمر صاحبه.'
  },
  {
    id: 'riddle-2',
    question: 'ما هو الشيء الذي إذا مسحته بلطف أخرج لك نوراً ومارداً يلبي لك الأماني الطيبة؟',
    options: ['مصباح علاء الدين النحاسي', 'المرآة العادية', 'قلم الرصاص'],
    correct: 0,
    reward: 30,
    hint: 'مصنوع من النحاس القديم ووُجد في كهف العجائب.'
  },
  {
    id: 'riddle-3',
    question: 'طائر أسطوري في حكايات السندباد جناحاه يحجبان ضوء الشمس عن الجزيرة.. ما اسمه؟',
    options: ['طائر الرخ العظيم', 'الببغاء المتكلم', 'الهدهد'],
    correct: 0,
    reward: 30,
    hint: 'حمل السندباد البحري من وادي الألماس بأمان.'
  }
];

interface ShahrazadCornerProps {
  mode: AppMode;
  stories: Story[];
  onOpenStory: (story: Story) => void;
  favorites: string[];
  onToggleFavorite: (storyId: string) => void;
  onEarnStars: (amount: number, reason: string) => void;
  onSaveUserRecording?: (recording: any) => void;
}

export const ShahrazadCorner: React.FC<ShahrazadCornerProps> = ({
  mode,
  stories,
  onOpenStory,
  favorites,
  onToggleFavorite,
  onEarnStars,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'magic' | 'sea' | 'wisdom' | 'characters'>('all');
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [selectedRiddleOption, setSelectedRiddleOption] = useState<number | null>(null);
  const [riddleSolved, setRiddleSolved] = useState(false);
  const [isPlayingShahrazadIntro, setIsPlayingShahrazadIntro] = useState(false);
  const [narratingStoryId, setNarratingStoryId] = useState<string | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'stories' | 'characters' | 'riddles'>('stories');

  // Fantasy Companion System: Selected Companion (one of the 8 characters)
  const [selectedCompanionId, setSelectedCompanionId] = useState<string>(() => {
    try {
      return localStorage.getItem('raed_shahrazad_selected_character') || 'shahrazad';
    } catch {
      return 'shahrazad';
    }
  });
  const [showCompanionModal, setShowCompanionModal] = useState<boolean>(false);
  const [isPlayingCompanionVoice, setIsPlayingCompanionVoice] = useState<boolean>(false);

  const selectedCompanion =
    SHAHRAZAD_CHARACTERS.find((c) => c.id === selectedCompanionId) || SHAHRAZAD_CHARACTERS[0];

  const handleSelectCompanion = (char: ShahrazadCharacter) => {
    playFanfareSound();
    setSelectedCompanionId(char.id);
    try {
      localStorage.setItem('raed_shahrazad_selected_character', char.id);
    } catch {}
    confetti({ particleCount: 80, spread: 80 });
    onEarnStars(25, `اختيار رفيقك الخيالي: ${char.name} 🎭✨`);
    setShowCompanionModal(false);

    // Speak character voice quote
    setIsPlayingCompanionVoice(true);
    speakArabicSpeech(
      char.voiceQuote,
      () => setIsPlayingCompanionVoice(true),
      () => setIsPlayingCompanionVoice(false),
      () => setIsPlayingCompanionVoice(false),
      { voiceTone: 'joyful', rate: 0.88 }
    );
  };

  const handlePlayCompanionVoice = (char = selectedCompanion) => {
    playClickSound();
    if (isPlayingCompanionVoice) {
      stopArabicSpeech();
      setIsPlayingCompanionVoice(false);
      return;
    }
    setIsPlayingCompanionVoice(true);
    speakArabicSpeech(
      `${char.name}: ${char.voiceQuote}`,
      () => setIsPlayingCompanionVoice(true),
      () => setIsPlayingCompanionVoice(false),
      () => setIsPlayingCompanionVoice(false),
      { voiceTone: 'joyful', rate: 0.88 }
    );
  };

  // Filtered Arabian Nights stories
  const allShahrazadStories = [...ARABIAN_NIGHTS_STORIES];
  // Also include any stories from the main list marked with category 'shahrazad' that aren't already included
  stories.forEach((s) => {
    if (s.category === 'shahrazad' && !allShahrazadStories.some((as) => as.id === s.id)) {
      allShahrazadStories.push(s);
    }
  });

  const getFilteredStories = () => {
    if (selectedFilter === 'magic') {
      return allShahrazadStories.filter(
        (s) => s.id.includes('aladdin') || s.id.includes('ebony') || s.id.includes('crystal')
      );
    }
    if (selectedFilter === 'sea') {
      return allShahrazadStories.filter(
        (s) => s.id.includes('sinbad') || s.id.includes('fisherman')
      );
    }
    if (selectedFilter === 'wisdom') {
      return allShahrazadStories.filter(
        (s) => s.id.includes('ali-baba') || s.id.includes('shahrazad') || s.id.includes('prince')
      );
    }
    return allShahrazadStories;
  };

  const filteredStories = getFilteredStories();

  const handlePlayShahrazadIntro = () => {
    playClickSound();
    if (isPlayingShahrazadIntro) {
      stopArabicSpeech();
      setIsPlayingShahrazadIntro(false);
      return;
    }

    const greeting =
      'مَرْحَبًا بِكُمْ يَا أَبْطَالَ الْمُسْتَقْبَلِ فِي عَالَمِي، عَالَمِ شَهْرَزَادَ وَأَلْفِ لَيْلَةٍ وَلَيْلَةٍ! هُنَا تَلْتَقُونَ بِعَلَاءِ الدِّينِ، وَالسِّنْدِبَادِ الْبَحْرِيِّ، وَتَرْكَبُونَ الْبِسَاطَ السِّحْرِيَّ بَيْنَ النُّجُومِ. اسْتَمِعُوا إِلَى حِكَايَاتِي، وَتَعَلَّمُوا أَنَّ الْحِكْمَةَ وَالْكَلِمَةَ الطَّيِّبَةَ هُمَا أَعْظَمُ كُنُوزِ الدُّنْيَا!';

    setIsPlayingShahrazadIntro(true);
    speakArabicSpeech(
      greeting,
      () => setIsPlayingShahrazadIntro(true),
      () => setIsPlayingShahrazadIntro(false),
      () => setIsPlayingShahrazadIntro(false),
      { voiceTone: 'joyful', rate: 0.88, pitch: 1.15 }
    );
  };

  const handleNarrateStoryPreview = (story: Story) => {
    playClickSound();
    if (narratingStoryId === story.id) {
      stopArabicSpeech();
      setNarratingStoryId(null);
      return;
    }

    const companionIntro = `${selectedCompanion.name} يرافقك ويقول: هيا نستمع معاً إلى ${story.title}!... `;
    const textToSpeak = `${companionIntro} ${story.title}. ${story.subtitle}. ${story.pages[0]?.text || story.description}`;
    setNarratingStoryId(story.id);
    speakArabicSpeech(
      textToSpeak,
      () => setNarratingStoryId(story.id),
      () => {
        setNarratingStoryId(null);
        onEarnStars(20, `الاستماع إلى حكاية ${story.title} برفقة ${selectedCompanion.name}`);
        confetti({ particleCount: 40, spread: 60 });
        playSparkleSound();
      },
      () => setNarratingStoryId(null),
      { voiceTone: 'friendly', rate: 0.85 }
    );
  };

  const handleSolveRiddle = (optionIndex: number) => {
    playClickSound();
    setSelectedRiddleOption(optionIndex);
    const riddle = SHAHRAZAD_RIDDLES[currentRiddleIndex];
    if (optionIndex === riddle.correct) {
      setRiddleSolved(true);
      playFanfareSound();
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      onEarnStars(riddle.reward, 'حل لغز حكمة شهرزاد اليومي 👸⭐');
    } else {
      playPopSound();
    }
  };

  const handleNextRiddle = () => {
    playClickSound();
    setSelectedRiddleOption(null);
    setRiddleSolved(false);
    setCurrentRiddleIndex((prev) => (prev + 1) % SHAHRAZAD_RIDDLES.length);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Royal Palace Banner (قصر ألف ليلة وليلة) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/50 bg-gradient-to-r from-[#210936] via-[#160a2c] to-[#0c051a] p-6 sm:p-8 text-white">
        {/* Decorative background glow & ornaments */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-purple-500/20 border border-amber-400/40 text-amber-300 text-xs font-black shadow-inner">
              <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>ديوان ألف ليلة وليلة الملكي للأطفال</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-tight drop-shadow-sm">
              عالم شهرزاد الساحر 👸✨
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed max-w-2xl font-medium">
              مرحبًا بكم في قصر الحكايات الخالدة! هنا تروي شهرزاد اليافعة أعجب مغامرات الشرق الأسطوري: سحر المصباح العجيب، ورحلات السندباد في البحار السبعة، وبساط الريح، وكنوز الحكمة والذكاء.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              <button
                onClick={handlePlayShahrazadIntro}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                  isPlayingShahrazadIntro
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 hover:brightness-110 shadow-amber-400/30'
                }`}
              >
                {isPlayingShahrazadIntro ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>إيقاف صوت شهرزاد ⏹️</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>اسمع ترحيب شهرزاد الملكي 🎙️</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTabSub('riddles');
                }}
                className="px-4 py-2.5 rounded-2xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/40 text-purple-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <span>لغز شهرزاد اليومي (+30 ⭐)</span>
              </button>
            </div>
          </div>

          {/* Active Fantasy Companion Card in Hero Banner */}
          <div
            onClick={() => setShowCompanionModal(true)}
            className="relative w-40 sm:w-48 p-3 rounded-3xl overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-gradient-to-b from-[#2a1147] to-[#120726] flex-shrink-0 group cursor-pointer hover:border-amber-300 transition-all hover:scale-102"
            title="انقر لتغيير رفيقك الخيالي في عالم شهرزاد"
          >
            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="relative">
                <ShahrazadCharacterAvatar
                  characterId={selectedCompanion.id}
                  size="xl"
                  showBadge={true}
                  animated={isPlayingCompanionVoice}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayCompanionVoice(selectedCompanion);
                  }}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-amber-400 text-amber-950 shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="استمع لصوت الرفيق"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-block">
                  رفيقك الحالي 🎭
                </span>
                <h4 className="text-sm font-black text-white mt-0.5">{selectedCompanion.name}</h4>
                <p className="text-[10px] text-purple-200 line-clamp-1">{selectedCompanion.role}</p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCompanionModal(true);
                }}
                className="w-full py-1 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1 border border-purple-500/40 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>تغيير الرفيق</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fantasy Companion Companion Dock & Listening Aura Shelf */}
      <div
        className={`p-4 rounded-3xl border transition-all shadow-xl space-y-3 relative overflow-hidden bg-gradient-to-r ${selectedCompanion.themeGradient} ${selectedCompanion.borderGlow}`}
      >
        {/* Subtle Watermark Silhouette */}
        <div className="absolute -left-10 -bottom-10 opacity-15 pointer-events-none transform -rotate-12 scale-150">
          <ShahrazadCharacterAvatar characterId={selectedCompanion.id} size="xl" showBadge={false} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShahrazadCharacterAvatar
              characterId={selectedCompanion.id}
              size="lg"
              showBadge={true}
              animated={isPlayingCompanionVoice}
              onClick={() => handlePlayCompanionVoice(selectedCompanion)}
            />
            <div className="space-y-1 text-center sm:text-right">
              <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 shadow-sm">
                  رفيقك المختار في عالم شهرزاد 🎭
                </span>
                <span className="text-xs font-black text-amber-300">
                  {selectedCompanion.title}
                </span>
                <span className="text-[10px] text-purple-200 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                  {selectedCompanion.badge}
                </span>
              </div>
              <p className="text-xs text-purple-100 font-medium italic">
                "{selectedCompanion.voiceQuote}"
              </p>
              <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start pt-0.5">
                {selectedCompanion.traits.map((trait, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-black/30 border border-white/10 text-amber-200/90 font-medium"
                  >
                    ✦ {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center flex-shrink-0">
            <button
              onClick={() => handlePlayCompanionVoice(selectedCompanion)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlayingCompanionVoice
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isPlayingCompanionVoice ? 'إيقاف الصوت' : 'اسمع نصيحة الرفيق 🎙️'}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setShowCompanionModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>اختر رفيقك (8 شخصيات) 🎭</span>
            </button>
          </div>
        </div>

        {/* Live Listening Bubble when narrating a story */}
        {narratingStoryId && (
          <div className="relative z-10 p-3 rounded-2xl bg-black/50 border border-amber-400/50 flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <div className="text-xs text-amber-200 font-bold flex-1">
              <span className="text-amber-400 font-black ml-1">
                {selectedCompanion.name} يرافقك أثناء الاستماع:
              </span>
              <span>"{selectedCompanion.companionTip}"</span>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Navigation between Stories, Characters, and Riddles */}
      <div className="flex items-center justify-center sm:justify-start gap-2 p-1.5 rounded-2xl bg-purple-950/40 backdrop-blur-md border border-purple-800/50 flex-wrap">
        <button
          onClick={() => {
            playClickSound();
            setActiveTabSub('stories');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTabSub === 'stories'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-md'
              : 'text-purple-200 hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>حكايات ألف ليلة وليلة ({allShahrazadStories.length})</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTabSub('characters');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTabSub === 'characters'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-md'
              : 'text-purple-200 hover:bg-white/5'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>شخصيات القصر الأسطورية ({SHAHRAZAD_CHARACTERS.length})</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTabSub('riddles');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTabSub === 'riddles'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-md'
              : 'text-purple-200 hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>ألغاز وحكمة شهرزاد ⭐</span>
        </button>
      </div>

      {/* VIEW 1: Stories Collection */}
      {activeTabSub === 'stories' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
            <span className="text-purple-300 text-xs font-black flex items-center gap-1 flex-shrink-0">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>تصنيفات الحكايات:</span>
            </span>

            {[
              { id: 'all', label: 'كل الحكايات 📜' },
              { id: 'magic', label: 'عجائب وسحر الشرق ✨' },
              { id: 'sea', label: 'السندباد والبحار السبعة ⛵' },
              { id: 'wisdom', label: 'الحكمة والذكاء 🧠' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playClickSound();
                  setSelectedFilter(f.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all flex-shrink-0 cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-amber-400 text-amber-950 font-black shadow-md shadow-amber-400/20 scale-105'
                    : 'bg-purple-900/40 text-purple-200 hover:bg-purple-800/60 border border-purple-700/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStories.map((story) => {
              const isFav = favorites.includes(story.id);
              const isNarrating = narratingStoryId === story.id;

              return (
                <div
                  key={story.id}
                  className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl ${
                    mode === 'day'
                      ? 'bg-white border-purple-200 hover:border-amber-400'
                      : 'bg-[#18113c]/90 border-purple-800/60 hover:border-amber-400/70'
                  }`}
                >
                  {/* Card Header & Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-purple-950">
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 shadow-md flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-950" />
                        <span>{story.badge || 'ألف ليلة وليلة'}</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playPopSound();
                          onToggleFavorite(story.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                          isFav ? 'bg-rose-500 text-white' : 'bg-black/40 text-white hover:bg-rose-500/80'
                        }`}
                        title="حفظ في المفضلة"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Age and Duration badges at bottom of image */}
                    <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-[11px] text-white/90 font-bold">
                      <span className="bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        ⏱️ {story.duration}
                      </span>
                      <span className="bg-purple-900/70 px-2 py-0.5 rounded-md backdrop-blur-sm border border-purple-400/30">
                        👶 {story.ageRange}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h3
                        onClick={() => {
                          playClickSound();
                          onOpenStory(story);
                        }}
                        className={`text-base sm:text-lg font-black line-clamp-1 cursor-pointer transition-colors ${
                          mode === 'day' ? 'text-purple-950 hover:text-amber-600' : 'text-amber-200 hover:text-amber-300'
                        }`}
                      >
                        {story.title}
                      </h3>

                      <p className="text-xs text-purple-300/80 line-clamp-2 leading-relaxed">
                        {story.subtitle || story.description}
                      </p>
                    </div>

                    {/* Moral Lesson Pill */}
                    {story.moralLesson && (
                      <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
                        <Feather className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="line-clamp-1">{story.moralLesson}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          playClickSound();
                          onOpenStory(story);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>اقرأ بالتفصيل 📖</span>
                      </button>

                      <button
                        onClick={() => handleNarrateStoryPreview(story)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isNarrating
                            ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                            : 'bg-purple-900/40 border-purple-600/50 text-purple-200 hover:bg-purple-800/60'
                        }`}
                        title="استماع للحكاية بصوت شهرزاد"
                      >
                        {isNarrating ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isNarrating ? 'إيقاف' : 'استماع'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Characters Gallery & Companion Selection */}
      {activeTabSub === 'characters' && (
        <div className="space-y-5">
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-[#210c3b] to-indigo-950 border-2 border-amber-400/50 shadow-xl flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-400 text-amber-950 font-black">
                  <Crown className="w-5 h-5" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-amber-300">
                  شخصيات وفرسان قصر ألف ليلة وليلة (8 شخصيات خيالية) 🎭✨
                </h3>
              </div>
              <p className="text-xs text-purple-200/90 leading-relaxed max-w-2xl">
                اختر شخصيتك المفضلة لترافقك كرفيق دائم طوال رحلتك في عالم شهرزاد، وتستمع معك للقصص وتلهمك بالعبر والقيم النبيلة!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                رفيقك الحالي: {selectedCompanion.name} {selectedCompanion.avatarEmoji}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHAHRAZAD_CHARACTERS.map((char) => {
              const isSelected = selectedCompanionId === char.id;
              return (
                <div
                  key={char.id}
                  className={`p-4 rounded-3xl border transition-all duration-300 shadow-xl space-y-3 flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#2e104a] to-[#160829] border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20 scale-[1.02]'
                      : 'bg-gradient-to-b from-[#180e33] to-[#0f0721] border-purple-800/50 hover:border-purple-500'
                  }`}
                >
                  {/* Subtle Background Watermark */}
                  <div className="absolute -left-6 -bottom-6 opacity-10 pointer-events-none transform -rotate-12 scale-125">
                    <ShahrazadCharacterAvatar characterId={char.id} size="lg" showBadge={false} />
                  </div>

                  <div className="relative z-10 space-y-3">
                    {/* Header: Avatar & Info */}
                    <div className="flex items-center gap-3">
                      <ShahrazadCharacterAvatar
                        characterId={char.id}
                        size="md"
                        showBadge={true}
                        animated={isSelected && isPlayingCompanionVoice}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-900/90 text-amber-300 border border-purple-500/40 truncate">
                            {char.badge}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black">
                              نشط ⭐
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-white mt-0.5 truncate">{char.name}</h4>
                        <span className="text-[10px] text-purple-300/90 block truncate">{char.role}</span>
                      </div>
                    </div>

                    {/* Subtitle & Traits */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-amber-200/90 font-medium line-clamp-1">{char.subtitle}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {char.traits.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-purple-200"
                          >
                            ✦ {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-purple-200/90 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                      {char.description}
                    </p>

                    {/* Quote Bubble */}
                    <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-500/20 text-[10px] text-purple-200 italic line-clamp-2">
                      "{char.voiceQuote}"
                    </div>
                  </div>

                  {/* Actions: Voice & Select */}
                  <div className="relative z-10 space-y-2 pt-1">
                    <button
                      onClick={() => handlePlayCompanionVoice(char)}
                      className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-600/40 text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>اسمع صوت {char.name} 🎙️</span>
                    </button>

                    <button
                      onClick={() => handleSelectCompanion(char)}
                      disabled={isSelected}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 hover:brightness-110 active:scale-95'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>رفيقك المختار حالياً 🌟</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>اختر {char.name} كرفيق لي 🎭</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Shahrazad's Riddles & Daily Wisdom */}
      {activeTabSub === 'riddles' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-[#1b0d36] to-[#120726] border-2 border-amber-400/60 text-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black">
                  <Sparkles className="w-6 h-6 text-amber-950" />
                </span>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-amber-300">
                    لغز حكمة شهرزاد اليومي 👸⭐
                  </h3>
                  <p className="text-xs text-purple-200">
                    أجب بشكل صحيح واكسب 30 نجمة ذهبية تضاف فوراً إلى رصيد حسابك!
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                اللغز {currentRiddleIndex + 1} من {SHAHRAZAD_RIDDLES.length}
              </span>
            </div>

            {/* Current Riddle Box */}
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-amber-400/30">
                <p className="text-base sm:text-lg font-black text-amber-200 leading-relaxed text-center sm:text-right">
                  ❓ {SHAHRAZAD_RIDDLES[currentRiddleIndex].question}
                </p>
                {SHAHRAZAD_RIDDLES[currentRiddleIndex].hint && (
                  <p className="text-xs text-purple-300/80 mt-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                    <span>تلميح شهرزاد: {SHAHRAZAD_RIDDLES[currentRiddleIndex].hint}</span>
                  </p>
                )}
              </div>

              {/* Riddle Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SHAHRAZAD_RIDDLES[currentRiddleIndex].options.map((option, idx) => {
                  const isChosen = selectedRiddleOption === idx;
                  const isCorrect = idx === SHAHRAZAD_RIDDLES[currentRiddleIndex].correct;

                  let btnStyle = 'bg-white/5 border-purple-700/50 text-white hover:bg-white/10';
                  if (selectedRiddleOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-black scale-102';
                    } else if (isChosen && !isCorrect) {
                      btnStyle = 'bg-rose-700 border-rose-400 text-white';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSolveRiddle(idx)}
                      disabled={riddleSolved}
                      className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold text-center transition-all cursor-pointer shadow-md ${btnStyle}`}
                    >
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Success Result */}
              {riddleSolved && (
                <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-between flex-wrap gap-3 animate-bounce">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>أحسنت يا بطل الحكايات! إجابة صحيحة، فزت بـ +30 نجمة ذهبية ⭐!</span>
                  </div>

                  <button
                    onClick={handleNextRiddle}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-amber-950 font-black hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <span>اللغز التالي</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 4. COMPANION SELECTION POPUP MODAL (8 FANTASY CHARACTERS) */}
      {showCompanionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-[#210a38] via-[#150626] to-[#0d0317] border-2 border-amber-400/80 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col overflow-hidden text-white">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-[#260e3f] to-indigo-950 border-b border-purple-500/40 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-amber-400 text-amber-950 shadow-md">
                  <UserCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-300">
                    اختر رفيقك الخيالي في عالم شهرزاد 🎭✨
                  </h3>
                  <p className="text-xs text-purple-200">
                    الشخصية التي تختارها سترافقك في الاستماع للقصص وتظهر كخلفية ملهمة لرحلتك!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setShowCompanionModal(false);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-all cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Grid of 8 Characters */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {SHAHRAZAD_CHARACTERS.map((char) => {
                  const isSelected = selectedCompanionId === char.id;
                  return (
                    <div
                      key={char.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-purple-900 to-indigo-950 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/30'
                          : 'bg-white/5 border-purple-800/40 hover:bg-white/10 hover:border-purple-500'
                      }`}
                      onClick={() => handleSelectCompanion(char)}
                    >
                      <div className="flex items-center gap-3">
                        <ShahrazadCharacterAvatar
                          characterId={char.id}
                          size="md"
                          showBadge={true}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-white truncate">{char.name}</span>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 text-[9px] font-black">
                                نشط
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-amber-300 font-bold truncate">{char.badge}</p>
                          <p className="text-[9px] text-purple-300 truncate">{char.role}</p>
                        </div>
                      </div>

                      <p className="text-[10px] text-purple-200/90 leading-relaxed bg-black/30 p-2 rounded-xl line-clamp-2">
                        "{char.voiceQuote}"
                      </p>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayCompanionVoice(char);
                          }}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 transition-all cursor-pointer"
                          title="استمع للصوت"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCompanion(char);
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black transition-all shadow-md cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 hover:brightness-110 active:scale-95'
                          }`}
                        >
                          {isSelected ? '✓ رفيقك الحالي' : 'اختيار كرفيق 🎭'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-purple-300 px-6">
              <span>اختر أي شخصية وسيرافقك في الاستماع للقصص مع نصائح مشجعة!</span>
              <button
                onClick={() => setShowCompanionModal(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
