import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Palette,
  Languages,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { useThemeStore, THEME_OPTIONS, ThemeMode } from '../stores/themeStore';
import type { User as UserType } from '../types';

interface UserMenuProps {
  user: UserType;
  onSignOut: () => void;
}

interface ThemeCategory {
  name: string;
  themes: { value: ThemeMode; label: string }[];
}

const THEME_CATEGORIES: ThemeCategory[] = [
  {
    name: 'Basic',
    themes: THEME_OPTIONS.filter(t => ['light', 'dark'].includes(t.value))
  },
  {
    name: 'Colorful',
    themes: THEME_OPTIONS.filter(t =>
      ['cupcake', 'bumblebee', 'emerald', 'corporate', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'autumn', 'lemonade', 'nord', 'sunset', 'caramellatte', 'silk'].includes(t.value)
    )
  },
  {
    name: 'Special',
    themes: THEME_OPTIONS.filter(t =>
      ['synthwave', 'retro', 'cyberpunk', 'black', 'luxury', 'dracula', 'cmyk', 'business', 'acid', 'night', 'coffee', 'winter', 'dim', 'abyss'].includes(t.value)
    )
  }
];

const getRoleBadgeClass = (role: string): string => {
  switch (role) {
    case 'manager':
      return 'badge-primary';
    case 'demo':
      return 'badge-secondary';
    default:
      return 'badge-ghost';
  }
};

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'manager':
      return 'Manager';
    case 'demo':
      return 'Demo';
    default:
      return 'User';
  }
};

const UserMenu: React.FC<UserMenuProps> = ({ user, onSignOut }) => {
  const { language, changeLanguage, getSupportedLanguages } = useLanguage();
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeSectionOpen, setIsThemeSectionOpen] = useState(false);
  const [isLanguageSectionOpen, setIsLanguageSectionOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languages = getSupportedLanguages();
  const currentThemeIndex = THEME_OPTIONS.findIndex(t => t.value === theme);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsThemeSectionOpen(false);
        setIsLanguageSectionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsThemeSectionOpen(false);
        setIsLanguageSectionOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSignOut = () => {
    setIsOpen(false);
    onSignOut();
  };

  const handleThemeSelect = (selectedTheme: ThemeMode) => {
    setTheme(selectedTheme);
  };

  const handleLanguageSelect = (langCode: string) => {
    changeLanguage(langCode);
  };

  const handlePreviousTheme = () => {
    if (currentThemeIndex === -1) {
      setTheme(THEME_OPTIONS[0].value);
      return;
    }
    const newIndex = currentThemeIndex === 0 ? THEME_OPTIONS.length - 1 : currentThemeIndex - 1;
    setTheme(THEME_OPTIONS[newIndex].value);
  };

  const handleNextTheme = () => {
    if (currentThemeIndex === -1) {
      setTheme(THEME_OPTIONS[0].value);
      return;
    }
    const newIndex = (currentThemeIndex + 1) % THEME_OPTIONS.length;
    setTheme(THEME_OPTIONS[newIndex].value);
  };

  const handlePreviousLanguage = () => {
    const currentIndex = languages.findIndex(lang => lang.code === language);
    const newIndex = currentIndex === 0 ? languages.length - 1 : currentIndex - 1;
    changeLanguage(languages[newIndex].code);
  };

  const handleNextLanguage = () => {
    const currentIndex = languages.findIndex(lang => lang.code === language);
    const newIndex = (currentIndex + 1) % languages.length;
    changeLanguage(languages[newIndex].code);
  };

  const getCurrentLanguageName = (): string => {
    const currentLang = languages.find(lang => lang.code === language);
    return currentLang ? currentLang.name : 'English';
  };

  return (
    <div className="dropdown dropdown-end" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-circle avatar placeholder"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
          <User size={20} />
        </div>
        <ChevronDown size={14} className="ml-1" />
      </button>

      {isOpen && (
        <ul
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 w-[30rem] p-3 shadow-xl border border-base-200"
          role="menu"
        >
          <li className="menu-title px-3 py-2" role="none">
            <div className="flex flex-col">
              <span className="font-semibold text-base truncate">{user.email}</span>
              <span className={`badge badge-sm mt-1 w-fit ${getRoleBadgeClass(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </li>

          <div className="divider my-1" role="separator" />

          <li role="none">
            <div className="bg-base-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-2 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Palette size={16} className="shrink-0" />
                  <span className="text-sm font-medium">Theme</span>
                  <span className="badge badge-sm badge-outline shrink-0">{theme}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handlePreviousTheme}
                    className="btn btn-xs btn-circle btn-ghost"
                    aria-label="Previous theme"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={handleNextTheme}
                    className="btn btn-xs btn-circle btn-ghost"
                    aria-label="Next theme"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setIsThemeSectionOpen(!isThemeSectionOpen)}
                    className="btn btn-xs btn-ghost px-2"
                    aria-label="Toggle theme options"
                    aria-expanded={isThemeSectionOpen}
                  >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isThemeSectionOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              <div 
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                  isThemeSectionOpen ? 'max-h-[600px]' : 'max-h-0'
                }`}
              >
                <div className="flex flex-col gap-2 p-2 pt-0">
                  {THEME_CATEGORIES.map((category) => (
                    <div key={category.name} className="flex flex-col gap-1">
                      <span className="text-xs font-medium opacity-60 px-2">
                        {category.name}
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {category.themes.map((themeOption) => (
                          <button
                            key={themeOption.value}
                            onClick={() => handleThemeSelect(themeOption.value)}
                            className={`btn btn-xs justify-start h-8 ${
                              theme === themeOption.value
                                ? 'btn-primary btn-outline'
                                : 'btn-ghost'
                            }`}
                            aria-label={`Select ${themeOption.label} theme`}
                            aria-pressed={theme === themeOption.value}
                          >
                            {theme === themeOption.value && <Check size={12} />}
                            <span className="truncate">{themeOption.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </li>

          <li role="none">
            <div className="bg-base-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-2 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Languages size={16} className="shrink-0" />
                  <span className="text-sm font-medium">Language</span>
                  <span className="badge badge-sm badge-outline shrink-0">
                    {getCurrentLanguageName()}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handlePreviousLanguage}
                    className="btn btn-xs btn-circle btn-ghost"
                    aria-label="Previous language"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={handleNextLanguage}
                    className="btn btn-xs btn-circle btn-ghost"
                    aria-label="Next language"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setIsLanguageSectionOpen(!isLanguageSectionOpen)}
                    className="btn btn-xs btn-ghost px-2"
                    aria-label="Toggle language options"
                    aria-expanded={isLanguageSectionOpen}
                  >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isLanguageSectionOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              <div 
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                  isLanguageSectionOpen ? 'max-h-[300px]' : 'max-h-0'
                }`}
              >
                <div className="flex flex-col gap-1 p-2 pt-0">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`btn btn-xs justify-start h-8 ${
                        language === lang.code
                          ? 'btn-primary btn-outline'
                          : 'btn-ghost'
                      }`}
                      aria-label={`Select ${lang.name} language`}
                      aria-pressed={language === lang.code}
                    >
                      {language === lang.code && <Check size={12} />}
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </li>

          <div className="divider my-1" role="separator" />

          <li role="none">
            <button
              onClick={handleSignOut}
              className="btn btn-ghost btn-sm justify-start gap-2 text-error"
              aria-label="Sign out"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default UserMenu;
