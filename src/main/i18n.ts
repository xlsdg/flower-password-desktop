/**
 * i18n for main process
 * Simple translation helper for Electron main process
 */
import { app } from 'electron';

/**
 * Main process translations
 */
const translations = {
  en: {
    appName: 'FlowerPassword',
    quitMessage: 'Are you sure you want to quit?',
    quitConfirm: 'Quit',
    quitCancel: 'Cancel',
    trayShow: 'Show',
    trayQuit: 'Quit',
    trayTooltip: 'FlowerPassword',
    htmlTitle: 'FlowerPassword',
    htmlDescription: 'FlowerPassword - Generate passwords based on memory password and distinction code',
  },
  zh: {
    appName: '花密',
    quitMessage: '确定退出？',
    quitConfirm: '确定',
    quitCancel: '取消',
    trayShow: '显示',
    trayQuit: '退出',
    trayTooltip: '花密',
    htmlTitle: '花密',
    htmlDescription: '花密 - 基于记忆密码与区分代号生成密码的应用',
  },
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
