import i18n from 'i18next';

import type { LanguageMode, SpecificLanguage, ThemeMode } from '../shared/types';

export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === 'auto') {
    root.removeAttribute('data-theme');
    return;
  }

  root.setAttribute('data-theme', theme);
}

export async function applyLanguage(language: LanguageMode): Promise<void> {
  const targetLanguage = await resolveLanguage(language);
  await i18n.changeLanguage(targetLanguage);
  refreshDocumentMetadata();
}

function refreshDocumentMetadata(): void {
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

async function resolveLanguage(language: LanguageMode): Promise<SpecificLanguage> {
  if (language !== 'auto') {
    return language;
  }

  const systemLocale = await window.rendererBridge.getSystemLocale();
  return systemLocale as SpecificLanguage;
}
