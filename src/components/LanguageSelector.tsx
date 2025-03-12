import React, { useState, MouseEvent, ChangeEvent } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
  useMediaQuery,
  IconButton,
  Menu,
  SelectChangeEvent
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../services/LanguageContext';

interface Language {
  code: string;
  name: string;
}

const LanguageSelector: React.FC = () => {
  const { language, changeLanguage, t, getSupportedLanguages } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  
  const languages: Language[] = getSupportedLanguages();
  
  const handleChange = (event: SelectChangeEvent<string>) => {
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
      <Box sx={{ marginLeft: 1 }}>
        <IconButton
          onClick={handleMobileClick}
          color="inherit"
          size="small"
          aria-label={t('general.language')}
          data-testid="language-icon"
        >
          <LanguageIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleMobileClose()}
        >
          {languages.map((lang) => (
            <MenuItem 
              key={lang.code} 
              onClick={() => handleMobileClose(lang.code)}
              selected={language === lang.code}
            >
              {lang.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }
  
  return (
    <Box sx={{ minWidth: 120, marginLeft: 2 }}>
      <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="language-select-label">{t('general.language')}</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={language}
          onChange={handleChange}
          label={t('general.language')}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector; 