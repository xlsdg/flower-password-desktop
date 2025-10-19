/**
 * i18n configuration for FlowerPassword
 * Supports automatic language detection based on system locale
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { zh } from './locales/zh';

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = ['en', 'zh'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Default fallback language
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Detect system language and return supported language code
 * @param systemLocale - System locale string (e.g., 'en-US', 'zh-CN')
 * @returns Supported language code ('en' or 'zh')
 */
export function detectLanguage(systemLocale: string): SupportedLanguage {
  // Extract language code from locale (e.g., 'zh-CN' -> 'zh')
  const languageCode = systemLocale.toLowerCase().split(/[-_]/)[0];

  // Check if language is supported
  if (SUPPORTED_LANGUAGES.includes(languageCode as SupportedLanguage)) {
    return languageCode as SupportedLanguage;
  }

  // Default to English if not supported
  return DEFAULT_LANGUAGE;
}

/**
 * Initialize i18n instance
 * @param systemLocale - System locale from main process
 */
export function initI18n(systemLocale: string): void {
  const detectedLanguage = detectLanguage(systemLocale);

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        zh: { translation: zh },
      },
      lng: detectedLanguage,
      fallbackLng: DEFAULT_LANGUAGE,
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false, // Disable suspense for Electron
      },
    })
    .catch((error: Error) => {
      console.error('Failed to initialize i18n:', error);
    });
}

/**
 * Update document metadata (title, description, lang) based on current language
 * This function should be called after i18n is initialized
 */
export function updateDocumentMetadata(): void {
  // Update HTML lang attribute
  const htmlLang = i18n.t('metadata.htmlLang');
  document.documentElement.lang = htmlLang;

  // Update document title
  const title = i18n.t('metadata.title');
  document.title = title;

  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    const description = i18n.t('metadata.description');
    metaDescription.setAttribute('content', description);
  }
}

export default i18n;
