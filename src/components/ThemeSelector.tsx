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
    <div className="dropdown dropdown-end relative">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-primary btn-sm text-primary-content w-32 h-12 flex items-center justify-between gap-2 px-3"
        aria-label={`Current theme: ${currentTheme.label}. Click to change theme`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette size={16} />
        <span className="text-sm font-medium truncate flex-1">{currentTheme.label}</span>
        <ChevronRight size={14} />
      </div>
      
      {isOpen && (
        <div
          tabIndex={0}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            tabIndex={0}
            className="dropdown-content menu p-4 shadow-2xl bg-base-100 rounded-box w-80 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="text-center mb-4">
              <div className="font-bold text-lg mb-2">{currentTheme.label}</div>
              <div className="text-sm opacity-70">
                Theme {selectedIndex + 1} of {THEME_OPTIONS.length}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {THEME_OPTIONS.map((option, index) => (
                <button
                  key={option.value}
                  className={`btn btn-md w-full justify-start h-16 ${
                    option.value === theme
                      ? 'btn-primary text-primary-content shadow-lg scale-105'
                      : 'btn-ghost hover:bg-base-200'
                  } transition-all duration-200`}
                  onClick={() => selectTheme(option.value, index)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl mb-1">
                      {option.label.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="text-sm opacity-80 text-center">
                      {option.label}
                    </div>
                  </div>
                  {option.value === theme && (
                    <div className="mt-2">
                      <div className="badge badge-success badge-lg px-3 py-1 text-success-content">
                        ✓ Active
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between gap-2 mt-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:flex md:flex-col md:items-center md:gap-2 ml-2">
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
