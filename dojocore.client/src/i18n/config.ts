import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import elTranslation from './locales/el.json';

const resources = {
  en: {
    auth: enTranslation
  },
  el: {
    auth: elTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'el', // Default language
    fallbackLng: 'el',
    defaultNS: 'auth',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
