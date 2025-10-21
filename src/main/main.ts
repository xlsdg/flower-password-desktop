import { app, dialog } from 'electron';
import { createWindow } from './window';
import { createTray } from './tray';
import { createMenu, registerShortcuts, unregisterShortcuts } from './menu';
import { setupIPC } from './ipc';
import { initConfig } from './config';
import { initUpdater } from './updater';

process.on('uncaughtException', (err: Error) => {
  dialog
    .showMessageBox({
      type: 'error',
      title: 'Uncaught Exception',
      message: err.message,
      detail: err.stack || '',
    })
    .then(() => {
      app.quit();
    })
    .catch((error: Error) => {
      console.error('Failed to show error dialog:', error);
      app.quit();
    });
});

app
  .whenReady()
  .then(() => {
    initConfig();
    initUpdater();

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
