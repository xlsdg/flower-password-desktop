import { app } from 'electron';
import type { LanguageMode } from '../shared/types';

import { enUS } from './locales/en-US';
import { zhCN } from './locales/zh-CN';
import { zhTW } from './locales/zh-TW';

const translations = {
  'en-US': enUS,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
} as const;

type SupportedLanguage = keyof typeof translations;

let currentLanguage: SupportedLanguage = 'en-US';

function resolveLanguage(locale: string): SupportedLanguage {
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

export function applyLanguage(language: LanguageMode): void {
  if (language === 'auto') {
    const systemLocale = app.getLocale();
    currentLanguage = resolveLanguage(systemLocale);
  } else {
    currentLanguage = language;
  }
}

export function t(key: string, replacements: Record<string, string> = {}): string {
  const value = key.split('.').reduce<unknown>((obj, k) => {
    return obj && typeof obj === 'object' && k in obj ? (obj as Record<string, unknown>)[k] : undefined;
  }, translations[currentLanguage]);

  if (typeof value === 'string') {
    return Object.entries(replacements).reduce<string>((result, [placeholder, replacement]) => {
      return result.split(`{${placeholder}}`).join(replacement);
    }, value);
  }

  console.warn(`Translation key not found: ${key}`);
  return key;
}

export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}
