/**
 * 渲染进程全局类型声明
 * 这个文件会被 TypeScript 自动包含，不需要手动 import
 */

import type { ElectronAPI } from '../shared/types';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
