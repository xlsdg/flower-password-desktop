import { ipcMain, clipboard, shell, app } from 'electron';
import { hideWindow } from './window';
import { confirmQuit } from './tray';
import { IPC_CHANNELS } from '../shared/types';
import type { AppConfig } from '../shared/types';
import { getConfig } from './config';

/**
 * Setup IPC message handlers
 */
export function setupIPC(): void {
  ipcMain.on(IPC_CHANNELS.HIDE, () => {
    hideWindow();
  });

  ipcMain.on(IPC_CHANNELS.QUIT, () => {
    void confirmQuit();
  });

  ipcMain.on(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, (_event, text: string): void => {
    clipboard.writeText(text);
  });

  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_event, url: string): Promise<void> => {
    await shell.openExternal(url);
  });

  ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_LOCALE, (): string => {
    return app.getLocale();
  });

  ipcMain.handle(IPC_CHANNELS.GET_CONFIG, (): AppConfig => {
    return getConfig();
  });
}
