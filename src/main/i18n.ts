/**
 * i18n for main process
 * Simple translation helper for Electron main process
 */
import { app } from 'electron';

import { en } from './locales/en';
import { zh } from './locales/zh';

/**
 * Main process translations
 */
const translations = {
  en,
  zh,
} as const;

type TranslationKey = keyof (typeof translations)['en'];
type SupportedLanguage = 'en' | 'zh';

let currentLanguage: SupportedLanguage = 'en';

/**
 * Detect language from system locale
 * @param locale - System locale string (e.g., 'en-US', 'zh-CN')
 * @returns Supported language code
 */
function detectLanguage(locale: string): SupportedLanguage {
  const languageCode = locale.toLowerCase().split(/[-_]/)[0];
  return languageCode === 'zh' ? 'zh' : 'en';
}

/**
 * Initialize i18n for main process
 * Should be called during app initialization
 */
export function initMainI18n(): void {
  const systemLocale = app.getLocale();
  currentLanguage = detectLanguage(systemLocale);
}

/**
 * Get translation for a key
 * @param key - Translation key
 * @returns Translated string
 */
export function t(key: TranslationKey): string {
  return translations[currentLanguage][key];
}

/**
 * Get current language
 * @returns Current language code
 */
export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}
