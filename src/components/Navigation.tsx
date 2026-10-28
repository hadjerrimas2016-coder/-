import React from 'react';
import { ActiveTab, AppMode, SupportedLanguage } from '../types';
import {
  Home,
  Sparkles,
  BookOpen,
  Gamepad2,
  Mic,
  Palette,
  Shapes,
  User,
  Globe,
  Users,
  Crown,
  UtensilsCrossed,
  Trophy,
  PenTool
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface NavigationProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mode: AppMode;
  currentLang?: SupportedLanguage;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab, mode }) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'الرئيسية', icon: Home },
    { id: 'my_story' as ActiveTab, label: 'ركن قصتي 📖✨', icon: PenTool, badge: 'AI' },
    { id: 'challenges' as ActiveTab, label: 'خريطة التحديات 🎯', icon: Trophy, badge: '3D' },
    { id: 'cooking' as ActiveTab, label: 'قصص الطبخ 🍲', icon: UtensilsCrossed, badge: 'فيديو' },
    { id: 'shahrazad' as ActiveTab, label: 'عالم شهرزاد 👸', icon: Crown, badge: 'ألف ليلة' },
    { id: 'reading_club' as ActiveTab, label: 'نادي القراءة 🎙️', icon: Users, badge: 'جديد' },
    { id: 'foreign_languages' as ActiveTab, label: 'قصص باللغات 🌍', icon: Globe },
    { id: 'library' as ActiveTab, label: 'المكتبة', icon: BookOpen },
    { id: 'games' as ActiveTab, label: 'الألعاب 🎮', icon: Gamepad2 },
    { id: 'sunnah' as ActiveTab, label: 'ركن السُنّة 🕌', icon: Sparkles },
    { id: 'profile' as ActiveTab, label: 'حسابي ⭐', icon: User },
  ];

  return (
    <>
      {/* Top / Main Navigation Bar for Desktop & Tablet */}
      <nav className="w-full max-w-5xl mx-auto px-3 sm:px-4 mt-3 mb-2">
        <div
          className={`p-1.5 rounded-2xl flex items-center justify-between gap-1 shadow-lg border transition-all ${
            mode === 'day'
              ? 'bg-white/85 backdrop-blur-md border-sky-100 shadow-sky-900/5'
              : 'bg-[#18113c]/80 backdrop-blur-md border-purple-800/60 shadow-purple-950/40'
          }`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  onSelectTab(tab.id);
                }}
                className={`relative flex-1 py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? mode === 'day'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-yellow-300 shadow-md shadow-purple-900/60 scale-[1.02]'
                    : mode === 'day'
                    ? 'text-indigo-950 hover:bg-sky-50'
                    : 'text-purple-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'animate-bounce' : ''}`} />
                <span className="truncate">{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[9px] font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-2 border-t border-white/10 backdrop-blur-lg bg-[#0e0a24]/95 text-white shadow-2xl">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  onSelectTab(tab.id);
                }}
                className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-yellow-400 font-extrabold scale-110'
                    : 'text-purple-300/80 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] truncate max-w-[50px]">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
