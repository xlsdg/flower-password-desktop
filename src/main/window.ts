import { BrowserWindow, clipboard } from 'electron';
import * as path from 'node:path';
import * as psl from 'psl';
import type { WindowConfig, Bounds, ParsedDomain } from '../shared/types';
import { IPC_CHANNELS } from '../shared/types';
import { isDevelopment } from '../shared/constants';
import { positionWindowAtCursor } from './position';

let mainWindow: BrowserWindow | null = null;

/**
 * Window configuration
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
 * Create main window
 * @returns Created BrowserWindow instance
 */
export function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    ...WINDOW_CONFIG,
    webPreferences: {
      // Preload script is built to the same directory as main.js by Vite plugin
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Make window appear on all workspaces/Spaces (including fullscreen apps)
  // This prevents the window from forcing a desktop switch when shown via global shortcut
  if (process.platform === 'darwin') {
    // macOS: Support fullscreen apps with visibleOnFullScreen option
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    // Set window level to floating so it appears above fullscreen apps
    mainWindow.setAlwaysOnTop(true, 'floating');
  } else {
    // Windows/Linux: Use standard options (visibleOnFullScreen not supported)
    mainWindow.setVisibleOnAllWorkspaces(true);
    mainWindow.setAlwaysOnTop(true);
  }

  // Load renderer process
  // In development: Vite dev server (via MAIN_WINDOW_VITE_DEV_SERVER_URL constant set by Electron Forge)
  // In production: Compiled HTML file from .vite/renderer/index.html (Vite 6 no longer uses subdirectories)
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Hide window when it loses focus
  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });

  // Uncomment to open DevTools in development
  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

/**
 * Get main window instance
 * @returns Main window instance or null
 */
export function getWindow(): BrowserWindow | null {
  return mainWindow;
}

/**
 * Show window and extract domain from clipboard
 * Automatically extracts domain from clipboard URL when window is shown
 */
export function showWindow(): void {
  // Extract domain from clipboard before showing window
  extractDomainFromClipboard();

  mainWindow?.show();
  mainWindow?.focus();
  // Notify renderer that window is shown
  mainWindow?.webContents.send(IPC_CHANNELS.WINDOW_SHOWN);
}

/**
 * Extract domain from clipboard URL and send to renderer
 * If extraction succeeds, send domain to renderer process
 */
function extractDomainFromClipboard(): void {
  const text = clipboard.readText('clipboard');

  if (text && text.length > 0) {
    try {
      // Use native URL API to parse the clipboard text
      const url = new URL(text);

      if (url.hostname && psl.isValid(url.hostname)) {
        const parsed = psl.parse(url.hostname) as ParsedDomain;

        if (parsed && parsed.sld) {
          mainWindow?.webContents.send(IPC_CHANNELS.KEY_FROM_CLIPBOARD, parsed.sld);
        }
      }
    } catch (error) {
      // Silently ignore parsing errors in production
      // URL constructor throws TypeError for invalid URLs
      if (isDevelopment) {
        console.error('Failed to parse clipboard URL:', error);
      }
    }
  }
}

/**
 * Hide window
 */
export function hideWindow(): void {
  mainWindow?.hide();
}

/**
 * Toggle window show/hide state
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
 * Set window position
 * @param x - X coordinate
 * @param y - Y coordinate
 */
export function setWindowPosition(x: number, y: number): void {
  mainWindow?.setPosition(x, y, false);
}

/**
 * Get window bounds
 * @returns Window bounds object
 */
export function getWindowBounds(): Bounds {
  if (mainWindow) {
    return mainWindow.getBounds();
  }
  return { x: 0, y: 0, width: WINDOW_CONFIG.width, height: WINDOW_CONFIG.height };
}

/**
 * Show window at cursor position
 * Window top-left corner will be displayed at cursor bottom-right
 */
export function showWindowAtCursor(): void {
  if (!mainWindow) {
    return;
  }

  positionWindowAtCursor(mainWindow);
  showWindow();
}
