import { contextBridge, ipcRenderer } from 'electron';
import type { AppConfig, FormSettings, LanguageMode, RendererBridge, ThemeMode } from '../shared/types';
import { IPC_CHANNELS } from '../shared/constants';

const rendererBridge: RendererBridge = {
  hide(): void {
    ipcRenderer.send(IPC_CHANNELS.HIDE);
  },

  openExternal(url: string): Promise<void> {
    return ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, url);
  },

  quit(): void {
    ipcRenderer.send(IPC_CHANNELS.QUIT);
  },

  updateFormSettings(settings: Partial<FormSettings>): void {
    ipcRenderer.send(IPC_CHANNELS.UPDATE_FORM_SETTINGS, settings);
  },

  writeText(text: string): void {
    ipcRenderer.send(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, text);
  },

  getConfig(): Promise<AppConfig> {
    return ipcRenderer.invoke(IPC_CHANNELS.GET_CONFIG);
  },

  getSystemLocale(): Promise<string> {
    return ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_LOCALE);
  },

  onKeyFromClipboard(callback: (value: string) => void): () => void {
    const listener = (_event: Electron.IpcRendererEvent, value: string): void => {
      callback(value);
    };
    ipcRenderer.on(IPC_CHANNELS.KEY_FROM_CLIPBOARD, listener);

    return (): void => {
      ipcRenderer.off(IPC_CHANNELS.KEY_FROM_CLIPBOARD, listener);
    };
  },

  onLanguageChanged(callback: (language: LanguageMode) => void): () => void {
    const listener = (_event: Electron.IpcRendererEvent, language: LanguageMode): void => {
      callback(language);
    };
    ipcRenderer.on(IPC_CHANNELS.LANGUAGE_CHANGED, listener);

    return (): void => {
      ipcRenderer.off(IPC_CHANNELS.LANGUAGE_CHANGED, listener);
    };
  },

  onThemeChanged(callback: (theme: ThemeMode) => void): () => void {
    const listener = (_event: Electron.IpcRendererEvent, theme: ThemeMode): void => {
      callback(theme);
    };
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, listener);

    return (): void => {
      ipcRenderer.off(IPC_CHANNELS.THEME_CHANGED, listener);
    };
  },

  onWindowShown(callback: () => void): () => void {
    const listener = (): void => {
      callback();
    };
    ipcRenderer.on(IPC_CHANNELS.WINDOW_SHOWN, listener);

    return (): void => {
      ipcRenderer.off(IPC_CHANNELS.WINDOW_SHOWN, listener);
    };
  },
};

contextBridge.exposeInMainWorld('rendererBridge', rendererBridge);
