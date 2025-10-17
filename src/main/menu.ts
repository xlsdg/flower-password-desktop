import { Menu, globalShortcut } from 'electron';
import { handleShowWindow } from './tray';

/**
 * 创建应用菜单
 */
export function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
        },
        {
          type: 'separator',
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy',
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste',
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll',
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * 注册全局快捷键
 */
export function registerShortcuts(): void {
  // 注册 Cmd/Ctrl+Alt+S 显示窗口
  const success = globalShortcut.register('CmdOrCtrl+Alt+S', () => {
    handleShowWindow();
  });

  if (!success) {
    console.error('Failed to register global shortcut');
  }
}

/**
 * 注销所有全局快捷键
 */
export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll();
}
