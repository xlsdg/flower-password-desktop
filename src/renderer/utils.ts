/**
 * Renderer process utility functions
 */
import i18n from 'i18next';
import type { ThemeMode, LanguageMode, SpecificLanguage } from '../shared/types';

/**
 * Apply theme to document root
 * @param theme - Theme mode ('light', 'dark', or 'auto')
 */
export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

/**
 * Apply language to i18n and update document metadata
 * @param language - Language mode ('zh-CN', 'zh-TW', 'en-US', or 'auto')
 */
export async function applyLanguage(language: LanguageMode): Promise<void> {
  let targetLanguage: SpecificLanguage;

  if (language === 'auto') {
    // Auto-detect based on system locale
    const systemLocale = await window.electronAPI.getSystemLocale();
    targetLanguage = systemLocale as SpecificLanguage;
  } else {
    targetLanguage = language;
  }

  await i18n.changeLanguage(targetLanguage);
  updateDocumentMetadata();
}

/**
 * Update document metadata based on current i18n language
 */
export function updateDocumentMetadata(): void {
  const htmlLang = i18n.t('metadata.htmlLang');
  const title = i18n.t('metadata.title');
  const description = i18n.t('metadata.description');

  document.documentElement.lang = htmlLang;
  document.title = title;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
}
