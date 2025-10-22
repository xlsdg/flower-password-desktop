import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import type { LanguageMode, ThemeMode } from '../shared/types';
import { App } from './App';
import { initI18n } from './i18n';
import { applyLanguage, applyTheme } from './utils';

async function prepareRenderer(): Promise<void> {
  const config = await window.rendererBridge.getConfig();

  await initI18n();
  await applyLanguage(config.language);
  applyTheme(config.theme);

  window.rendererBridge.onLanguageChanged((language: LanguageMode) => {
    void applyLanguage(language);
  });

  window.rendererBridge.onThemeChanged((theme: ThemeMode) => {
    applyTheme(theme);
  });
}

async function bootstrap(): Promise<void> {
  try {
    await prepareRenderer();

    const rootElement = document.getElementById('root');
    if (rootElement === null) {
      throw new Error('Root element not found');
    }

    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void bootstrap();
  });
} else {
  void bootstrap();
}
