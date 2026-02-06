import React, { useState, MouseEvent, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';

interface Language {
  code: string;
  name: string;
}

const LanguageSelector: React.FC = () => {
  const { language, changeLanguage, t, getSupportedLanguages } = useLanguage();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  
  const languages: Language[] = getSupportedLanguages();
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 639px)').matches);
    };
    
    checkMobile();
    
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    mediaQuery.addEventListener('change', checkMobile);
    
    return () => {
      mediaQuery.removeEventListener('change', checkMobile);
    };
  }, []);
  
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(event.target.value);
  };
  
  const handleMobileClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMobileClose = (languageCode?: string) => {
    setAnchorEl(null);
    if (languageCode) {
      changeLanguage(languageCode);
    }
  };
  
  const getCurrentLanguageName = (): string => {
    const currentLang = languages.find(lang => lang.code === language);
    return currentLang ? currentLang.name : 'English';
  };
  
  if (isMobile) {
    return (
      <div className="ml-1" data-testid="language-selector">
        <div className="dropdown dropdown-end">
          <button
            onClick={handleMobileClick}
            className="btn btn-circle btn-ghost btn-sm"
            aria-label={t('language')}
            tabIndex={0}
          >
            <Languages size={20} />
          </button>
          <ul className={`dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 ${open ? 'menu-open' : ''}`} tabIndex={0}>
            {languages.map((lang) => (
              <li key={lang.code}>
                <a
                  onClick={() => handleMobileClose(lang.code)}
                  className={`text-base-content hover:bg-base-200 ${language === lang.code ? 'active' : ''}`}
                >
                  {lang.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className="hidden md:block ml-2" data-testid="language-selector">
      <div className="form-control min-w-[120px]">
        <label className="label" htmlFor="language-select">
          <span className="label-text">{t('language')}</span>
        </label>
        <select
          id="language-select"
          className="select select-bordered select-sm w-full max-w-xs text-base-content"
          value={language}
          onChange={handleChange}
          aria-label={t('language')}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector; 