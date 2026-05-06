"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { getDictionary, type Dictionary, type Locale } from "./dictionaries";

type I18nContext = {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
};

const Ctx = createContext<I18nContext>({
  locale: "en",
  t: getDictionary("en"),
  setLocale: () => {},
});

const LOCALE_KEY = "zecb_locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === "de" || stored === "en") return stored;
  } catch { /* */ }
  const browserLang = navigator.language.slice(0, 2);
  return browserLang === "de" ? "de" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(LOCALE_KEY, l); } catch { /* */ }
  };

  return (
    <Ctx.Provider value={{ locale, t: getDictionary(locale), setLocale }}>
      {children}
    </Ctx.Provider>
  );
}

export function useI18n() {
  return useContext(Ctx);
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "de" : "en")}
      className="px-2 py-1 rounded-lg text-label-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
      title={locale === "en" ? "Zu Deutsch wechseln" : "Switch to English"}
    >
      {locale === "en" ? "DE" : "EN"}
    </button>
  );
}
