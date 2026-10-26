import React from 'react';
import { ShahrazadCharacter } from '../types';

interface ShahrazadCharacterAvatarProps {
  characterId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
}

export const ShahrazadCharacterAvatar: React.FC<ShahrazadCharacterAvatarProps> = ({
  characterId,
  size = 'md',
  showBadge = true,
  className = '',
  animated = false,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-[9px] -bottom-1 -left-1',
    md: 'w-6 h-6 text-xs -bottom-1.5 -left-1.5',
    lg: 'w-8 h-8 text-sm -bottom-2 -left-2',
    xl: 'w-10 h-10 text-base -bottom-2.5 -left-2.5',
  };

  // Render rich custom vector illustration for each of the 8 characters
  const renderIllustration = () => {
    switch (characterId) {
      // 1. شهرزاد (Shahrazad) - Queen of Stories
      case 'shahrazad':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="sh-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a0e4e" />
                <stop offset="50%" stopColor="#2c0b4d" />
                <stop offset="100%" stopColor="#150529" />
              </linearGradient>
              <linearGradient id="sh-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffe066" />
                <stop offset="50%" stopColor="#f59f00" />
                <stop offset="100%" stopColor="#d9480f" />
              </linearGradient>
              <linearGradient id="sh-veil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#sh-bg)" stroke="url(#sh-gold)" strokeWidth="2.5" />
            {/* Stars Aura */}
            <circle cx="20" cy="25" r="1.5" fill="#ffd43b" opacity="0.8" />
            <circle cx="82" cy="22" r="1.5" fill="#ffd43b" opacity="0.8" />
            <circle cx="18" cy="70" r="1.2" fill="#ffd43b" opacity="0.6" />
            <circle cx="85" cy="65" r="1.2" fill="#ffd43b" opacity="0.6" />
            {/* Royal Veiled Hair / Hijab */}
            <path d="M22 65 C22 30, 32 18, 50 18 C68 18, 78 30, 78 65 C78 85, 70 94, 50 94 C30 94, 22 85, 22 65 Z" fill="url(#sh-veil)" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="19" ry="21" fill="#fde2c7" />
            {/* Hair bangs */}
            <path d="M33 42 C40 38, 48 40, 50 46 C52 40, 60 38, 67 42 C65 34, 58 32, 50 32 C42 32, 35 34, 33 42 Z" fill="#2d1200" />
            {/* Eyes */}
            <ellipse cx="43" cy="51" rx="3.2" ry="2.2" fill="#382110" />
            <circle cx="44" cy="50.2" r="1" fill="#ffffff" />
            <ellipse cx="57" cy="51" rx="3.2" ry="2.2" fill="#382110" />
            <circle cx="58" cy="50.2" r="1" fill="#ffffff" />
            {/* Kohl eye wings */}
            <path d="M39 51 Q43 47 47 51" stroke="#2c0b4d" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M53 51 Q57 47 61 51" stroke="#2c0b4d" strokeWidth="1" fill="none" strokeLinecap="round" />
            {/* Gentle smile */}
            <path d="M46 62 Q50 65 54 62" stroke="#e03131" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            {/* Blushes */}
            <circle cx="39" cy="58" r="2.8" fill="#ff8787" opacity="0.4" />
            <circle cx="61" cy="58" r="2.8" fill="#ff8787" opacity="0.4" />
            {/* Golden Diadem / Crown */}
            <path d="M35 33 L42 22 L50 28 L58 22 L65 33 Z" fill="url(#sh-gold)" stroke="#ffe066" strokeWidth="0.8" />
            <circle cx="50" cy="28" r="2.5" fill="#f03e3e" />
            <circle cx="42" cy="22" r="1.5" fill="#74c0fc" />
            <circle cx="58" cy="22" r="1.5" fill="#74c0fc" />
            {/* Golden forehead jewel drop */}
            <circle cx="50" cy="38" r="1.5" fill="url(#sh-gold)" />
          </svg>
        );

      // 2. علاء الدين (Aladdin) - The Lamp Adventurer
      case 'aladdin':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="al-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0c2540" />
                <stop offset="100%" stopColor="#1a4d6e" />
              </linearGradient>
              <linearGradient id="al-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffd43b" />
                <stop offset="100%" stopColor="#f59f00" />
              </linearGradient>
              <linearGradient id="al-turban" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f8f9fa" />
                <stop offset="100%" stopColor="#ced4da" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#al-bg)" stroke="url(#al-gold)" strokeWidth="2.5" />
            {/* Face */}
            <ellipse cx="50" cy="54" rx="20" ry="21" fill="#f3d0a6" />
            {/* Turban */}
            <ellipse cx="50" cy="33" rx="26" ry="16" fill="url(#al-turban)" />
            <path d="M26 33 C26 23, 40 20, 50 20 C60 20, 74 23, 74 33 C74 41, 62 44, 50 44 C38 44, 26 41, 26 33 Z" fill="url(#al-turban)" />
            {/* Feather on turban */}
            <path d="M50 24 C52 14, 58 10, 60 7 C54 11, 49 18, 48 24 Z" fill="#e03131" />
            {/* Gem on turban */}
            <circle cx="50" cy="27" r="4" fill="url(#al-gold)" />
            <circle cx="50" cy="27" r="2.2" fill="#74c0fc" />
            {/* Hair strands */}
            <path d="M30 46 C34 54, 33 60, 31 63" stroke="#212529" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M70 46 C66 54, 67 60, 69 63" stroke="#212529" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Bold cheerful eyes */}
            <circle cx="42" cy="52" r="3.2" fill="#212529" />
            <circle cx="43" cy="51" r="1.1" fill="#ffffff" />
            <circle cx="58" cy="52" r="3.2" fill="#212529" />
            <circle cx="59" cy="51" r="1.1" fill="#ffffff" />
            {/* Eyebrows */}
            <path d="M38 46 Q43 43 47 46" stroke="#212529" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M53 46 Q57 43 62 46" stroke="#212529" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Friendly big grin */}
            <path d="M43 62 Q50 70 57 62" stroke="#d9480f" strokeWidth="2.2" fill="#ffffff" strokeLinecap="round" />
            {/* Magic Lamp at bottom */}
            <path d="M70 78 C70 74, 82 72, 85 75 C88 78, 80 84, 75 84 Z" fill="url(#al-gold)" />
            <path d="M68 76 C65 73, 62 76, 64 80 C67 84, 76 84, 76 80 Z" fill="url(#al-gold)" />
            <path d="M85 75 Q90 73 90 70" stroke="#38bdf8" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
          </svg>
        );

      // 3. الحكيم (Al-Hakim / The Sage) - Emerald Elder of Wisdom
      case 'al-hakim':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="hk-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#042f2e" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
              <linearGradient id="hk-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#hk-bg)" stroke="url(#hk-gold)" strokeWidth="2.5" />
            {/* Sage Hood / Green Turban */}
            <path d="M25 40 C25 20, 36 15, 50 15 C64 15, 75 20, 75 40 C75 55, 72 65, 70 75 L30 75 C28 65, 25 55, 25 40 Z" fill="#064e3b" />
            {/* Face */}
            <ellipse cx="50" cy="48" rx="19" ry="19" fill="#fbe4d8" />
            {/* Wise Spectacles */}
            <circle cx="43" cy="47" r="4.5" fill="none" stroke="url(#hk-gold)" strokeWidth="1.5" />
            <circle cx="57" cy="47" r="4.5" fill="none" stroke="url(#hk-gold)" strokeWidth="1.5" />
            <line x1="47.5" y1="47" x2="52.5" y2="47" stroke="url(#hk-gold)" strokeWidth="1.5" />
            {/* Gentle kindly eyes inside glasses */}
            <path d="M40 47 Q43 44 46 47" stroke="#334155" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M54 47 Q57 44 60 47" stroke="#334155" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            {/* Majestic Venerable White Beard */}
            <path d="M33 55 C33 78, 42 90, 50 92 C58 90, 67 78, 67 55 C63 60, 58 62, 50 62 C42 62, 37 60, 33 55 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            {/* Moustache */}
            <path d="M38 56 Q45 61 50 58 Q55 61 62 56 Q55 54 50 56 Q45 54 38 56 Z" fill="#e2e8f0" />
            {/* Emerald Star on cap */}
            <polygon points="50,17 52,22 57,22 53,25 55,30 50,27 45,30 47,25 43,22 48,22" fill="url(#hk-gold)" />
          </svg>
        );

      // 4. دنيا زاد (Dunyazad) - The Sweet Loyal Sister
      case 'dunyazad':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="dz-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4c0519" />
                <stop offset="60%" stopColor="#831843" />
                <stop offset="100%" stopColor="#be185d" />
              </linearGradient>
              <linearGradient id="dz-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fdf2f8" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#dz-bg)" stroke="url(#dz-gold)" strokeWidth="2.5" />
            {/* Cute braided hair buns with pink flowers */}
            <circle cx="28" cy="38" r="11" fill="#3f1d0b" />
            <circle cx="72" cy="38" r="11" fill="#3f1d0b" />
            {/* Pink flowers on buns */}
            <circle cx="28" cy="38" r="5" fill="#f472b6" />
            <circle cx="28" cy="38" r="2" fill="#fef08a" />
            <circle cx="72" cy="38" r="5" fill="#f472b6" />
            <circle cx="72" cy="38" r="2" fill="#fef08a" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="20" ry="20" fill="#fee5d9" />
            {/* Hair bangs */}
            <path d="M30 42 C40 34, 60 34, 70 42 C65 33, 58 30, 50 30 C42 30, 35 33, 30 42 Z" fill="#3f1d0b" />
            {/* Sparkling curious big eyes */}
            <ellipse cx="42" cy="50" rx="3.8" ry="4.5" fill="#1e293b" />
            <circle cx="43.5" cy="48" r="1.5" fill="#ffffff" />
            <circle cx="41" cy="52" r="0.8" fill="#ffffff" />
            <ellipse cx="58" cy="50" rx="3.8" ry="4.5" fill="#1e293b" />
            <circle cx="59.5" cy="48" r="1.5" fill="#ffffff" />
            <circle cx="57" cy="52" r="0.8" fill="#ffffff" />
            {/* Rosy glowing cheeks */}
            <ellipse cx="36" cy="58" rx="3.5" ry="2" fill="#fb7185" opacity="0.55" />
            <ellipse cx="64" cy="58" rx="3.5" ry="2" fill="#fb7185" opacity="0.55" />
            {/* Sweet playful smile */}
            <path d="M45 61 Q50 67 55 61" stroke="#e11d48" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Headband with pearls */}
            <path d="M32 37 Q50 32 68 37" stroke="#fbcfe8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="34" r="3" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
          </svg>
        );

      // 5. قمر الزمان (Qamar Al-Zaman) - Noble Lunar Prince
      case 'qamar-alzaman':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="qz-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0b0f2e" />
                <stop offset="60%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
              <linearGradient id="qz-silver" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#qz-bg)" stroke="url(#qz-silver)" strokeWidth="2.5" />
            {/* Midnight blue silk turban */}
            <ellipse cx="50" cy="34" rx="25" ry="16" fill="#1e1b4b" stroke="url(#qz-silver)" strokeWidth="1.2" />
            {/* Crescent moon ornament on turban */}
            <path d="M54 22 A 6 6 0 0 0 46 30 A 6 6 0 1 1 54 22 Z" fill="#e0e7ff" />
            {/* Noble face */}
            <ellipse cx="50" cy="54" rx="19" ry="21" fill="#f8dfcb" />
            {/* Dark flowing hair */}
            <path d="M30 45 C28 55, 30 65, 32 70" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M70 45 C72 55, 70 65, 68 70" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            {/* Dignified eyes */}
            <ellipse cx="43" cy="52" rx="3.4" ry="2.4" fill="#1e1b4b" />
            <circle cx="44" cy="51" r="1.1" fill="#ffffff" />
            <ellipse cx="57" cy="52" rx="3.4" ry="2.4" fill="#1e1b4b" />
            <circle cx="58" cy="51" r="1.1" fill="#ffffff" />
            {/* Fine eyebrows */}
            <path d="M38 46 Q43 43 47 46" stroke="#0f172a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M53 46 Q57 43 62 46" stroke="#0f172a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Gentle confident smile */}
            <path d="M45 63 Q50 67 55 63" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Silver star constellation on cloak */}
            <circle cx="50" cy="80" r="1.8" fill="#e0e7ff" />
            <circle cx="42" cy="83" r="1.3" fill="#e0e7ff" />
            <circle cx="58" cy="83" r="1.3" fill="#e0e7ff" />
          </svg>
        );

      // 6. فارس الظلام (The Dark Knight) - Protector of the Realm
      case 'dark-knight':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="dk-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="60%" stopColor="#27272a" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
              <linearGradient id="dk-armor" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#52525b" />
                <stop offset="50%" stopColor="#27272a" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id="dk-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#dk-bg)" stroke="url(#dk-gold)" strokeWidth="2.5" />
            {/* Shadow Knight Hood & Mantle */}
            <path d="M22 68 C20 40, 30 18, 50 18 C70 18, 80 40, 78 68 C75 88, 65 94, 50 94 C35 94, 25 88, 22 68 Z" fill="url(#dk-armor)" stroke="#3f3f46" strokeWidth="1.5" />
            {/* Face in shadow */}
            <ellipse cx="50" cy="52" rx="18" ry="19" fill="#e4c5a7" />
            {/* Knight Cowl Forehead Protector */}
            <path d="M30 40 L50 48 L70 40 L70 34 L50 30 L30 34 Z" fill="#27272a" stroke="url(#dk-gold)" strokeWidth="1.5" />
            <polygon points="50,33 53,38 58,38 54,41 56,46 50,43 44,46 46,41 42,38 47,38" fill="url(#dk-gold)" />
            {/* Piercing resolute hero eyes */}
            <polygon points="40,51 46,50 45,53 40,53" fill="#fbbf24" />
            <polygon points="60,51 54,50 55,53 60,53" fill="#fbbf24" />
            {/* Steadfast mouth */}
            <line x1="46" y1="63" x2="54" y2="63" stroke="#713f12" strokeWidth="2" strokeLinecap="round" />
            {/* Golden Shield crest on chest */}
            <path d="M44 76 L50 72 L56 76 L56 83 C56 87, 50 90, 50 90 C50 90, 44 87, 44 83 Z" fill="url(#dk-gold)" stroke="#ffffff" strokeWidth="0.8" />
          </svg>
        );

      // 7. السندباد (Sinbad) - Master of the Seven Seas
      case 'sinbad':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="sb-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#083344" />
                <stop offset="60%" stopColor="#0e7490" />
                <stop offset="100%" stopColor="#155e75" />
              </linearGradient>
              <linearGradient id="sb-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#sb-bg)" stroke="url(#sb-gold)" strokeWidth="2.5" />
            {/* Sea sailor turban (White & Gold) */}
            <ellipse cx="50" cy="33" rx="26" ry="16" fill="#f8fafc" stroke="url(#sb-gold)" strokeWidth="1.5" />
            <path d="M26 33 Q50 25 74 33 Q50 38 26 33 Z" fill="#0891b2" />
            {/* Golden Sailor Anchor Emblem */}
            <path d="M50 24 L50 32 M46 29 C46 34, 54 34, 54 29 M47 26 A 3 3 0 1 1 53 26" stroke="url(#sb-gold)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Face (tanned adventurous) */}
            <ellipse cx="50" cy="54" rx="19" ry="20" fill="#e2b184" />
            {/* Daring trim goatee beard */}
            <path d="M46 68 Q50 75 54 68 Z" fill="#292524" />
            {/* Cheerful adventurer eyes */}
            <ellipse cx="42" cy="51" rx="3.2" ry="2.8" fill="#1c1917" />
            <circle cx="43" cy="50" r="1.1" fill="#ffffff" />
            <ellipse cx="58" cy="51" rx="3.2" ry="2.8" fill="#1c1917" />
            <circle cx="59" cy="50" r="1.1" fill="#ffffff" />
            {/* Broad fearless captain smile */}
            <path d="M43 61 Q50 68 57 61" stroke="#991b1b" strokeWidth="2.2" fill="#ffffff" strokeLinecap="round" />
            {/* Gold hoop earring */}
            <circle cx="29" cy="55" r="2.5" fill="none" stroke="url(#sb-gold)" strokeWidth="1.5" />
          </svg>
        );

      // 8. ياسمين (Princess Jasmine) - Free Spirit & Garden Grace
      case 'jasmine':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="js-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#042f2e" />
                <stop offset="50%" stopColor="#115e59" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
              <linearGradient id="js-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
              <linearGradient id="js-teal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#js-bg)" stroke="url(#js-gold)" strokeWidth="2.5" />
            {/* Luscious long dark hair flowing */}
            <path d="M22 65 C20 40, 30 20, 50 20 C70 20, 80 40, 78 65 C80 85, 70 94, 50 94 C30 94, 20 85, 22 65 Z" fill="#172554" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="19" ry="21" fill="#fbd5b5" />
            {/* Turquoise headband */}
            <path d="M30 40 Q50 34 70 40" stroke="url(#js-teal)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            {/* Sapphire jewel on headband */}
            <circle cx="50" cy="37" r="3.2" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
            {/* Beautiful almond eyes */}
            <ellipse cx="43" cy="50" rx="3.5" ry="2.5" fill="#1e293b" />
            <circle cx="44" cy="49" r="1.1" fill="#ffffff" />
            <ellipse cx="57" cy="50" rx="3.5" ry="2.5" fill="#1e293b" />
            <circle cx="58" cy="49" r="1.1" fill="#ffffff" />
            {/* Kohl liner wings */}
            <path d="M38 50 Q43 45 48 50" stroke="#042f2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M52 50 Q57 45 62 50" stroke="#042f2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Sweet radiant smile */}
            <path d="M45 62 Q50 66 55 62" stroke="#dc2626" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* White Jasmine flowers in hair */}
            <circle cx="28" cy="52" r="3" fill="#ffffff" />
            <circle cx="28" cy="52" r="1.2" fill="#fef08a" />
            <circle cx="72" cy="52" r="3" fill="#ffffff" />
            <circle cx="72" cy="52" r="1.2" fill="#fef08a" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            ✨
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-block rounded-full flex-shrink-0 cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${sizeClasses[size]} ${className}`}
    >
      <div className={`w-full h-full rounded-full overflow-hidden shadow-lg ${animated ? 'animate-pulse' : ''}`}>
        {renderIllustration()}
      </div>

      {showBadge && (
        <span
          className={`absolute rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center shadow border border-amber-200 ${badgeSizeClasses[size]}`}
        >
          {characterId === 'shahrazad' && '👑'}
          {characterId === 'aladdin' && '🪔'}
          {characterId === 'al-hakim' && '📜'}
          {characterId === 'dunyazad' && '🌸'}
          {characterId === 'qamar-alzaman' && '🌙'}
          {characterId === 'dark-knight' && '🛡️'}
          {characterId === 'sinbad' && '⚓'}
          {characterId === 'jasmine' && '🦚'}
        </span>
      )}
    </div>
  );
};
