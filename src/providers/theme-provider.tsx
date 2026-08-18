import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import i18n from '@/i18n';
import { useClinicSettings } from '@/stores/clinic-settings';

type Theme = 'dark' | 'light';
type Language = 'en' | 'ar';

interface ThemeContextValue {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'dental-theme';
const LANG_KEY = 'dental-language';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem(LANG_KEY) as Language | null;
    if (stored && (stored === 'en' || stored === 'ar')) return stored;
    const browser = navigator.language.toLowerCase();
    return browser.startsWith('ar') ? 'ar' : 'en';
  });

  // Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Apply language + RTL/LTR to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_KEY, language);

    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }

    // Sync clinic settings store
    useClinicSettings.getState().update({ language });
  }, [language]);

  const toggleTheme = () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  const setTheme = (t: Theme) => setThemeState(t);
  const setLanguage = (l: Language) => setLanguageState(l);
  const toggleLanguage = () => setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));

  return (
    <ThemeContext.Provider value={{ theme, language, toggleTheme, setTheme, setLanguage, toggleLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
