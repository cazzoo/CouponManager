import React from 'react';
import { Palette } from 'lucide-react';
import { useThemeStore, THEME_OPTIONS } from '../stores/themeStore';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value as any);
  };

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle"
        aria-label="Select theme"
      >
        <Palette size={20} />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto"
      >
        <div className="form-control">
          <label className="label" htmlFor="theme-select">
            <span className="label-text font-semibold">Theme</span>
          </label>
          <select
            id="theme-select"
            className="select select-bordered select-sm w-full"
            value={theme}
            onChange={handleThemeChange}
          >
            {THEME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
