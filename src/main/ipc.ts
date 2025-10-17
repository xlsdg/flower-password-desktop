import { ipcMain, clipboard, shell } from 'electron';
import { hideWindow } from './window';
import { confirmQuit } from './tray';
import { IPC_CHANNELS } from '../shared/types';

/**
 * 设置 IPC 消息处理器
 */
export function setupIPC(): void {
  // 隐藏窗口
  ipcMain.on(IPC_CHANNELS.HIDE, () => {
    hideWindow();
  });

  // 退出应用
  ipcMain.on(IPC_CHANNELS.QUIT, () => {
    void confirmQuit();
  });

  // 写入剪贴板
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, (_event, text: string): void => {
    clipboard.writeText(text);
  });

  // 打开外部链接
  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_event, url: string): Promise<void> => {
    await shell.openExternal(url);
  });
}
