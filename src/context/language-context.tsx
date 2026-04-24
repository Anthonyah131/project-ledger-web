"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Locale,
  type Translations,
  DEFAULT_LOCALE,
  getTranslations,
  createT,
} from "@/lib/i18n";

const STORAGE_KEY = "pl_locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === "es" || stored === "en") return stored;
  const browser = navigator.language.slice(0, 2) as Locale;
  if (browser === "es" || browser === "en") return browser;
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with DEFAULT_LOCALE so server and initial client render match,
  // then apply the stored/browser locale after hydration to avoid mismatch.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resolve locale after hydration to avoid mismatch
  useEffect(() => {
    const resolved = resolveInitialLocale();
    /* eslint-disable react-hooks/set-state-in-effect -- intentional */
    setLocaleState(resolved);
    document.documentElement.lang = resolved;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  // Keep <html lang> in sync when locale changes via setLocale
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const translations = useMemo(() => getTranslations(locale), [locale]);
  const t = useMemo(() => createT(translations), [translations]);

  const value = useMemo(
    () => ({ locale, setLocale, t, translations }),
    [locale, setLocale, t, translations]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}
