import { Tray, Menu, nativeImage, dialog, app } from 'electron';
import * as path from 'node:path';
import { showWindow, hideWindow, getWindow } from './window';
import { positionWindowBelowTray } from './position';
import { t } from './i18n';
import { ASSETS_PATH } from '../shared/constants';
import { getConfig, setTheme, setLanguage, setAutoLaunch, getAutoLaunch } from './config';
import type { ThemeMode, LanguageMode } from '../shared/types';
import { IPC_CHANNELS } from '../shared/types';
import { checkForUpdates } from './updater';

let tray: Tray | null = null;
let contextMenu: Menu | null = null;

/**
 * Create system tray
 * @returns Created Tray instance
 */
export function createTray(): Tray {
  // Use __dirname (points to .vite/build/) for consistent path resolution across all environments
  const iconPath = path.join(__dirname, ASSETS_PATH.TRAY_ICON);
  const icon = nativeImage.createFromPath(iconPath);

  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  tray.setToolTip(t('tray.tooltip'));

  tray.on('click', () => {
    handleTrayClick();
  });

  tray.on('right-click', () => {
    if (tray && contextMenu) {
      tray.popUpContextMenu(contextMenu);
    }
  });

  void updateTrayMenu();

  return tray;
}

/**
 * Update tray context menu
 * Rebuilds menu with current configuration state
 */
export async function updateTrayMenu(): Promise<void> {
  if (!tray) {
    return;
  }

  const config = getConfig();
  const autoLaunchEnabled = await getAutoLaunch();

  contextMenu = Menu.buildFromTemplate([
    {
      label: t('tray.show'),
      click: (): void => {
        handleShowWindowBelowTray();
      },
    },
    {
      type: 'separator',
    },
    {
      label: t('tray.settings'),
      submenu: [
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
          type: 'separator',
        },
        {
          label: t('menu.checkUpdate'),
          click: (): void => {
            void checkForUpdates();
          },
        },
      ],
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

/**
 * Handle theme change from tray menu
 * @param theme - New theme mode
 */
async function handleThemeChange(theme: ThemeMode): Promise<void> {
  setTheme(theme);
  await updateTrayMenu();
  notifyRendererThemeChanged(theme);
}

/**
 * Handle language change from tray menu
 * @param language - New language mode
 */
async function handleLanguageChange(language: LanguageMode): Promise<void> {
  setLanguage(language);
  await updateTrayMenu();
  notifyRendererLanguageChanged(language);
}

/**
 * Handle auto-launch change from tray menu
 * @param enabled - Enable or disable auto-launch
 */
async function handleAutoLaunchChange(enabled: boolean): Promise<void> {
  const success = await setAutoLaunch(enabled);
  if (success) {
    await updateTrayMenu();
  }
}

/**
 * Notify renderer process of theme change
 * @param theme - New theme mode
 */
function notifyRendererThemeChanged(theme: ThemeMode): void {
  const win = getWindow();
  if (win) {
    win.webContents.send(IPC_CHANNELS.THEME_CHANGED, theme);
  }
}

/**
 * Notify renderer process of language change
 * @param language - New language mode
 */
function notifyRendererLanguageChanged(language: LanguageMode): void {
  const win = getWindow();
  if (win) {
    win.webContents.send(IPC_CHANNELS.LANGUAGE_CHANGED, language);
  }
}

/**
 * Get tray instance
 * @returns Tray instance or null
 */
export function getTray(): Tray | null {
  return tray;
}

/**
 * Handle tray icon click
 * If window is already visible, hide it; otherwise show it below tray icon
 */
function handleTrayClick(): void {
  const win = getWindow();
  if (win && win.isVisible()) {
    hideWindow();
  } else {
    handleShowWindowBelowTray();
  }
}

/**
 * Handle showing window below tray icon
 */
export function handleShowWindowBelowTray(): void {
  const win = getWindow();
  if (win && tray) {
    positionWindowBelowTray(win, tray);
  }
  showWindow();
}

/**
 * Confirm quit application
 */
export async function confirmQuit(): Promise<void> {
  hideWindow();

  const iconPath = path.join(__dirname, ASSETS_PATH.DIALOG_ICON);
  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: [t('dialog.quit.confirm'), t('dialog.quit.cancel')],
    defaultId: 0,
    title: t('app.name'),
    message: t('dialog.quit.message'),
    icon: iconPath,
    cancelId: 1,
  });

  if (result.response === 0) {
    app.quit();
  }
}
