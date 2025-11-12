import { contextBridge, ipcRenderer } from 'electron';
import type { AppConfig, FormSettings, LanguageMode, RendererBridge, ThemeMode } from '../shared/types';
import { IPC_CHANNELS } from '../shared/constants';

function createEventListener<T>(channel: string, callback: (value: T) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, value: T): void => {
    callback(value);
  };
  ipcRenderer.on(channel, listener);

  return (): void => {
    ipcRenderer.off(channel, listener);
  };
}

function createVoidEventListener(channel: string, callback: () => void): () => void {
  const listener = (): void => {
    callback();
  };
  ipcRenderer.on(channel, listener);

  return (): void => {
    ipcRenderer.off(channel, listener);
  };
}

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
    return createEventListener<string>(IPC_CHANNELS.KEY_FROM_CLIPBOARD, callback);
  },

  onLanguageChanged(callback: (language: LanguageMode) => void): () => void {
    return createEventListener<LanguageMode>(IPC_CHANNELS.LANGUAGE_CHANGED, callback);
  },

  onThemeChanged(callback: (theme: ThemeMode) => void): () => void {
    return createEventListener<ThemeMode>(IPC_CHANNELS.THEME_CHANGED, callback);
  },

  onWindowShown(callback: () => void): () => void {
    return createVoidEventListener(IPC_CHANNELS.WINDOW_SHOWN, callback);
  },
};

contextBridge.exposeInMainWorld('rendererBridge', rendererBridge);
