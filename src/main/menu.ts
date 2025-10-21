import { Menu, globalShortcut, dialog } from 'electron';
import { showWindowAtCursor } from './window';
import { GLOBAL_SHORTCUTS } from '../shared/constants';
import { t } from './i18n';

/**
 * Create application menu
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
 * Register global shortcuts
 */
export function registerShortcuts(): void {
  const success = globalShortcut.register(GLOBAL_SHORTCUTS.SHOW_WINDOW_AT_CURSOR, () => {
    showWindowAtCursor();
  });

  if (!success) {
    console.error('Failed to register global shortcut');
    dialog.showErrorBox(t('dialog.shortcut.registerFailed'), t('dialog.shortcut.registerFailedMessage'));
  }
}

/**
 * Unregister all global shortcuts
 */
export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll();
}
