import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../shared/types';
import { IPC_CHANNELS } from '../shared/types';

/**
 * Safely expose APIs to renderer process
 * Use contextBridge to ensure renderer process cannot directly access Electron internal APIs
 */
const electronAPI: ElectronAPI = {
  /**
   * Window control - Hide window
   */
  hide: (): void => {
    ipcRenderer.send(IPC_CHANNELS.HIDE);
  },

  /**
   * Window control - Quit application
   */
  quit: (): void => {
    ipcRenderer.send(IPC_CHANNELS.QUIT);
  },

  /**
   * Clipboard operation - Write text
   * @param text - Text to write to clipboard
   */
  writeText: (text: string): void => {
    ipcRenderer.send(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, text);
  },

  /**
   * Open external link
   * @param url - URL to open in default browser
   * @returns Promise that resolves when operation completes
   */
  openExternal: (url: string): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, url);
  },

  /**
   * Receive data sent from main process
   * @param callback - Callback function to receive domain
   */
  onKeyFromClipboard: (callback: (value: string) => void): void => {
    ipcRenderer.on(IPC_CHANNELS.KEY_FROM_CLIPBOARD, (_event, value: string) => {
      callback(value);
    });
  },

  /**
   * Listen for window shown event
   * @param callback - Callback function invoked when window is shown
   */
  onWindowShown: (callback: () => void): void => {
    ipcRenderer.on(IPC_CHANNELS.WINDOW_SHOWN, () => {
      callback();
    });
  },

  /**
   * Get system locale from main process
   * @returns Promise that resolves with system locale string
   */
  getSystemLocale: (): Promise<string> => {
    return ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_LOCALE);
  },
};

// Expose API to renderer process window object
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
