import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
import en from './locales/en/translation.json';
import ar from './locales/ar/translation.json';
import ku from './locales/ku/translation.json';

// RTL languages
export const RTL_LANGUAGES = ['ar', 'ku'];

// Check if current language is RTL
export const isRTL = (lang) => RTL_LANGUAGES.includes(lang);

// Language options for the switcher
export const LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'عربي', dir: 'rtl' },
    { code: 'ku', name: 'Kurdish', nativeName: 'کوردی', dir: 'rtl' },
];

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ar: { translation: ar },
            ku: { translation: ku },
        },
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
