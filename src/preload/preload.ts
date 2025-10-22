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

  onKeyFromClipboard(callback: (value: string) => void): void {
    ipcRenderer.on(IPC_CHANNELS.KEY_FROM_CLIPBOARD, (_event, value: string) => {
      callback(value);
    });
  },

  onLanguageChanged(callback: (language: LanguageMode) => void): void {
    ipcRenderer.on(IPC_CHANNELS.LANGUAGE_CHANGED, (_event, language: LanguageMode) => {
      callback(language);
    });
  },

  onThemeChanged(callback: (theme: ThemeMode) => void): void {
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, (_event, theme: ThemeMode) => {
      callback(theme);
    });
  },

  onWindowShown(callback: () => void): void {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_SHOWN, () => {
      callback();
    });
  },
};

contextBridge.exposeInMainWorld('rendererBridge', rendererBridge);
