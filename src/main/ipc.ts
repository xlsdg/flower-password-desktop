import { ipcMain, clipboard, shell } from 'electron';
import { hideWindow } from './window';
import { confirmQuit } from './tray';
import { IPC_CHANNELS } from '../shared/constants';
import type { AppConfig, FormSettings } from '../shared/types';
import { getConfig, updateFormSettings } from './config';
import { getCurrentLanguage } from './i18n';

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
    return getCurrentLanguage();
  });

  ipcMain.handle(IPC_CHANNELS.GET_CONFIG, (): AppConfig => {
    return getConfig();
  });

  ipcMain.on(IPC_CHANNELS.UPDATE_FORM_SETTINGS, (_event, settings: Partial<FormSettings>): void => {
    updateFormSettings(settings);
  });
}
