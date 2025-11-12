import { app, Menu, Tray, type MenuItemConstructorOptions } from 'electron';

import { AVAILABLE_LANGUAGES, AVAILABLE_THEMES, IPC_CHANNELS } from '../shared/constants';
import type { LanguageMode, ThemeMode } from '../shared/types';
import { getAutoLaunch, readConfig, setAutoLaunch, setLanguage, setTheme } from './config';
import { showMessageBox } from './dialog';
import { t } from './i18n';
import { createTrayIcon } from './platform';
import { positionWindowBelowTray } from './position';
import { promptShortcutSelection } from './shortcut';
import { checkForUpdates } from './updater';
import { getWindow, hideWindow, showWindow } from './window';

let tray: Tray | null = null;
let contextMenu: Menu | null = null;

function buildThemeMenu(
  currentTheme: ThemeMode,
  onChange: (theme: ThemeMode) => Promise<void>
): MenuItemConstructorOptions {
  return {
    label: t('menu.theme'),
    submenu: AVAILABLE_THEMES.map(theme => ({
      label: t(`theme.${theme}`),
      type: 'checkbox' as const,
      checked: currentTheme === theme,
      click: (): void => {
        void onChange(theme);
      },
    })),
  };
}

function buildLanguageMenu(
  currentLanguage: LanguageMode,
  onChange: (language: LanguageMode) => Promise<void>
): MenuItemConstructorOptions {
  return {
    label: t('menu.language'),
    submenu: AVAILABLE_LANGUAGES.map(language => ({
      label: t(`language.${language}`),
      type: 'checkbox' as const,
      checked: currentLanguage === language,
      click: (): void => {
        void onChange(language);
      },
    })),
  };
}

function buildAutoLaunchMenu(
  enabled: boolean,
  onChange: (enabled: boolean) => Promise<void>
): MenuItemConstructorOptions {
  return {
    label: t('menu.autoLaunch'),
    type: 'checkbox',
    checked: enabled,
    click: (): void => {
      void onChange(!enabled);
    },
  };
}

function buildActionMenuItems(): MenuItemConstructorOptions[] {
  return [
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
  ];
}

export function createTray(): Tray {
  const icon = createTrayIcon(__dirname);

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

  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: t('tray.show'),
      click: (): void => {
        showWindowBelowTray();
      },
    },
    { type: 'separator' },
    buildThemeMenu(config.theme, handleThemeChange),
    buildLanguageMenu(config.language, handleLanguageChange),
    { type: 'separator' },
    buildAutoLaunchMenu(autoLaunchEnabled, handleAutoLaunchChange),
    ...buildActionMenuItems(),
    { type: 'separator' },
    {
      label: t('tray.quit'),
      click: (): void => {
        void confirmQuit();
      },
    },
  ];

  contextMenu = Menu.buildFromTemplate(menuTemplate);
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
