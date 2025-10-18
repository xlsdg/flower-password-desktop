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
   * @returns Promise that resolves when operation completes
   */
  writeText: (text: string): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, text);
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
};

// Expose API to renderer process window object
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
