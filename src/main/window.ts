import { BrowserWindow } from 'electron';
import * as path from 'node:path';
import type { WindowConfig, Bounds } from '../shared/types';
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
      preload: path.join(__dirname, '../preload/index.js'),
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

  // Load HTML file from dist/renderer (compiled by Rspack)
  // __dirname is dist/main, so need ../renderer/index.html
  void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

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
 * Show window
 */
export function showWindow(): void {
  mainWindow?.show();
  mainWindow?.focus();
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
 * Send message to renderer process
 * @param channel - IPC channel
 * @param data - Data to send
 */
export function sendToRenderer(channel: string, data: string): void {
  mainWindow?.webContents.send(channel, data);
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
