import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode =
  | 'light'
  | 'dark'
  | 'cupcake'
  | 'bumblebee'
  | 'emerald'
  | 'corporate'
  | 'synthwave'
  | 'retro'
  | 'cyberpunk'
  | 'valentine'
  | 'halloween'
  | 'garden'
  | 'forest'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'fantasy'
  | 'wireframe'
  | 'cmyk'
  | 'autumn'
  | 'business'
  | 'acid'
  | 'lemonade'
  | 'night'
  | 'coffee'
  | 'winter';

export const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'cupcake', label: 'Cupcake' },
  { value: 'bumblebee', label: 'Bumblebee' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'synthwave', label: 'Synthwave' },
  { value: 'retro', label: 'Retro' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'valentine', label: 'Valentine' },
  { value: 'halloween', label: 'Halloween' },
  { value: 'garden', label: 'Garden' },
  { value: 'forest', label: 'Forest' },
  { value: 'aqua', label: 'Aqua' },
  { value: 'lofi', label: 'Lo-Fi' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'cmyk', label: 'CMYK' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'business', label: 'Business' },
  { value: 'acid', label: 'Acid' },
  { value: 'lemonade', label: 'Lemonade' },
  { value: 'night', label: 'Night' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'winter', label: 'Winter' },
];

interface ThemeStore {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme: ThemeMode) => set({ theme }),
    }),
    {
      name: 'coupon-manager-theme',
    }
  )
);
