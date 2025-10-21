import { autoUpdater } from 'electron-updater';
import { app } from 'electron';
import { t } from './i18n';
import { showMessageBox } from './dialog';

let isCheckingForUpdates = false;

/**
 * Initialize auto-updater
 * Configures update settings and event handlers
 * Only works in production builds (packaged apps)
 */
export function initUpdater(): void {
  if (!app.isPackaged) {
    return;
  }

  // Configure update server (GitHub Releases)
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'xlsdg',
    repo: 'flower-password-desktop',
  });

  // Configure auto-updater
  autoUpdater.autoDownload = false; // Don't auto-download, ask user first
  autoUpdater.autoInstallOnAppQuit = true; // Auto-install when app quits

  // Set up event handlers
  autoUpdater.on('error', (error: Error) => {
    console.error('Update error:', error);
    if (isCheckingForUpdates) {
      void showUpdateError(error.message);
      isCheckingForUpdates = false;
    }
  });

  autoUpdater.on('checking-for-update', () => {
    // Checking for updates...
  });

  autoUpdater.on('update-available', info => {
    console.warn('Update available:', info.version);
    isCheckingForUpdates = false;
    void showUpdateAvailable(info.version);
  });

  autoUpdater.on('update-not-available', info => {
    console.warn('Update not available. Current version:', info.version);
    if (isCheckingForUpdates) {
      void showNoUpdate(info.version);
      isCheckingForUpdates = false;
    }
  });

  autoUpdater.on('download-progress', progressInfo => {
    const percent = Math.round(progressInfo.percent);
    console.warn(`Download progress: ${percent}%`);
  });

  autoUpdater.on('update-downloaded', info => {
    console.warn('Update downloaded:', info.version);
    void showUpdateDownloaded(info.version);
  });
}

/**
 * Check for updates manually (triggered by user)
 */
export async function checkForUpdates(): Promise<void> {
  if (isCheckingForUpdates) {
    return;
  }

  isCheckingForUpdates = true;

  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('Failed to check for updates:', error);
    isCheckingForUpdates = false;
    void showUpdateError(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Show dialog when update is available
 * @param version - New version number
 */
async function showUpdateAvailable(version: string): Promise<void> {
  const currentVersion = app.getVersion();

  const result = await showMessageBox({
    type: 'info',
    buttons: [t('dialog.update.download'), t('dialog.update.cancel')],
    defaultId: 0,
    title: t('dialog.update.available.title'),
    message: t('dialog.update.available.message').replace('{current}', currentVersion).replace('{latest}', version),
    detail: t('dialog.update.available.detail'),
    cancelId: 1,
  });

  if (result.response === 0) {
    void downloadUpdate();
  }
}

/**
 * Show dialog when no update is available
 * @param version - Current version number
 */
async function showNoUpdate(version: string): Promise<void> {
  await showMessageBox({
    type: 'info',
    buttons: [t('dialog.update.ok')],
    defaultId: 0,
    title: t('dialog.update.title'),
    message: t('dialog.update.noUpdate.message'),
    detail: `${t('dialog.update.message')}${version}`,
  });
}

/**
 * Show dialog when update download completes
 * @param version - New version number
 */
async function showUpdateDownloaded(version: string): Promise<void> {
  const result = await showMessageBox({
    type: 'info',
    buttons: [t('dialog.update.downloaded.install'), t('dialog.update.downloaded.later')],
    defaultId: 0,
    title: t('dialog.update.downloaded.title'),
    message: t('dialog.update.downloaded.message').replace('{version}', version),
    detail: t('dialog.update.downloaded.detail'),
    cancelId: 1,
  });

  if (result.response === 0) {
    autoUpdater.quitAndInstall(false, true);
  }
}

/**
 * Show error dialog
 * @param errorMessage - Error message
 */
async function showUpdateError(errorMessage: string): Promise<void> {
  await showMessageBox({
    type: 'error',
    buttons: [t('dialog.update.ok')],
    defaultId: 0,
    title: t('dialog.update.error.title'),
    message: t('dialog.update.error.message'),
    detail: errorMessage,
  });
}

/**
 * Download update
 */
async function downloadUpdate(): Promise<void> {
  void showMessageBox({
    type: 'info',
    buttons: [t('dialog.update.ok')],
    defaultId: 0,
    title: t('dialog.update.downloading.title'),
    message: t('dialog.update.downloading.message'),
    detail: t('dialog.update.downloading.detail'),
  });

  try {
    await autoUpdater.downloadUpdate();
  } catch (error) {
    console.error('Failed to download update:', error);
    void showUpdateError(error instanceof Error ? error.message : String(error));
  }
}
