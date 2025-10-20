import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initI18n } from './i18n';
import { applyTheme, applyLanguage } from './utils';
import type { ThemeMode, LanguageMode } from '../shared/types';

/**
 * Initialize app configuration (theme and language)
 * Sets up initial config and registers change listeners
 */
async function initializeConfig(): Promise<void> {
  const config = await window.electronAPI.getConfig();

  // Initialize i18n and apply language
  await initI18n();
  await applyLanguage(config.language);

  // Register language change listener
  window.electronAPI.onLanguageChanged((language: LanguageMode) => {
    void applyLanguage(language);
  });

  // Apply theme and register theme change listener
  applyTheme(config.theme);
  window.electronAPI.onThemeChanged((theme: ThemeMode) => {
    applyTheme(theme);
  });
}

async function initialize(): Promise<void> {
  try {
    await initializeConfig();

    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = createRoot(rootElement);
    root.render(
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
    void initialize();
  });
} else {
  void initialize();
}
