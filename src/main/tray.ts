import { Tray, Menu, nativeImage, clipboard, dialog, app } from 'electron';
import * as path from 'node:path';
import * as psl from 'psl';
import { parse as parseUrl } from 'urlite';
import { showWindow, hideWindow, sendToRenderer, showWindowAtCursor, getWindow } from './window';
import { positionWindowBelowTray } from './position';
import { IPC_CHANNELS } from '../shared/types';
import { ASSETS_PATH, DIALOG_TEXTS } from '../shared/constants';
import type { ParsedURL, ParsedDomain } from '../shared/types';

let tray: Tray | null = null;

/**
 * Create system tray
 * @returns Created Tray instance
 */
export function createTray(): Tray {
  // Use app.getAppPath() to get app root directory, ensures correct paths in both dev and production
  const iconPath = path.join(app.getAppPath(), ASSETS_PATH.TRAY_ICON);
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true); // Set as template image, adapts to macOS dark/light mode

  tray = new Tray(icon);
  tray.setToolTip(DIALOG_TEXTS.TRAY_TOOLTIP);

  // Click tray icon to show/hide window
  tray.on('click', () => {
    handleTrayClick();
  });

  // Right-click menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: DIALOG_TEXTS.TRAY_SHOW,
      click: (): void => {
        handleShowWindowBelowTray();
      },
    },
    {
      type: 'separator',
    },
    {
      label: DIALOG_TEXTS.TRAY_QUIT,
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
 * Extract domain from clipboard URL and send to renderer
 * If extraction succeeds, send domain to renderer process
 */
function extractDomainFromClipboard(): void {
  const text = clipboard.readText('clipboard');

  if (text && text.length > 0) {
    try {
      const url = parseUrl(text) as ParsedURL | null;

      if (url && url.hostname && psl.isValid(url.hostname)) {
        const parsed = psl.parse(url.hostname) as ParsedDomain;

        if (parsed && parsed.sld) {
          sendToRenderer(IPC_CHANNELS.KEY_FROM_CLIPBOARD, parsed.sld);
        }
      }
    } catch (error) {
      // Ignore parsing errors, don't affect window display
      console.error('Failed to parse clipboard URL:', error);
    }
  }
}

/**
 * Handle tray icon click
 * If window is already visible, hide it, otherwise show it below tray icon
 */
function handleTrayClick(): void {
  // Check if window is already visible
  const win = getWindow();
  if (win && win.isVisible()) {
    hideWindow();
  } else {
    handleShowWindowBelowTray();
  }
}

/**
 * Handle showing window below tray icon
 * Extract domain from clipboard and display window below tray icon
 */
export function handleShowWindowBelowTray(): void {
  // Extract domain from clipboard
  extractDomainFromClipboard();

  // Calculate tray icon position and show window
  const win = getWindow();
  if (win && tray) {
    positionWindowBelowTray(win, tray);
  }
  showWindow();
}

/**
 * Handle showing window at cursor position
 * Extract domain from clipboard and display window at cursor bottom-right
 */
export function handleShowWindowAtCursor(): void {
  // Extract domain from clipboard
  extractDomainFromClipboard();

  // Show window at cursor position
  showWindowAtCursor();
}

/**
 * Confirm quit application
 */
export async function confirmQuit(): Promise<void> {
  hideWindow();

  const iconPath = path.join(app.getAppPath(), ASSETS_PATH.DIALOG_ICON);

  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: [DIALOG_TEXTS.QUIT_CONFIRM, DIALOG_TEXTS.QUIT_CANCEL],
    defaultId: 0,
    title: DIALOG_TEXTS.APP_NAME,
    message: DIALOG_TEXTS.QUIT_MESSAGE,
    icon: iconPath,
    cancelId: 1,
  });

  if (result.response === 0) {
    app.quit();
  }
}
