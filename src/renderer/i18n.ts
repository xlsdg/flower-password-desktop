/**
 * i18n configuration for FlowerPassword
 * Supports automatic language detection based on system locale
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { zh } from './locales/zh';

/**
 * Initialize i18n instance
 * Defaults to English, will be updated by applyLanguage based on config
 */
export async function initI18n(): Promise<void> {
  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for Electron
    },
  });
}
