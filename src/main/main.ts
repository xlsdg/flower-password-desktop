import { app, dialog } from 'electron';
import { createWindow } from './window';
import { createTray } from './tray';
import { createMenu, registerShortcuts, unregisterShortcuts } from './menu';
import { setupIPC } from './ipc';

/**
 * 错误处理
 * 捕获未处理的异常并显示错误对话框
 */
process.on('uncaughtException', (err: Error) => {
  dialog.showErrorBox('Uncaught Exception: ' + err.message, err.stack || '');
  app.quit();
});

/**
 * 应用准备就绪
 * 初始化窗口、托盘、菜单等
 */
app
  .whenReady()
  .then(() => {
    createWindow();
    createTray();
    createMenu();
    registerShortcuts();
    setupIPC();
  })
  .catch((error: Error) => {
    console.error('Failed to initialize app:', error);
    app.quit();
  });

/**
 * 所有窗口关闭时退出（除了 macOS）
 * macOS 应用通常保持活动状态，直到用户明确退出
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 应用即将退出时清理
 * 注销所有全局快捷键
 */
app.on('will-quit', () => {
  unregisterShortcuts();
});

/**
 * macOS 平台特定设置
 * 隐藏 Dock 图标，应用只在菜单栏显示
 */
if (process.platform === 'darwin' && app.dock) {
  app.dock.hide();
}
