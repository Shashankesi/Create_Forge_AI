import { en } from './en';
import { hi } from './hi';

export const translations = {
  en,
  hi,
};

export const getTranslation = (lang, key, fallback = '') => {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || fallback || key;
};
