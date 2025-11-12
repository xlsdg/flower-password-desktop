import * as path from 'node:path';

import { type BrowserWindow, nativeImage } from 'electron';

import { ASSET_PATHS } from '../shared/constants';

export interface PlatformAdapter {
  getTrayIconPath(): string;
  configureWindowBehavior(window: BrowserWindow): void;
  shouldHideDock(): boolean;
  shouldUseTemplateImage(): boolean;
}

class DarwinPlatform implements PlatformAdapter {
  getTrayIconPath(): string {
    return ASSET_PATHS.MONO_ICON;
  }

  configureWindowBehavior(window: BrowserWindow): void {
    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    window.setAlwaysOnTop(true, 'floating');
  }

  shouldHideDock(): boolean {
    return true;
  }

  shouldUseTemplateImage(): boolean {
    return true;
  }
}

class Win32Platform implements PlatformAdapter {
  getTrayIconPath(): string {
    return ASSET_PATHS.COLOR_ICON;
  }

  configureWindowBehavior(window: BrowserWindow): void {
    window.setVisibleOnAllWorkspaces(true);
    window.setAlwaysOnTop(true);
  }

  shouldHideDock(): boolean {
    return false;
  }

  shouldUseTemplateImage(): boolean {
    return false;
  }
}

class LinuxPlatform implements PlatformAdapter {
  getTrayIconPath(): string {
    return ASSET_PATHS.MONO_ICON;
  }

  configureWindowBehavior(window: BrowserWindow): void {
    window.setVisibleOnAllWorkspaces(true);
    window.setAlwaysOnTop(true);
  }

  shouldHideDock(): boolean {
    return false;
  }

  shouldUseTemplateImage(): boolean {
    return false;
  }
}

function createPlatformAdapter(): PlatformAdapter {
  switch (process.platform) {
    case 'darwin':
      return new DarwinPlatform();
    case 'win32':
      return new Win32Platform();
    default:
      return new LinuxPlatform();
  }
}

export const platformAdapter = createPlatformAdapter();

export function createTrayIcon(iconBasePath: string): Electron.NativeImage {
  const iconPath = platformAdapter.getTrayIconPath();
  const icon = nativeImage.createFromPath(path.join(iconBasePath, iconPath));

  if (platformAdapter.shouldUseTemplateImage()) {
    icon.setTemplateImage(true);
  }

  return icon;
}
