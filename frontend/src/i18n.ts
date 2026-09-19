import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, getLanguageByCode } from './locales/languages';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';
import gu from './locales/gu.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import pa from './locales/pa.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  bn: { translation: bn },
  gu: { translation: gu },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
  ml: { translation: ml },
  pa: { translation: pa },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  pt: { translation: pt },
  ar: { translation: ar },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
};

const savedLanguage = localStorage.getItem('bizflow_language') || DEFAULT_LANGUAGE;

export const applyLanguageDirection = (langCode: string) => {
  const lang = getLanguageByCode(langCode);
  document.documentElement.dir = lang.dir;
  document.documentElement.lang = lang.code;
};

export const formatFallbackKey = (key: string): string => {
  const lastPart = key.split('.').pop() || key;
  return lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    parseMissingKeyHandler: (key: string) => {
      return formatFallbackKey(key);
    },
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

applyLanguageDirection(savedLanguage);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('bizflow_language', lng);
  applyLanguageDirection(lng);
});

export default i18n;
