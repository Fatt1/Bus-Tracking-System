import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import các file translation
import translationVI from './locales/vi/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  vi: {
    translation: translationVI
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(LanguageDetector) // Tự động phát hiện ngôn ngữ từ browser/localStorage
  .use(initReactI18next) // Kết nối với React
  .init({
    resources,
    fallbackLng: 'vi', // Ngôn ngữ mặc định
    lng: localStorage.getItem('language') || 'vi', // Lấy từ localStorage hoặc dùng 'vi'
    debug: false,
    interpolation: {
      escapeValue: false // React đã tự động escape
    },
    detection: {
      order: ['localStorage', 'navigator'], // Ưu tiên localStorage
      caches: ['localStorage']
    }
  });

export default i18n;
