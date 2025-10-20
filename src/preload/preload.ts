import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI, AppConfig, ThemeMode, LanguageMode } from '../shared/types';
import { IPC_CHANNELS } from '../shared/types';

/**
 * Safely expose APIs to renderer process
 * Use contextBridge to ensure renderer process cannot directly access Electron internal APIs
 */
const electronAPI: ElectronAPI = {
  hide: (): void => {
    ipcRenderer.send(IPC_CHANNELS.HIDE);
  },

  quit: (): void => {
    ipcRenderer.send(IPC_CHANNELS.QUIT);
  },

  writeText: (text: string): void => {
    ipcRenderer.send(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, text);
  },

  openExternal: (url: string): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, url);
  },

  onKeyFromClipboard: (callback: (value: string) => void): void => {
    ipcRenderer.on(IPC_CHANNELS.KEY_FROM_CLIPBOARD, (_event, value: string) => {
      callback(value);
    });
  },

  onWindowShown: (callback: () => void): void => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_SHOWN, () => {
      callback();
    });
  },

  getSystemLocale: (): Promise<string> => {
    return ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_LOCALE);
  },

  getConfig: (): Promise<AppConfig> => {
    return ipcRenderer.invoke(IPC_CHANNELS.GET_CONFIG);
  },

  onThemeChanged: (callback: (theme: ThemeMode) => void): void => {
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, (_event, theme: ThemeMode) => {
      callback(theme);
    });
  },

  onLanguageChanged: (callback: (language: LanguageMode) => void): void => {
    ipcRenderer.on(IPC_CHANNELS.LANGUAGE_CHANGED, (_event, language: LanguageMode) => {
      callback(language);
    });
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
