import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../shared/types';
import { IPC_CHANNELS } from '../shared/types';

/**
 * 安全地暴露 API 到渲染进程
 * 使用 contextBridge 确保渲染进程无法直接访问 Electron 内部 API
 */
const electronAPI: ElectronAPI = {
  /**
   * 窗口控制 - 隐藏窗口
   */
  hide: (): void => {
    ipcRenderer.send(IPC_CHANNELS.HIDE);
  },

  /**
   * 窗口控制 - 退出应用
   */
  quit: (): void => {
    ipcRenderer.send(IPC_CHANNELS.QUIT);
  },

  /**
   * 剪贴板操作 - 写入文本
   * @param text - 要写入剪贴板的文本
   * @returns Promise，操作完成时 resolve
   */
  writeText: (text: string): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, text);
  },

  /**
   * 打开外部链接
   * @param url - 要在默认浏览器中打开的 URL
   * @returns Promise，操作完成时 resolve
   */
  openExternal: (url: string): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, url);
  },

  /**
   * 接收从主进程发送的数据
   * @param callback - 接收域名的回调函数
   */
  onKeyFromClipboard: (callback: (value: string) => void): void => {
    ipcRenderer.on(IPC_CHANNELS.KEY_FROM_CLIPBOARD, (_event, value: string) => {
      callback(value);
    });
  },
};

// 将 API 暴露到渲染进程的 window 对象
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
