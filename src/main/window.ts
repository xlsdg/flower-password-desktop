import * as path from 'node:path';

import { BrowserWindow, clipboard } from 'electron';
import * as psl from 'psl';

import { IPC_CHANNELS, MAIN_WINDOW_OPTIONS, isDevelopment } from '../shared/constants';
import type { ParsedDomain } from '../shared/types';
import { positionWindowAtCursor } from './position';

let mainWindow: BrowserWindow | null = null;

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

  configurePlatformWindowBehavior(mainWindow);
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
  forwardClipboardDomain();
  mainWindow?.show();
  mainWindow?.focus();
  mainWindow?.webContents.send(IPC_CHANNELS.WINDOW_SHOWN);
}

export function hideWindow(): void {
  mainWindow?.hide();
}

export function showWindowAtCursor(): void {
  if (!mainWindow) {
    return;
  }

  positionWindowAtCursor(mainWindow);
  showWindow();
}

function configurePlatformWindowBehavior(window: BrowserWindow): void {
  if (process.platform === 'darwin') {
    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    window.setAlwaysOnTop(true, 'floating');
    return;
  }

  window.setVisibleOnAllWorkspaces(true);
  window.setAlwaysOnTop(true);
}

function loadRendererEntry(window: BrowserWindow): void {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    return;
  }

  void window.loadFile(path.join(__dirname, '../renderer/index.html'));
}

function forwardClipboardDomain(): void {
  const clipboardText = clipboard.readText('clipboard');
  if (!clipboardText) {
    return;
  }

  try {
    const { hostname } = new URL(clipboardText);
    if (!hostname || !psl.isValid(hostname)) {
      return;
    }

    const parsed = psl.parse(hostname) as ParsedDomain | null;
    if (parsed?.sld) {
      mainWindow?.webContents.send(IPC_CHANNELS.KEY_FROM_CLIPBOARD, parsed.sld);
    }
  } catch (error) {
    if (isDevelopment) {
      console.error('Failed to parse clipboard URL:', error);
    }
  }
}

function handleBlur(): void {
  if (!mainWindow) {
    return;
  }

  if (!mainWindow.webContents.isDevToolsOpened()) {
    mainWindow.hide();
  }
}
