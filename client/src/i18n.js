import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import uk from './locales/uk.json';

i18n
  .use(LanguageDetector)           // Автоматичне визначення мови браузера
  .use(initReactI18next)           // Інтеграція з React
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk }
    },
    fallbackLng: 'uk',              // Мова за замовчуванням
    interpolation: { escapeValue: false }
  });

export default i18n;