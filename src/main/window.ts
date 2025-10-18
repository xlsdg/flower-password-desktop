import { BrowserWindow } from 'electron';
import * as path from 'node:path';
import type { WindowConfig } from '../shared/types';
import { positionWindowAtCursor } from './position';

let mainWindow: BrowserWindow | null = null;

/**
 * 窗口配置
 */
const WINDOW_CONFIG: WindowConfig = {
  width: 300,
  height: 334,
  show: false,
  frame: false,
  resizable: false,
  skipTaskbar: true,
};

/**
 * 创建主窗口
 * @returns 创建的 BrowserWindow 实例
 */
export function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    ...WINDOW_CONFIG,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // 加载 HTML 文件（从 dist 的相邻 src/renderer/html 目录）
  // __dirname 是 dist/main，所以需要 ../../src/renderer/html/index.html
  void mainWindow.loadFile(path.join(__dirname, '../../src/renderer/html/index.html'));

  // 窗口失去焦点时隐藏
  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });

  // 开发时打开开发者工具（取消注释）
  // mainWindow.webContents.openDevTools()

  return mainWindow;
}

/**
 * 获取主窗口实例
 * @returns 主窗口实例或 null
 */
export function getWindow(): BrowserWindow | null {
  return mainWindow;
}

/**
 * 显示窗口
 */
export function showWindow(): void {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

/**
 * 隐藏窗口
 */
export function hideWindow(): void {
  if (mainWindow) {
    mainWindow.hide();
  }
}

/**
 * 切换窗口显示/隐藏状态
 */
export function toggleWindow(): void {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      hideWindow();
    } else {
      showWindow();
    }
  }
}

/**
 * 设置窗口位置
 * @param x - X 坐标
 * @param y - Y 坐标
 */
export function setWindowPosition(x: number, y: number): void {
  if (mainWindow) {
    mainWindow.setPosition(x, y, false);
  }
}

/**
 * 获取窗口边界
 * @returns 窗口边界对象
 */
export function getWindowBounds(): { x: number; y: number; width: number; height: number } {
  if (mainWindow) {
    return mainWindow.getBounds();
  }
  return { x: 0, y: 0, width: WINDOW_CONFIG.width, height: WINDOW_CONFIG.height };
}

/**
 * 向渲染进程发送消息
 * @param channel - IPC 频道
 * @param data - 要发送的数据
 */
export function sendToRenderer(channel: string, data: string): void {
  if (mainWindow) {
    mainWindow.webContents.send(channel, data);
  }
}

/**
 * 根据鼠标位置显示窗口
 * 窗口的左上角会显示在鼠标的右下方
 */
export function showWindowAtCursor(): void {
  if (!mainWindow) {
    return;
  }

  positionWindowAtCursor(mainWindow);
  showWindow();
}
