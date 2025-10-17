// 共享类型定义

/**
 * Electron API 接口
 */
export interface ElectronAPI {
  /**
   * 隐藏窗口
   */
  hide: () => void;

  /**
   * 退出应用
   */
  quit: () => void;

  /**
   * 写入文本到剪贴板
   * @param text - 要写入的文本
   */
  writeText: (text: string) => Promise<void>;

  /**
   * 在默认浏览器中打开外部链接
   * @param url - 要打开的URL
   */
  openExternal: (url: string) => Promise<void>;

  /**
   * 监听从剪贴板提取的域名
   * @param callback - 接收域名的回调函数
   */
  onKeyFromClipboard: (callback: (value: string) => void) => void;
}

/**
 * IPC 频道名称
 */
export const IPC_CHANNELS = {
  HIDE: 'hide',
  QUIT: 'quit',
  CLIPBOARD_WRITE_TEXT: 'clipboard:writeText',
  SHELL_OPEN_EXTERNAL: 'shell:openExternal',
  KEY_FROM_CLIPBOARD: 'key-from-clipboard',
} as const;

/**
 * 窗口配置
 */
export interface WindowConfig {
  width: number;
  height: number;
  show: boolean;
  frame: boolean;
  resizable: boolean;
  skipTaskbar: boolean;
}

/**
 * 托盘位置信息
 */
export interface TrayBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 窗口位置信息
 */
export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * URL 解析结果
 */
export interface ParsedURL {
  protocol: string;
  hostname: string;
  pathname: string;
}

/**
 * PSL 解析结果
 * Re-export ParsedDomain from psl package for convenience
 */
export type { ParsedDomain } from 'psl';
