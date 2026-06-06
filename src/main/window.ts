import * as path from 'node:path';

import { BrowserWindow, clipboard } from 'electron';
import * as psl from 'psl';

import { IPC_CHANNELS, MAIN_WINDOW_OPTIONS, isDevelopment } from '../shared/constants';
import type { ParsedDomain } from '../shared/types';
import { platformAdapter } from './platform';
import { positionWindowAtCursor } from './position';

class WindowOperations {
  constructor(private window: BrowserWindow) {}

  sendMessage(channel: string, ...args: unknown[]): void {
    this.window.webContents.send(channel, ...args);
  }

  isDevToolsOpen(): boolean {
    return this.window.webContents.isDevToolsOpened();
  }

  show(): void {
    this.window.show();
  }

  focus(): void {
    this.window.focus();
  }

  hide(): void {
    this.window.hide();
  }

  isVisible(): boolean {
    return this.window.isVisible();
  }
}

let mainWindow: BrowserWindow | null = null;
let windowOps: WindowOperations | null = null;

export function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    ...MAIN_WINDOW_OPTIONS,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  windowOps = new WindowOperations(mainWindow);
  platformAdapter.configureWindowBehavior(mainWindow);
  loadRendererEntry(mainWindow);
  mainWindow.on('blur', () => {
    handleBlur();
  });
  return mainWindow;
}

export function getWindow(): BrowserWindow | null {
  return mainWindow;
}

export function showWindow(): void {
  if (windowOps === null) {
    return;
  }

  forwardClipboardDomain();
  windowOps.show();
  windowOps.focus();
  windowOps.sendMessage(IPC_CHANNELS.WINDOW_SHOWN);
}

export function hideWindow(): void {
  windowOps?.hide();
}

export function showWindowAtCursor(): void {
  if (mainWindow === null) {
    return;
  }

  positionWindowAtCursor(mainWindow);
  showWindow();
}

function loadRendererEntry(window: BrowserWindow): void {
  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL === 'string') {
    void window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    return;
  }

  void window.loadFile(path.join(__dirname, '../renderer/index.html'));
}

function forwardClipboardDomain(): void {
  const clipboardText = clipboard.readText('clipboard');
  if (clipboardText.length === 0) {
    return;
  }

  try {
    const { hostname } = new URL(clipboardText);
    if (hostname.length === 0 || !psl.isValid(hostname)) {
      return;
    }

    const parsed = psl.parse(hostname) as ParsedDomain | null;
    if (parsed !== null && typeof parsed.sld === 'string' && parsed.sld.length > 0) {
      windowOps?.sendMessage(IPC_CHANNELS.KEY_FROM_CLIPBOARD, parsed.sld);
    }
  } catch (error) {
    if (isDevelopment) {
      console.error('Failed to parse clipboard URL:', error);
    }
  }
}

function handleBlur(): void {
  if (windowOps === null) {
    return;
  }

  if (!windowOps.isDevToolsOpen()) {
    windowOps.hide();
  }
}
