import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '../../types';
import { translations } from '../i18n/translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Check URL path first
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.startsWith('/en') || pathname === '/privacy' || pathname === '/terms') {
        return 'en';
      }
      if (pathname.startsWith('/fr') || pathname === '/confidentialite' || pathname === '/conditions') {
        return 'fr';
      }
    }
    const saved = typeof window !== 'undefined' ? localStorage.getItem('bf_locale') : null;
    if (saved === 'fr' || saved === 'en') return saved;
    return typeof navigator !== 'undefined' && navigator.language.startsWith('fr') ? 'fr' : 'en';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bf_locale', newLocale);
      document.documentElement.lang = newLocale;

      // Preserve legal page on language change
      const pathname = window.location.pathname.toLowerCase();
      if (
        pathname === '/confidentialite' ||
        pathname === '/fr/confidentialite' ||
        pathname === '/privacy' ||
        pathname === '/en/privacy'
      ) {
        const targetPath = newLocale === 'fr' ? '/fr/confidentialite' : '/en/privacy';
        if (window.location.pathname !== targetPath) {
          window.history.pushState({}, '', targetPath);
        }
      } else if (
        pathname === '/conditions' ||
        pathname === '/fr/conditions' ||
        pathname === '/terms' ||
        pathname === '/en/terms'
      ) {
        const targetPath = newLocale === 'fr' ? '/fr/conditions' : '/en/terms';
        if (window.location.pathname !== targetPath) {
          window.history.pushState({}, '', targetPath);
        }
      }
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'fr' : 'en');
  };

  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
