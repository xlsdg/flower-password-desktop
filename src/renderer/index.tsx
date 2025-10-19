/**
 * Renderer process entry point
 * Mounts the React application to the DOM
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initI18n, updateDocumentMetadata } from './i18n';

/**
 * Initialize and mount React application
 */
async function initialize(): Promise<void> {
  try {
    // Get system locale from main process
    const systemLocale = await window.electronAPI.getSystemLocale();

    // Initialize i18n with system locale
    initI18n(systemLocale);

    // Update document metadata based on current language
    updateDocumentMetadata();

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
