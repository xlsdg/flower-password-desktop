/**
 * Renderer process entry point
 * Mounts the React application to the DOM
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initI18n } from './i18n';

/**
 * Update document metadata based on language
 * @param locale - System locale string
 */
function updateDocumentMetadata(locale: string): void {
  const lang = locale.toLowerCase().split(/[-_]/)[0];
  const isZh = lang === 'zh';

  // Update HTML lang attribute
  document.documentElement.lang = isZh ? 'zh-CN' : 'en';

  // Update title
  document.title = isZh ? '花密' : 'FlowerPassword';

  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    const description = isZh
      ? '花密 - 基于记忆密码与区分代号生成密码的应用'
      : 'FlowerPassword - Generate passwords based on memory password and distinction code';
    metaDescription.setAttribute('content', description);
  }
}

/**
 * Initialize and mount React application
 */
async function initialize(): Promise<void> {
  try {
    // Get system locale from main process
    const systemLocale = await window.electronAPI.getSystemLocale();

    // Update document metadata
    updateDocumentMetadata(systemLocale);

    // Initialize i18n with system locale
    initI18n(systemLocale);

    // Mount React app
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

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void initialize();
  });
} else {
  void initialize();
}
