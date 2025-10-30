import { app, dialog } from 'electron';

import { initConfig } from './config';
import { registerIpcHandlers } from './ipc';
import { unregisterGlobalShortcuts } from './shortcut';
import { createTray } from './tray';
import { createWindow } from './window';
import { clipboardManager } from './clipboard';

process.on('uncaughtException', (error: Error) => {
  void dialog
    .showMessageBox({
      type: 'error',
      title: 'Uncaught Exception',
      message: error.message,
      detail: error.stack ?? '',
    })
    .catch(dialogError => {
      console.error('Failed to show error dialog:', dialogError);
    })
    .finally(() => {
      app.quit();
    });
});

async function boot(): Promise<void> {
  try {
    await app.whenReady();

    initConfig();
    createWindow();
    createTray();
    registerIpcHandlers();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
}

void boot();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  unregisterGlobalShortcuts();
  clipboardManager.clearTimer();
});

if (process.platform === 'darwin' && app.dock !== undefined) {
  app.dock.hide();
}
