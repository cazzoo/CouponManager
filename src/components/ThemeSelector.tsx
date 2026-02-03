import React, { useState, useEffect } from 'react';
import { Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { useThemeStore, THEME_OPTIONS } from '../stores/themeStore';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const currentIndex = THEME_OPTIONS.findIndex(option => option.value === theme);
    setSelectedIndex(Math.max(0, currentIndex));
  }, [theme]);

  const selectTheme = (newTheme: typeof theme, index: number) => {
    setTheme(newTheme);
    setIsOpen(false);
    setSelectedIndex(index);
  };

  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? THEME_OPTIONS.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    selectTheme(THEME_OPTIONS[newIndex].value, newIndex);
  };

  const handleNext = () => {
    const newIndex = (selectedIndex + 1) % THEME_OPTIONS.length;
    setSelectedIndex(newIndex);
    selectTheme(THEME_OPTIONS[newIndex].value, newIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const currentTheme = THEME_OPTIONS[selectedIndex];

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle"
        aria-label="Select theme"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette size={20} />
        <div className="badge badge-primary badge-xs absolute -top-0 -right-0 w-3 h-3">
          {currentTheme.label.charAt(0)}
        </div>
      </div>
      
      {isOpen && (
        <div
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64"
          onKeyDown={handleKeyDown}
        >
          <div className="text-center mb-2">
            <div className="font-bold text-lg mb-2">{currentTheme.label}</div>
            <div className="text-sm opacity-70">
              Theme {selectedIndex + 1} of {THEME_OPTIONS.length}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {THEME_OPTIONS.map((option, index) => (
              <button
                key={option.value}
                className={`btn btn-sm w-full justify-start ${
                  option.value === theme
                    ? 'btn-primary text-primary-content'
                    : 'btn-ghost hover:bg-base-200'
                }`}
                onClick={() => selectTheme(option.value, index)}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1 text-left">{option.label}</span>
                  {option.value === theme && (
                    <span className="text-primary-content text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="hidden md:flex md:flex-col md:items-center md:gap-1 ml-2">
        <button
          className="btn btn-ghost btn-circle btn-sm"
          onClick={handlePrevious}
          aria-label="Previous theme"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className="btn btn-ghost btn-circle btn-sm"
          onClick={handleNext}
          aria-label="Next theme"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;
