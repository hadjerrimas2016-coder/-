import React, { useState, useRef, useEffect } from 'react';
import { AppMode, ActiveTab, SupportedLanguage } from '../types';
import { Volume2, VolumeX, Sun, Moon, LogIn, Crown, Globe, ChevronDown, Check, Sparkles, Copy, Video } from 'lucide-react';
import { playClickSound, playPopSound, setSoundMuted } from '../utils/audio';
import { User } from 'firebase/auth';
import { AVAILABLE_LANGUAGES, TRANSLATIONS, applyGoogleTranslation } from '../utils/translations';

interface HeaderProps {
  mode: AppMode;
  onToggleMode: () => void;
  starsCount: number;
  soundMuted: boolean;
  onToggleSound: () => void;
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSleepRadio: () => void;
  onOpenAdmin: () => void;
  currentUser?: User | null;
  isOwnerAdmin?: boolean;
  currentLang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onToggleMode,
  starsCount,
  soundMuted,
  onToggleSound,
  onSelectTab,
  onOpenSleepRadio,
  onOpenAdmin,
  currentUser,
  isOwnerAdmin,
  currentLang,
  onSelectLang,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.ar;
  const currentLangObj = AVAILABLE_LANGUAGES.find((l) => l.code === currentLang) || AVAILABLE_LANGUAGES[0];

  const handleCopyDomain = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPopSound();
    navigator.clipboard.writeText('https://www.raedstories.com');
    setDomainCopied(true);
    setTimeout(() => setDomainCopied(false), 2500);
  };

  // Close language menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChooseLanguage = (code: SupportedLanguage) => {
    playClickSound();
    onSelectLang(code);
    applyGoogleTranslation(code);
    setShowLangMenu(false);
  };

  const handleTranslateOther = (targetCode: string) => {
    playClickSound();
    applyGoogleTranslation(targetCode);
    setShowLangMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md transition-colors duration-500 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 py-2.5 sm:px-6">
        {/* Kid / User Profile on the Left */}
        <div
          onClick={() => {
            playClickSound();
            onSelectTab('profile');
          }}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title={t.myAccount}
        >
          {/* Avatar with Ring Glow */}
          <div className="relative">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || t.myAccount}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-amber-400 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-indigo-950 flex items-center justify-center text-xl overflow-hidden">
                  🧑‍🚀
                </div>
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 text-xs">⭐</span>
          </div>

          <div className="flex flex-col text-right">
            <span
              className={`text-xs sm:text-sm font-extrabold leading-tight ${
                mode === 'day' ? 'text-indigo-950' : 'text-white'
              }`}
            >
              {currentUser?.displayName || (currentLang === 'ar' ? 'رائد المستكشف' : 'Explorer Raed')}
            </span>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <span>{starsCount}</span>
              <span>{t.pointsLabel}</span>
              <span>⭐</span>
            </span>
          </div>
        </div>

        {/* Brand Logo in Center */}
        <div
          onClick={() => {
            playClickSound();
            onSelectTab('home');
          }}
          className="cursor-pointer group flex flex-col items-center select-none"
        >
          <div className="flex items-center gap-1">
            <span
              className={`text-2xl sm:text-3xl font-black tracking-wide ${
                mode === 'day' ? 'text-indigo-950' : 'text-white'
              }`}
            >
              {t.appName}
            </span>
            <span className="text-amber-400 text-xl font-bold animate-pulse">★</span>
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-bold ${
              mode === 'day' ? 'text-indigo-700/80' : 'text-purple-200/80'
            }`}
          >
            {t.appSlogan}
          </span>
        </div>

        {/* Action Controls on the Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher Dropdown (ترجمة الموقع لأي لغة) */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => {
                playClickSound();
                setShowLangMenu(!showLangMenu);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white border border-white/20 text-xs font-bold transition-all cursor-pointer"
              title="ترجمة الموقع لاي لغة / Translate website"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs">{currentLangObj.flag}</span>
              <span className="hidden md:inline text-[11px] font-extrabold">{currentLangObj.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Language Selector Popover */}
            {showLangMenu && (
              <div className="absolute left-0 sm:right-0 mt-2 w-56 sm:w-64 rounded-2xl p-2.5 bg-[#140e33] border border-purple-500/50 shadow-2xl z-50 text-white space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[11px] font-black text-amber-300 border-b border-white/10 flex items-center justify-between">
                  <span>ترجمة الموقع / Translate:</span>
                  <Globe className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-0.5">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = currentLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleChooseLanguage(lang.code)}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-amber-950 font-black shadow'
                            : 'hover:bg-white/10 text-purple-200 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Additional World Languages via Google Translate */}
                <div className="pt-1.5 border-t border-white/10 space-y-1">
                  <span className="text-[10px] text-purple-300/80 px-2 block font-bold">
                    لغات أخرى / More Languages:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <button
                      onClick={() => handleTranslateOther('it')}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-purple-200 text-center font-bold"
                    >
                      🇮🇹 Italiano
                    </button>
                    <button
                      onClick={() => handleTranslateOther('ru')}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-purple-200 text-center font-bold"
                    >
                      🇷🇺 Русский
                    </button>
                    <button
                      onClick={() => handleTranslateOther('zh-CN')}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-purple-200 text-center font-bold"
                    >
                      🇨🇳 中文
                    </button>
                    <button
                      onClick={() => handleTranslateOther('ja')}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-purple-200 text-center font-bold"
                    >
                      🇯🇵 日本語
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ONLY SHOWN TO OWNER: Protected Publishing & Firebase Portal */}
          {isOwnerAdmin && (
            <button
              onClick={() => {
                playClickSound();
                onOpenAdmin();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-xs font-black ring-2 ring-amber-300 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="لوحة المالك لنشر القصص وإدارة منصة فايربيز"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">{t.ownerPortal}</span>
            </button>
          )}

          {/* Sign In button for visitors who are not signed in */}
          {!currentUser && (
            <button
              onClick={() => {
                playClickSound();
                onSelectTab('profile');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white border border-white/20 text-xs font-bold transition-all cursor-pointer"
              title={t.signIn}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.signIn}</span>
            </button>
          )}

          {/* Sleep Radio Button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenSleepRadio();
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 text-yellow-300 border border-purple-500/50 shadow-md font-extrabold text-xs transition-all active:scale-95 cursor-pointer"
            title={t.sleepRadio}
          >
            <span className="hidden sm:inline">{t.sleepRadio.replace('🌙', '')}</span>
            <span>🌙</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={() => {
              onToggleSound();
              setSoundMuted(!soundMuted);
            }}
            className={`p-2 rounded-full cursor-pointer transition-transform active:scale-90 border shadow-sm ${
              mode === 'day'
                ? 'bg-white/80 border-sky-200 text-sky-800 hover:bg-white'
                : 'bg-indigo-950/70 border-purple-800 text-purple-200 hover:bg-indigo-900'
            }`}
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Day / Night Mode Switcher */}
          <button
            onClick={() => {
              playClickSound();
              onToggleMode();
            }}
            className={`p-2 rounded-full cursor-pointer transition-transform active:scale-90 border shadow-sm ${
              mode === 'day'
                ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                : 'bg-indigo-950 border-purple-600 text-yellow-300 hover:bg-indigo-900'
            }`}
            title={mode === 'day' ? t.nightMode : t.dayMode}
          >
            {mode === 'day' ? (
              <Sun className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '20s' }} />
            ) : (
              <Moon className="w-4 h-4 text-yellow-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
