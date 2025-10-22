import { clipboard, ipcMain, shell } from 'electron';

import { IPC_CHANNELS } from '../shared/constants';
import type { AppConfig, FormSettings } from '../shared/types';
import { readConfig, updateFormSettings } from './config';
import { getCurrentLanguage } from './i18n';
import { confirmQuit } from './tray';
import { hideWindow } from './window';

export function registerIpcHandlers(): void {
  ipcMain.on(IPC_CHANNELS.HIDE, (): void => {
    hideWindow();
  });

  ipcMain.on(IPC_CHANNELS.QUIT, (): void => {
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
    return readConfig();
  });

  ipcMain.on(IPC_CHANNELS.UPDATE_FORM_SETTINGS, (_event, settings: Partial<FormSettings>): void => {
    updateFormSettings(settings);
  });
}
