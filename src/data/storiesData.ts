import { Story, ShahrazadCharacter } from '../types';

export const STORIES_DATA: Story[] = [
  {
    id: 'raed-mars',
    title: 'رحلة رائد إلى المريخ: سر الكوكب الأحمر',
    subtitle: 'انطلق مع رائد وثعلبه اللطيف في رحلة عبر النجوم لاكتشاف أسرار المريخ الساحرة!',
    category: 'knowledge',
    categoryLabel: 'مستكشفو المعرفة',
    categoryIcon: '🚀',
    ageRange: '6 - 9 سنوات',
    duration: '08:15',
    badge: 'مغامرة اليوم المميزة',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-17_165435_21ae23c9.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png',
    description: 'يركب رائد مركبته الفضائية اللامعة مع ثعلبه الذكي ويكتشفان لماذا يُطلق على المريخ اسم الكوكب الأحمر، ويلتقيان بمسبار فضائي لطيف يجمعهما في مغامرة علمية خيالية.',
    highlightText: '50+ نقطة خيال ⭐ - مغامرة فضائية مشوقة للأبطال الصغار',
    progressPercent: 70,
    moralLesson: 'الفضول العلمي وحب الاستكشاف هما سر الوصول إلى أبعد الكواكب وفتح أفق المستقبل.',
    pages: [
      {
        text: 'انطلق رائد في مركبته الفضائية السريعة عبر مجرة النجوم، وكان ثعلبه اللطيف يجلس بجواره ينظر بدهشة من النافذة الزجاجية الدائرية.',
        interactiveElements: [
          { id: 'mars-planet', label: 'كوكب المريخ', emoji: '🪐', sound: 'sparkle', message: 'المريخ، الكوكب الأحمر الجميل!' },
          { id: 'rocket-engine', label: 'محرك الصاروخ', emoji: '🚀', sound: 'pop', message: 'نطير بسرعة الضوء بين الشهب!' }
        ]
      },
      {
        text: 'وعندما اقتربا من المريخ، رأيا غباراً برتقالياً وقمم جبال بركانية عملاقة مثل جبل أوليمبوس الشاهق. قال رائد: "يا له من كوكب فريد مليء بالأسرار العلمية!".',
        interactiveElements: [
          { id: 'probe', label: 'مسبار الاستكشاف', emoji: '🤖', sound: 'chime', message: 'بيب بيب! مرحباً برائد وثعلبه!' }
        ]
      },
      {
        text: 'جمع رائد عينات من تربة المريخ الحمراء الغنية بالحديد، ثم التقط صورة تذكارية مع ثعلبه والمسبار قبل أن ينطلقا عائدين برسالة أمل لكل أطفال الأرض.',
        interactiveElements: [
          { id: 'flag', label: 'علم الصداقة', emoji: '🚩', sound: 'sparkle', message: 'رفعنا راية العلم والمعرفة!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'لماذا يُطلق على كوكب المريخ اسم الكوكب الأحمر؟',
        options: ['بسبب وجود أكاسيد الحديد في تربته', 'لأنه مصنوع من الفراولة', 'لأن الشمس قريبة منه'],
        correctIndex: 0,
        explanation: 'أحسنت يا بطل! صدأ الحديد في تربته هو ما يعطيه اللون الأحمر الجذاب.'
      }
    ]
  },
  {
    id: 'little-prince',
    title: 'الأمير الصغير والزهرة الحالمة',
    subtitle: 'قصة ساحرة عن أمير صغير يعتني بزهرة فريدة على جريرته المعلقة',
    category: 'fantasy',
    categoryLabel: 'عالم القصص الخيالية',
    categoryIcon: '✨',
    ageRange: '4 - 7 سنوات',
    duration: '06:40',
    badge: 'الأكثر قراءة',
    coverImage: '/assets/aistudio/27fbd6f6-d049-4f8d-9848-74312646d933_b4e7b8ad.png',
    bannerImage: '/assets/aistudio/27fbd6f6-d049-4f8d-9848-74312646d933_b4e7b8ad.png',
    description: 'قصة ساحرة عن أمير صغير يعتني بزهرة فريدة على جزيرته المعلقة في الفضاء، ويتعلم معنى الاهتمام الصادق بالآخرين والصداقة النقية.',
    highlightText: 'قصة مليئة بالخيال والقيم الإنسانية النبيلة',
    progressPercent: 45,
    moralLesson: 'الأشياء الأكثر قيمة في الحياة تُرى بالقلب لا بالعين فقط.',
    pages: [
      {
        text: 'في كوكب صغير بعيد يعيش الأمير الصغير بجوار زهرته الرقيقة التي يحميها من النسيم البارد تحت غطاء زجاجي دافئ.',
        interactiveElements: [
          { id: 'rose', label: 'الزهرة الحالمة', emoji: '🌹', sound: 'sparkle', message: 'أنا زهرة تحب الرعاية والحنان!' },
          { id: 'star', label: 'نجمة الكوكب', emoji: '⭐', sound: 'chime', message: 'نورك يضيء كل الكواكب!' }
        ]
      },
      {
        text: 'التقى الأمير بثعلب وديع علمه أن الصداقة تحتاج إلى وقت وصبر لكي تزهر وتصبح أجمل رابط في الوجود.',
        interactiveElements: [
          { id: 'fox', label: 'الثعلب الحكيم', emoji: '🦊', sound: 'pop', message: 'الصداقة كنز ثمين يُبنى بالمحبة!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'ما الذي كان يحميه الأمير الصغير تحت الغطاء الزجاجي؟',
        options: ['زهرته الفريدة الجميلة', 'شمعة مضيئة', 'تفاحة حمراء'],
        correctIndex: 0,
        explanation: 'رائع! كان يحمي زهرته بحنان ومحبة.'
      }
    ]
  },
  {
    id: 'loundja-algeria',
    title: 'لونجة الحكيمة والتراث الجزائري الأصيل',
    subtitle: 'من التراث الشعبي الجزائري العريق: قصة لونجة ذات الشعر الذهبي',
    category: 'heritage',
    categoryLabel: 'كنوز التراث والشعبيات',
    categoryIcon: '📜',
    ageRange: '7 - 12 سنة',
    duration: '09:30',
    badge: 'تراث أصيل',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-17_165435_21ae23c9.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-17_165435_21ae23c9.png',
    description: 'من التراث الشعبي الجزائري العريق: قصة لونجة ذات الشعر الذهبي التي استخدمت حكمتها وذكاءها لمساعدة أهل قريتها في واحات الصحراء الذهبية.',
    highlightText: 'حكاية شعبية تراثية تعلم الأطفال الشجاعة والحكمة الشعبية',
    progressPercent: 85,
    moralLesson: 'الحكمة وحسن التصرف ينقذان القرى ويفتحان أبواب الخير للجميع.',
    pages: [
      {
        text: 'في واحة خضراء بين كثبان الرمال الذهبية في الجزائر العريقة، كانت تعيش الفتاة الحكيمة لونجة، المشهورة بجدائل شعرها الذهبي ورجاحة عقلها.',
        interactiveElements: [
          { id: 'oasis', label: 'واحة النخيل', emoji: '🌴', sound: 'sparkle', message: 'تمور الواحة حلوة كالعسل!' },
          { id: 'chest', label: 'صندوق الكنوز', emoji: '🎁', sound: 'chime', message: 'حكمة الأجداد هي الكنز الحقيقي!' }
        ]
      },
      {
        text: 'عندما حل الجفاف بالواحة، لم تستسلم لونجة، بل تتبعت خرير ماء سري تحت الصخور وجمعت أهل القرية لحفر بئر مبارك سقى كل النخيل والزرع.',
        interactiveElements: [
          { id: 'water', label: 'عين الماء العذبة', emoji: '💧', sound: 'pop', message: 'الماء سر الحياة والنماء!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'كيف ساعدت لونجة أهل واحتها في التراث الجزائري؟',
        options: ['باكتشاف نبع الماء بحكمتها وشجاعتها', 'بالنوم في بيتها', 'بالسفر وتركهم'],
        correctIndex: 0,
        explanation: 'إجابة صحيحة! استخدمت ذكاءها لتجد عين الماء العذبة.'
      }
    ]
  },
  {
    id: 'shahrazad-young',
    title: 'شهرزاد اليافعة: أميرة الحكايات وسحر البنفسج',
    subtitle: 'في قصر ألف ليلة وليلة، تروي شهرزاد حكايات السحر والأمل',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '👸',
    ageRange: '6 - 12 سنة',
    duration: '08:45',
    badge: 'ألف ليلة وليلة',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'أميرة الحكايات وسحر البنفسج، تفتح كتابها المذهب كل ليلة لتنثر في سماء القصر حكايات تنشر السلام والعدل وتبهج القلوب.',
    highlightText: 'سحر حكايات ألف ليلة وليلة الموجهة للأطفال بقيم راقية',
    progressPercent: 30,
    moralLesson: 'الكلمة الطيبة والقصة الهادفة قادرتان على تليين أصلب القلوب ونشر الأمان.',
    pages: [
      {
        text: 'كانت شهرزاد اليافعة تجلس في شرفتها المطلة على القباب البنفسجية لمدينة بغداد الساحرة، تفتح ديوان الحكايات وتتنفس نسيم الياسمين.',
        interactiveElements: [
          { id: 'book', label: 'كتاب الحكايات', emoji: '📖', sound: 'sparkle', message: 'كل صفحة تخبئ سراً عجيباً!' },
          { id: 'palace', label: 'القصر البنفسجي', emoji: '🕌', sound: 'chime', message: 'أنوار القناديل تتلألأ مع حلول المساء.' }
        ]
      },
      {
        text: 'قالت شهرزاد: "سأحكي لكم الليلة حكاية عن الشجاعة والأمل، كيف انتصر الصدق على الخداع وكيف أضاءت شمعة صغيرة ظلام القلعة!".',
        interactiveElements: [
          { id: 'candle', label: 'شمعة الحق', emoji: '🕯️', sound: 'sparkle', message: 'نور الحق لا ينطفئ أبداً!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'ما هو السلاح الأقوى الذي استخدمته شهرزاد لنشر الأمان والسلام؟',
        options: ['الحكايات والكلمة الطيبة الحكيمة', 'السيف والترس', 'الغضب'],
        correctIndex: 0,
        explanation: 'ممتاز! الكلمة الطيبة والحكمة هما أقوى ما يملكه الإنسان.'
      }
    ]
  },
  {
    id: 'aladdin-carpet',
    title: 'علاء الدين وياسمين: فرسان البساط الطائر',
    subtitle: 'رحلة فوق الغيوم والقمر على بساط الريح السحري',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '🧞',
    ageRange: '6 - 11 سنة',
    duration: '07:50',
    badge: 'بساط الريح',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'يحلق علاء الدين وياسمين فوق مدن الشرق القديم على البساط الطائر، لا للبحث عن الذهب، بل لإنقاذ الطيور المهاجرة ومساعدة القرى المحتاجة.',
    highlightText: 'مغامرة خيالية ممتعة تجمع بين سحر الشرق وأخلاق الفروسية',
    moralLesson: 'القوة الحقيقية في نصرة الضعفاء واستخدام القدرات في الخير.',
    pages: [
      {
        text: 'انطلق البساط السحري ينساب بخفة بين النجوم وقمر ليلة البدر، وعلاء الدين يشير ببوصلته الفلكية نحو وادي البلور المتوهج.',
        interactiveElements: [
          { id: 'carpet', label: 'البساط الطائر', emoji: '✨', sound: 'pop', message: 'نطير بين النجوم العالية!' },
          { id: 'moon', label: 'بدر التمام', emoji: '🌕', sound: 'sparkle', message: 'القمر ينير طريق الفرسان الصغار.' }
        ]
      }
    ],
    quiz: [
      {
        question: 'على ماذا كان يطير علاء الدين وياسمين بين النجوم؟',
        options: ['على البساط السحري الطائر', 'في طائرة هليكوبتر', 'في قطار'],
        correctIndex: 0,
        explanation: 'صحيح! البساط الطائر السحري من أشهر حكايات ألف ليلة وليلة.'
      }
    ]
  },
  {
    id: 'prince-of-dreams',
    title: 'أمير الأحلام: فارس المصباح والبوصلة الفلكية',
    subtitle: 'رحلة المستكشف الصغير في أرض العجائب',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '🧭',
    ageRange: '6 - 10 سنوات',
    duration: '06:15',
    badge: 'سحر المصباح',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'فارس المصباح والبوصلة الفلكية، يجوب مدن الأحلام ليعيد النور إلى الفوانيس السحرية المنطفئة بصدقه وعزيمته.',
    highlightText: 'حكاية ممتعة عن المثابرة وحب الاستكشاف الفلكي',
    moralLesson: 'من يسعى بصدق يجد النور الذي يرشده ويرشد أصدقاءه.',
    pages: [
      {
        text: 'حمل أمير الأحلام مصباحه النحاسي القديم، وبوصلته المرصعة بالياقوت الأزرق، وانطلق يتبع النجم الشمالي نحو مدينة المرايا.',
        interactiveElements: [
          { id: 'lamp', label: 'المصباح النحاسي', emoji: '🪔', sound: 'sparkle', message: 'ضوء دافئ يبدد كل عتمة!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'ما الذي كان يرشد أمير الأحلام في رحلته؟',
        options: ['البوصلة الفلكية والنجم الشمالي', 'هاتف محمول', 'ساعة حائط'],
        correctIndex: 0,
        explanation: 'أحسنت! البوصلة الفلكية والنجوم كانت دليل المستكشفين الأوائل.'
      }
    ]
  },
  {
    id: 'crystal-gardens',
    title: 'حارسة حدائق البلور: أميرة الأماني والينابيع',
    subtitle: 'في بستان البلور المتوهج، تزهر أمنيات الأطفال الصادقة',
    category: 'shahrazad',
    categoryLabel: 'عالم شهرزاد',
    categoryIcon: '💎',
    ageRange: '5 - 9 سنوات',
    duration: '07:20',
    badge: 'حدائق البلور',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'أميرة الأماني والينابيع المتوهجة، تحرس أشجار البلور التي تضيء كلما قام طفل في العالم بعمل خير أو قال صدقاً.',
    highlightText: 'قصة تعزز قيم الصدق والإحسان والتعاون',
    moralLesson: 'كل عمل خير تقوم به هو بلورة مضيئة تنير حياتك وحياة من حولك.',
    pages: [
      {
        text: 'في حديقة البلور، تتدفق ينابيع المياه المضيئة بألوان قوس قزح، وحارسة الحديقة تسقي زهور الفضة بابتسامة مشرقة.',
        interactiveElements: [
          { id: 'crystal', label: 'زهرة البلور', emoji: '💎', sound: 'chime', message: 'رنين بلوري ساحر ومبهج!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'متى تتوهج أشجار البلور في الحديقة السحرية؟',
        options: ['عندما يقوم الأطفال بعمل خير وصدق', 'في الليل المظلم فقط', 'عند نزول المطر فقط'],
        correctIndex: 0,
        explanation: 'رائع! أعمال الخير تضيء قلوبنا وحدائقنا بالحب.'
      }
    ]
  },
  {
    id: 'fatima-al-fihriya',
    title: 'فاطمة الفهرية: أميرة الفكر وبانية القرويين',
    subtitle: 'قصة ملهمة من تاريخنا الإسلامي العريق عن أعظم جامعة في التاريخ',
    category: 'heritage',
    categoryLabel: 'كنوز التراث والشعبيات',
    categoryIcon: '🏛️',
    ageRange: '7 - 12 سنة',
    duration: '08:10',
    badge: 'بطلة تاريخية',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    description: 'أميرة الفكر وبانية جامع القرويين في فاس، التي وهبت مالها وعمرها لبناء أول جامعة في العالم نشرت العلم والطب والفلك.',
    highlightText: 'قصة تاريخية مشوقة للأطفال تزرع حب التعلم وبناء الأوطان',
    moralLesson: 'العلم هو أعظم استثمار وأبقى أثر يمكن للإنسان أن يتركه للعالم.',
    pages: [
      {
        text: 'قررت السيدة فاطمة الفهرية أن تبني صرحاً علمياً يجمع الطلاب والعلماء من كل بقاع الأرض، وظلت صائمة تشرف بنفسها على حجر الأساس.',
        interactiveElements: [
          { id: 'uni', label: 'جامعة القرويين', emoji: '🏛️', sound: 'sparkle', message: 'أقدم جامعة مستمرة في التاريخ!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'ما هو الصرح العظيم الذي بنته فاطمة الفهرية؟',
        options: ['جامع وجامعة القرويين بفاس', 'قصر التسلية', 'سوق تجاري'],
        correctIndex: 0,
        explanation: 'ممتاز! جامعة القرويين هي أقدم جامعة في العالم.'
      }
    ]
  },
  {
    id: 'sleep-radio-calm',
    title: 'همسات النجوم: قصة النوم الهادئة',
    subtitle: 'رحلة هادئة مع رائد إلى وادي الأحلام السعيدة',
    category: 'sleep',
    categoryLabel: 'راديو النوم',
    categoryIcon: '🌙',
    ageRange: '3 - 8 سنوات',
    duration: '15:00',
    badge: 'نوم هادئ ومريح',
    coverImage: '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png',
    bannerImage: '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png',
    description: 'قصة استرخاء صوتية للأطفال قبل النوم، بأنفاس هادئة وأصوات أمواج لطيفة وموسيقى تهويدة دافئة تساعد على النوم العميق.',
    highlightText: 'مؤقت نوم مدمج 15 / 30 دقيقة وأصوات مهدئة للاسترخاء',
    moralLesson: 'الراحة والنوم الهادئ يجددان طاقة الأبطال ليوم جديد مليء بالإنجاز والنشاط.',
    pages: [
      {
        text: 'أغمض عينيك بهدوء يا بطلي الصغير.. تنفس بعمق.. اسمع همس الرياح الدافئة وهي تداعب أوراق الشجر، والنجوم تطمئنك في سريرك الدافئ.',
        interactiveElements: [
          { id: 'pillow', label: 'الوسادة المريحة', emoji: '☁️', sound: 'sparkle', message: 'نوم هنيء وأحلام وردية جميلة.' }
        ]
      }
    ],
    quiz: []
  },
  {
    id: 'bilingual-little-astronaut',
    title: 'The Little Astronaut | رائد الفضاء الصغير',
    subtitle: 'قصة ثنائية اللغة (Arabic & English) لتعليم الصغار حب الاستكشاف والفضاء',
    category: 'foreign_languages',
    categoryLabel: 'قصص باللغات الأجنبية',
    categoryIcon: '🌍',
    ageRange: '5 - 10 سنوات',
    duration: '07:20',
    badge: 'English & Arabic',
    coverImage: '/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png',
    bannerImage: '/assets/aistudio/28a8e0a2-a42a-4782-b1d2-b0be7b9319cf_ff9d2c6a.png',
    description: 'One sunny morning, Raed put on his shiny space suit and smiled: "Today, we fly to the stars!" / في صباح مشرق، ارتدى رائد بدلته الفضائية اللامعة وقال: "اليوم سنطير إلى النجوم!".',
    highlightText: 'Bilingual Kids Story - قصة تعليمية ثنائية باللغتين العربية والإنجليزية ⭐',
    progressPercent: 100,
    moralLesson: 'Learning languages opens windows to the entire universe. / تعلّم اللغات يفتح نوافذ المعرفة إلى أرجاء الكون الواسع.',
    pages: [
      {
        text: 'Chapter 1: The Countdown\n\n"Three, Two, One... Lift off!" shouted Raed with his little fox. The spaceship soared above the clouds into the glowing blue sky.\n\nالفصل الأول: العد التنازلي\n"ثلاثة، اثنان، واحد... انطلاق!" صاح رائد مع ثعلبه اللطيف، وارتفعت المركبة فوق السحاب نحو السماء المتوهجة.',
        interactiveElements: [
          { id: 'space-shuttle', label: 'Space Ship', emoji: '🚀', sound: 'sparkle', message: 'Lift off to the galaxy! انطلاق!' }
        ]
      },
      {
        text: 'Chapter 2: The Beautiful Earth\n\n"Look at our planet! It looks like a shining blue pearl," said the fox. Raed smiled: "We must love and protect our nature and pure water."\n\nالفصل الثاني: كوكبنا الجميل\n"انظر إلى كوكبنا! يبدو كأنه لؤلؤة زرقاء متلألئة،" قال الثعلب. ابتسم رائد وقال: "يجب أن نحمي طبيعتنا الخضراء ومياهنا النقية."',
        interactiveElements: [
          { id: 'earth-planet', label: 'Planet Earth', emoji: '🌍', sound: 'pop', message: 'Our blue home! كوكبنا الأزرق!' }
        ]
      },
      {
        text: 'Chapter 3: Friendship Among Stars\n\nThey waved to a friendly satellite. "Hello Earth friends! Welcome to the galaxy!" beeped the satellite joyfully.\n\nالفصل الثالث: صداقة بين النجوم\nلوّحا لمسبار فضائي لطيف. "أهلاً بأصدقاء الأرض! مرحباً بكم في مجرة الأحلام!" رن المسبار بفرح وسرور.',
        interactiveElements: [
          { id: 'star-friend', label: 'Friendly Star', emoji: '⭐', sound: 'chime', message: 'Friendship has no borders! الصداقة لا حدود لها!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'What did Raed say before taking off? / ماذا قال رائد قبل الانطلاق؟',
        options: ['Three, Two, One... Lift off! (3، 2، 1... انطلاق)', 'Good night stars (تصبحون على خير)', 'I am tired (أنا متعب)'],
        correctIndex: 0,
        explanation: 'Great job! أحسنت يا بطل! العد التنازلي كان: 3، 2، 1 انطلاق.'
      }
    ]
  },
  {
    id: 'bilingual-french-garden',
    title: 'Le Jardin des Merveilles | حديقة العجائب',
    subtitle: 'حكاية ممتعة ثنائية باللغتين الفرنسية والعربية (Français & Arabe)',
    category: 'foreign_languages',
    categoryLabel: 'قصص باللغات الأجنبية',
    categoryIcon: '🌍',
    ageRange: '6 - 11 سنة',
    duration: '08:00',
    badge: 'Français & Arabe',
    coverImage: '/assets/aistudio/image_2026-10-20_135936230_89e4c091.png',
    bannerImage: '/assets/aistudio/image_2026-10-20_135936230_89e4c091.png',
    description: 'Dans un jardin enchanteur, Lyan découvre que chaque mot gentil fait éclore une rose parfumée. / في حديقة ساحرة، تكتشف ليان أن كل كلمة طيبة تجعل وردة عاطرة تتفتح.',
    highlightText: 'Bilingue Français-Arabe - قصة ثنائية فرنسية عربية لتنمية المهارات اللغوية 🌸',
    progressPercent: 85,
    moralLesson: 'Les mots doux et la politesse sont des fleurs qui ne fanent jamais. / الكلمات الطيبة والأخلاق الحسنة أزهار لا تذبل أبداً.',
    pages: [
      {
        text: 'Bonjour les amis! Chaque matin, la petite Lyan arrose les fleurs et dit "Merci" et "S\'il vous plaît". Soudain, les bourgeons s\'ouvrent avec mille couleurs éclatantes.\n\nصباح الخير يا أصدقاء! كل صباح، تسقي ليان الصغيرة الأزهار وتقول "شكراً" و"من فضلك"، وفجأة تتفتح براعم الأزهار بألف لون بهيج ومشرق.',
        interactiveElements: [
          { id: 'fleur', label: 'Belle Fleur', emoji: '🌸', sound: 'sparkle', message: 'La politesse est une fleur! الأخلاق زهرة!' }
        ]
      },
      {
        text: 'Un papillon doré vole près d\'elle: "Tu parles avec le cœur, c\'est la plus belle langue du monde!". Lyan sourit et partage ses pommes avec les oiseaux chanteurs.\n\nطارت فراشة ذهبية بقربها وقالت: "أنتِ تتحدثين بقلبك، وهذه أجمل لغة في العالم!". ابتسمت ليان وشاركت تفاحاتها مع العصافير المغردة.',
        interactiveElements: [
          { id: 'papillon', label: 'Papillon', emoji: '🦋', sound: 'pop', message: 'Le monde est plein d\'amour! العالم مليء بالحب!' }
        ]
      }
    ],
    quiz: [
      {
        question: 'Que dit la petite Lyan chaque matin? / ماذا تقول ليان الصغيرة كل صباح؟',
        options: ['Merci et s\'il vous plaît (شكراً ومن فضلك)', 'Au revoir seulement (وداعاً فقط)', 'Rien du tout (لا شيء)'],
        correctIndex: 0,
        explanation: 'Très bien! أحسنت! الكلمات اللطيفة تجعل العالم أجمل.'
      }
    ]
  }
];

// Special Shahrazad 8 Fantasy Characters Companion Collection
export const SHAHRAZAD_CHARACTERS: ShahrazadCharacter[] = [
  {
    id: 'shahrazad',
    name: 'شهرزاد',
    title: 'شهرزاد أميرة الحكايات',
    subtitle: 'ملكة الحكمة والبيان والكلمة الطيبة والوقار',
    role: 'راوية ألف ليلة وليلة',
    avatarEmoji: '👑',
    image: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    storyId: 'shahrazad-origin',
    badge: 'أميرة الحكايات 👑',
    description: 'تروي ألف ليلة وليلة من العبر والحكمة لنشر السلام والمحبة، وتعلم الأطفال قوة الكلمة الطيبة وحسن التدبير.',
    themeGradient: 'from-purple-950 via-[#260e3f] to-indigo-950',
    accentColor: '#eab308',
    borderGlow: 'border-amber-400 shadow-[0_0_25px_rgba(234,179,8,0.35)]',
    voiceQuote: 'مرحباً بك يا بطل! بالكلمة الصادقة والعقل الراجح نصنع النور في أشد الليالي عتمة!',
    companionTip: 'شهرزاد ترافقك لتلهمك الحكمة والصبر وتقدير الكلمة الطيبة عند كل قصة.',
    traits: ['الحكمة البالغة', 'البلاغة وفصاحة اللسان', 'الصبر واللطف والوقار'],
    visualAura: 'تاج مذهب ووشاح أرجواني وقباب بغداد البنفسجية'
  },
  {
    id: 'aladdin',
    name: 'علاء الدين',
    title: 'علاء الدين بطل المصباح',
    subtitle: 'فارس المغامرة والشجاعة والأمانة وبساط الريح',
    role: 'مغامر كهف العجائب',
    avatarEmoji: '🪔',
    image: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    storyId: 'aladdin-lamp',
    badge: 'المصباح العجيب ✨',
    description: 'شاب شجاع وأمين يكتشف المصباح العجيب في مغارة الأسرار، ويسخر أمنياته لبناء المدارس والآبار ومساعدة الفقراء.',
    themeGradient: 'from-sky-950 via-[#0c2340] to-amber-950',
    accentColor: '#38bdf8',
    borderGlow: 'border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.35)]',
    voiceQuote: 'شجاعتك وأمانتك هما المصباح الحقيقي الذي ينير كل مغامراتك في الحياة!',
    companionTip: 'علاء الدين يعلمك الشجاعة وعزة النفس والصدق ونصرة المظلومين.',
    traits: ['الشجاعة والإقدام', 'نقاء القلب والأمانة', 'روح المبادرة والمغامرة'],
    visualAura: 'مصباح نحاسي متوهج بدخان أزرق وبساط الريح الحريري'
  },
  {
    id: 'al-hakim',
    name: 'الحكيم',
    title: 'الحكيم شيخ المعرفة',
    subtitle: 'حارس المخطوطات القديمة وأسرار الفلك وحسن التدبير',
    role: 'منارة الفكر والتدبير',
    avatarEmoji: '📜',
    image: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    storyId: 'ebony-horse',
    badge: 'حارس المخطوطات 📜',
    description: 'شيخ وقور يحفظ كنوز العلوم والفلك في ديوان القصر، يرشد الأبطال الصغار بالبصيرة والتأمل واستخلاص العبر النافعة.',
    themeGradient: 'from-emerald-950 via-[#062c24] to-slate-950',
    accentColor: '#34d399',
    borderGlow: 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.35)]',
    voiceQuote: 'اقرأ وتأمّل يا بني، فالعلم أعظم كنز لا يسرقه سارق ولا ينفد بالإنفاق!',
    companionTip: 'الحكيم يهديك التدبر في معاني القصص ويشجعك على حب القراءة والمعرفة.',
    traits: ['التأمل وحسن الرأي', 'المعرفة الموسوعية', 'الوقار والهدوء والعبرة'],
    visualAura: 'رداء زمردي وقور ونظارة ذهبية ومخطوطات عتيقة مطرزة'
  },
  {
    id: 'dunyazad',
    name: 'دنيا زاد',
    title: 'دنيا زاد روح الليالي',
    subtitle: 'الأخت الوفية والذكية وصاحبة السؤال العذب والشغف',
    role: 'رفيقة الشغف والوفاء',
    avatarEmoji: '🌸',
    image: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    storyId: 'shahrazad-origin',
    badge: 'زهرة القصر 🌸',
    description: 'الأخت المحبة التي تشجع شهرزاد كل ليلة وتملأ القصر بالبهجة والفضول الذكي، وتحث الأطفال على حب الحكايات.',
    themeGradient: 'from-pink-950 via-[#350a24] to-purple-950',
    accentColor: '#f472b6',
    borderGlow: 'border-pink-400 shadow-[0_0_25px_rgba(244,114,182,0.35)]',
    voiceQuote: 'ما أجمل حكاياتنا الليلة! افتح قلبك للخيال وتعلم درساً جديداً كل يوم!',
    companionTip: 'دنيا زاد تشجعك على طرح الأسئلة الذكية وحب الاستكشاف ومشاركة الحكايات.',
    traits: ['الفضول العلمي اللطيف', 'الوفاء والمحبة الصادقة', 'البهجة والتفاؤل'],
    visualAura: 'أزهار وردية عاطرة وأوشحة حريرية ليلكية ونجوم متلألئة'
  },
  {
    id: 'qamar-alzaman',
    name: 'قمر الزمان',
    title: 'قمر الزمان أمير النجوم',
    subtitle: 'الفارس النبيل الوسيم ورمز الوفاء والشهامة الشرقية',
    role: 'فارس الليالي المقمرة',
    avatarEmoji: '🌙',
    image: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    storyId: 'shahrazad-young',
    badge: 'أمير النجوم 🌙',
    description: 'أمير فروسية نبيل يتصف بالوفاء بالعهد وإغاثة الملهوف، يسافر كالشهاب بين الأقطار لينشر السلام وحسن المعاملة.',
    themeGradient: 'from-indigo-950 via-[#10193d] to-slate-950',
    accentColor: '#818cf8',
    borderGlow: 'border-indigo-400 shadow-[0_0_25px_rgba(129,140,248,0.35)]',
    voiceQuote: 'كالنجم الهادي في ظلام الليل، اجعل الصدق والوفاء دليلك الدائم في كل خطوة!',
    companionTip: 'قمر الزمان يلهمك النبل والشهامة وحسن الخلق مع الأهل والأصدقاء.',
    traits: ['الشهامة والفروسية', 'الوفاء بالعهد', 'الوقار والأناقة وحسن السمت'],
    visualAura: 'هلال فضي متوهج ورداء نيلي ساحر مرصع بغبار النجوم'
  },
  {
    id: 'dark-knight',
    name: 'فارس الظلام',
    title: 'فارس الظلام حامي المملكة',
    subtitle: 'حارس القوافل وسيف الحق الساهر في جوف الليل لحماية الضعفاء',
    role: 'درع العدالة والشجاعة',
    avatarEmoji: '🛡️',
    image: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    storyId: 'ali-baba-morgiana',
    badge: 'حامي العدالة 🛡️',
    description: 'فارس مقدام ملثم يحرس دروب الصحراء والمدن ليلاً، ينصر المظلوم ويقف سداً منيعاً أمام الأشرار بكل بسالة وتواضع.',
    themeGradient: 'from-neutral-950 via-[#1f1924] to-[#120a1f]',
    accentColor: '#fbbf24',
    borderGlow: 'border-amber-500 shadow-[0_0_25px_rgba(251,191,36,0.3)]',
    voiceQuote: 'لا تخف من عتمة الليل! ما دمت على حق فأنت في أمان وقوة لا تُقهر!',
    companionTip: 'فارس الظلام يمنحك الشجاعة وروح الدفاع عن الضعفاء والمظلومين وحب العدل.',
    traits: ['اليقظة والحذر', 'نصرة الضعفاء', 'الإقدام والصلابة والوفاء بالعهد'],
    visualAura: 'درع معدني داكن مطعم بنحاس عتيق وسيف العدل البراق'
  },
  {
    id: 'sinbad',
    name: 'السندباد',
    title: 'السندباد البحار الأسطوري',
    subtitle: 'قاهر أمواج المحيطات ومستكشف البحار السبعة وطائر الرخ',
    role: 'ربان المغامرة والاستكشاف',
    avatarEmoji: '⚓',
    image: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    storyId: 'sinbad-sailor',
    badge: 'البحار السبع 🌊',
    description: 'ربان بحري لا يهاب الأهوال، خاض سبع رحلات عجيبة واكتشف جزر الألماس وطائر الرخ، ويعلم الصغار الصبر وقوة الإرادة.',
    themeGradient: 'from-cyan-950 via-[#082a3a] to-blue-950',
    accentColor: '#22d3ee',
    borderGlow: 'border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)]',
    voiceQuote: 'ارفعوا الأشرعة وواجهوا الأمواج! لا يوجد مستحيل أمام قلب يملؤه الإصرار!',
    companionTip: 'السندباد يعلمك الصبر عند الشدائد والاستمرار في المحاولة حتى النجاح.',
    traits: ['الإصرار وعدم الاستسلام', 'حب الاستكشاف والمغامرة', 'الكرم ومحبة الرفاق'],
    visualAura: 'مرساة بحرية ذهبية وسفينة بأشرعة بيضاء وبوصلة الموانئ'
  },
  {
    id: 'jasmine',
    name: 'ياسمين',
    title: 'الأميرة ياسمين زهرة الشرق',
    subtitle: 'أميرة البساتين العاطرة ورسولة الحرية والرحمة وحب الخير',
    role: 'حامية الطبيعة والخير',
    avatarEmoji: '🦚',
    image: '/assets/aistudio/Capture_d__cran_2026-10-19_114332_ce58ab60.png',
    storyId: 'aladdin-lamp',
    badge: 'زهرة الشرق 🦚',
    description: 'أميرة طيبة القلب تعشق أزهار الياسمين والحيوانات، ترفض الظلم وتنشر العطف والرحمة وتساعد الجميع بابتسامتها المشرقة.',
    themeGradient: 'from-teal-950 via-[#052b2b] to-emerald-950',
    accentColor: '#2dd4bf',
    borderGlow: 'border-teal-400 shadow-[0_0_25px_rgba(45,212,191,0.35)]',
    voiceQuote: 'القلب الشجاع والطيب يطير حراً كنسيم الصباح وينشر الفرح في كل مكان!',
    companionTip: 'ياسمين ترافقك لتملأ وقتك باللطف وتقدير الجمال والرحمة بالكائنات.',
    traits: ['الرحمة والعطف', 'عزة النفس والصدق', 'حب الطبيعة والحرية والجمال'],
    visualAura: 'أزهار ياسمين تركوازية عاطرة وريش طاووس زمردي ساحر'
  }
];

export const CATEGORIES_LIST = [
  { id: 'all', label: 'جميع القصص والمغامرات', icon: '🌟', color: 'from-amber-400 to-orange-500' },
  { id: 'cooking', label: 'قصص الطبخ والمطبخ الممتع 👨‍🍳🍲', icon: '🍲', color: 'from-amber-500 to-rose-600' },
  { id: 'foreign_languages', label: 'قصص باللغات الأجنبية 🌍', icon: '🌍', color: 'from-emerald-500 to-teal-600' },
  { id: 'sunnah', label: 'ركن السُنّة النبوية (سور وأدعية)', icon: '🕌', color: 'from-emerald-600 to-teal-700' },
  { id: 'shahrazad', label: 'عالم شهرزاد (ألف ليلة وليلة)', icon: '👸', color: 'from-purple-500 to-indigo-600' },
  { id: 'heritage', label: 'كنوز التراث والشعبيات', icon: '📜', color: 'from-amber-600 to-yellow-600' },
  { id: 'knowledge', label: 'مستكشفو المعرفة والعلوم', icon: '🚀', color: 'from-blue-500 to-cyan-500' },
  { id: 'fantasy', label: 'عالم القصص الخيالية', icon: '✨', color: 'from-pink-500 to-purple-600' },
  { id: 'sleep', label: 'راديو النوم وقصص الاسترخاء', icon: '🌙', color: 'from-indigo-600 to-slate-800' },
];
