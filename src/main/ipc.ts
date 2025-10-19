import { ipcMain, clipboard, shell, app } from 'electron';
import { hideWindow } from './window';
import { confirmQuit } from './tray';
import { IPC_CHANNELS } from '../shared/types';

/**
 * Setup IPC message handlers
 */
export function setupIPC(): void {
  // Hide window
  ipcMain.on(IPC_CHANNELS.HIDE, () => {
    hideWindow();
  });

  // Quit application
  ipcMain.on(IPC_CHANNELS.QUIT, () => {
    void confirmQuit();
  });

  // Write to clipboard
  ipcMain.on(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, (_event, text: string): void => {
    clipboard.writeText(text);
  });

  // Open external link
  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_event, url: string): Promise<void> => {
    await shell.openExternal(url);
  });

  // Get system locale
  ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_LOCALE, (): string => {
    return app.getLocale();
  });
}
