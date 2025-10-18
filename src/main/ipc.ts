import { ipcMain, clipboard, shell } from 'electron';
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
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, (_event, text: string): void => {
    clipboard.writeText(text);
  });

  // Open external link
  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_event, url: string): Promise<void> => {
    await shell.openExternal(url);
  });
}
