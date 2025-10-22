import * as path from 'node:path';

import { app, Menu, nativeImage, Tray } from 'electron';

import { ASSET_PATHS, IPC_CHANNELS } from '../shared/constants';
import type { LanguageMode, ThemeMode } from '../shared/types';
import { getAutoLaunch, readConfig, setAutoLaunch, setLanguage, setTheme } from './config';
import { showMessageBox } from './dialog';
import { t } from './i18n';
import { positionWindowBelowTray } from './position';
import { promptShortcutSelection } from './shortcut';
import { checkForUpdates } from './updater';
import { getWindow, hideWindow, showWindow } from './window';

let tray: Tray | null = null;
let contextMenu: Menu | null = null;

export function createTray(): Tray {
  const icon = nativeImage.createFromPath(path.join(__dirname, ASSET_PATHS.TRAY_ICON));
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  tray.setToolTip(t('tray.tooltip'));
  tray.on('click', () => {
    handleTrayClick();
  });
  tray.on('right-click', () => {
    const win = getWindow();
    if (win !== null && win.isVisible()) {
      hideWindow();
    }

    if (tray !== null && contextMenu !== null) {
      tray.popUpContextMenu(contextMenu);
    }
  });

  void refreshTrayMenu();
  return tray;
}

async function refreshTrayMenu(): Promise<void> {
  const config = readConfig();
  const autoLaunchEnabled = await getAutoLaunch();

  contextMenu = Menu.buildFromTemplate([
    {
      label: t('tray.show'),
      click: (): void => {
        showWindowBelowTray();
      },
    },
    {
      type: 'separator',
    },
    {
      label: t('menu.theme'),
      submenu: [
        {
          label: t('theme.light'),
          type: 'checkbox',
          checked: config.theme === 'light',
          click: (): void => {
            void handleThemeChange('light');
          },
        },
        {
          label: t('theme.dark'),
          type: 'checkbox',
          checked: config.theme === 'dark',
          click: (): void => {
            void handleThemeChange('dark');
          },
        },
        {
          label: t('theme.auto'),
          type: 'checkbox',
          checked: config.theme === 'auto',
          click: (): void => {
            void handleThemeChange('auto');
          },
        },
      ],
    },
    {
      label: t('menu.language'),
      submenu: [
        {
          label: t('language.zh-CN'),
          type: 'checkbox',
          checked: config.language === 'zh-CN',
          click: (): void => {
            void handleLanguageChange('zh-CN');
          },
        },
        {
          label: t('language.zh-TW'),
          type: 'checkbox',
          checked: config.language === 'zh-TW',
          click: (): void => {
            void handleLanguageChange('zh-TW');
          },
        },
        {
          label: t('language.en-US'),
          type: 'checkbox',
          checked: config.language === 'en-US',
          click: (): void => {
            void handleLanguageChange('en-US');
          },
        },
        {
          label: t('language.auto'),
          type: 'checkbox',
          checked: config.language === 'auto',
          click: (): void => {
            void handleLanguageChange('auto');
          },
        },
      ],
    },
    {
      type: 'separator',
    },
    {
      label: t('menu.autoLaunch'),
      type: 'checkbox',
      checked: autoLaunchEnabled,
      click: (): void => {
        void handleAutoLaunchChange(!autoLaunchEnabled);
      },
    },
    {
      label: t('menu.globalShortcut'),
      click: (): void => {
        void promptShortcutSelection();
      },
    },
    {
      label: t('menu.checkUpdate'),
      click: (): void => {
        void checkForUpdates();
      },
    },
    {
      type: 'separator',
    },
    {
      label: t('tray.quit'),
      click: (): void => {
        void confirmQuit();
      },
    },
  ]);
}

async function handleThemeChange(theme: ThemeMode): Promise<void> {
  setTheme(theme);
  await refreshTrayMenu();
  notifyRendererThemeChanged(theme);
}

async function handleLanguageChange(language: LanguageMode): Promise<void> {
  setLanguage(language);
  await refreshTrayMenu();
  notifyRendererLanguageChanged(language);
}

async function handleAutoLaunchChange(enabled: boolean): Promise<void> {
  const success = await setAutoLaunch(enabled);
  if (success) {
    await refreshTrayMenu();
  }
}

function notifyRendererThemeChanged(theme: ThemeMode): void {
  const win = getWindow();
  if (win !== null) {
    win.webContents.send(IPC_CHANNELS.THEME_CHANGED, theme);
  }
}

function notifyRendererLanguageChanged(language: LanguageMode): void {
  const win = getWindow();
  if (win !== null) {
    win.webContents.send(IPC_CHANNELS.LANGUAGE_CHANGED, language);
  }
}

function handleTrayClick(): void {
  const win = getWindow();
  if (win !== null && win.isVisible()) {
    hideWindow();
  } else {
    showWindowBelowTray();
  }
}

function showWindowBelowTray(): void {
  const win = getWindow();
  if (win !== null && tray !== null) {
    positionWindowBelowTray(win, tray);
  }
  showWindow();
}

export async function confirmQuit(): Promise<void> {
  hideWindow();

  const result = await showMessageBox({
    type: 'question',
    buttons: [t('dialog.quit.confirm'), t('dialog.quit.cancel')],
    defaultId: 0,
    title: t('app.name'),
    message: t('dialog.quit.message'),
    cancelId: 1,
  });

  if (result.response === 0) {
    app.quit();
  }
}
