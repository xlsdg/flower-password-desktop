/**
 * i18n for main process
 * Simple translation helper for Electron main process with nested key support
 */
import { app } from 'electron';
import type { LanguageMode } from '../shared/types';

import { enUS } from './locales/en-US';
import { zhCN } from './locales/zh-CN';
import { zhTW } from './locales/zh-TW';

/**
 * Main process translations
 */
const translations = {
  'en-US': enUS,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
} as const;

type SupportedLanguage = keyof typeof translations;

let currentLanguage: SupportedLanguage = 'en-US';

/**
 * Detect language from system locale
 * @param locale - System locale string (e.g., 'en-US', 'zh-CN', 'zh-TW')
 * @returns Supported language code
 */
function detectLanguage(locale: string): SupportedLanguage {
  const normalizedLocale = locale.toLowerCase().replace('_', '-');

  if (
    normalizedLocale.startsWith('zh-tw') ||
    normalizedLocale.startsWith('zh-hk') ||
    normalizedLocale.startsWith('zh-mo')
  ) {
    return 'zh-TW';
  }

  if (normalizedLocale.startsWith('zh')) {
    return 'zh-CN';
  }

  if (normalizedLocale.startsWith('en')) {
    return 'en-US';
  }

  return 'en-US';
}

/**
 * Apply language to main process
 * @param language - Language mode to apply
 */
export function applyLanguage(language: LanguageMode): void {
  if (language === 'auto') {
    const systemLocale = app.getLocale();
    currentLanguage = detectLanguage(systemLocale);
  } else {
    currentLanguage = language;
  }
}

/**
 * Get translation for a nested key
 * Supports dot notation for nested keys (e.g., 'app.name', 'tray.tooltip')
 * @param key - Translation key (supports dot notation)
 * @returns Translated string
 */
export function t(key: string): string {
  const value = key.split('.').reduce<unknown>((obj, k) => {
    return obj && typeof obj === 'object' && k in obj ? (obj as Record<string, unknown>)[k] : undefined;
  }, translations[currentLanguage]);

  if (typeof value === 'string') {
    return value;
  }

  console.warn(`Translation key not found: ${key}`);
  return key;
}

/**
 * Get current language
 * @returns Current language code
 */
export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}
