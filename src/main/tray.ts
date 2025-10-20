import { Tray, Menu, nativeImage, dialog, app } from 'electron';
import * as path from 'node:path';
import { showWindow, hideWindow, getWindow } from './window';
import { positionWindowBelowTray } from './position';
import { t } from './i18n';
import { ASSETS_PATH } from '../shared/constants';

let tray: Tray | null = null;

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
  tray.setToolTip(t('trayTooltip'));

  tray.on('click', () => {
    handleTrayClick();
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: t('trayShow'),
      click: (): void => {
        handleShowWindowBelowTray();
      },
    },
    {
      type: 'separator',
    },
    {
      label: t('trayQuit'),
      click: (): void => {
        void confirmQuit();
      },
    },
  ]);

  tray.on('right-click', () => {
    if (tray) {
      tray.popUpContextMenu(contextMenu);
    }
  });

  return tray;
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
    buttons: [t('quitConfirm'), t('quitCancel')],
    defaultId: 0,
    title: t('appName'),
    message: t('quitMessage'),
    icon: iconPath,
    cancelId: 1,
  });

  if (result.response === 0) {
    app.quit();
  }
}
