import { app, dialog } from 'electron';
import { initMainI18n } from './i18n';
import { createWindow } from './window';
import { createTray } from './tray';
import { createMenu, registerShortcuts, unregisterShortcuts } from './menu';
import { setupIPC } from './ipc';

/**
 * Error handling
 * Catch unhandled exceptions and show error dialog
 */
process.on('uncaughtException', (err: Error) => {
  dialog.showErrorBox(`Uncaught Exception: ${err.message}`, err.stack || '');
  app.quit();
});

/**
 * Application ready
 * Initialize window, tray, menu, etc.
 */
app
  .whenReady()
  .then(() => {
    initMainI18n();
    createWindow();
    createTray();
    createMenu();
    registerShortcuts();
    setupIPC();
  })
  .catch((error: Error) => {
    console.error('Failed to initialize app:', error);
    app.quit();
  });

/**
 * Quit when all windows are closed (except on macOS)
 * macOS apps typically stay active until the user explicitly quits
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Cleanup before application quits
 * Unregister all global shortcuts
 */
app.on('will-quit', () => {
  unregisterShortcuts();
});

/**
 * macOS platform-specific settings
 * Hide Dock icon, app only shows in menu bar
 */
if (process.platform === 'darwin' && app.dock) {
  app.dock.hide();
}
