import { app, shell } from 'electron';

import { showMessageBox } from './dialog';
import { t } from './i18n';

let isCheckingForUpdates = false;

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  name: string;
  body: string;
}

/**
 * Compare two semantic version strings
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] ?? 0;
    const part2 = parts2[i] ?? 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

export async function checkForUpdates(): Promise<void> {
  if (isCheckingForUpdates) {
    return;
  }

  isCheckingForUpdates = true;

  try {
    const response = await fetch('https://api.github.com/repos/xlsdg/flower-password-desktop/releases/latest');

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
    }

    const release = (await response.json()) as GitHubRelease;
    const latestVersion = release.tag_name.replace(/^v/, '');
    const currentVersion = app.getVersion();

    const comparison = compareVersions(latestVersion, currentVersion);

    if (comparison > 0) {
      await showUpdateAvailable(latestVersion, release.html_url);
    } else {
      await showNoUpdate(currentVersion);
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
    void showUpdateError(error instanceof Error ? error.message : String(error));
  } finally {
    isCheckingForUpdates = false;
  }
}

async function showUpdateAvailable(latestVersion: string, releaseUrl: string): Promise<void> {
  const currentVersion = app.getVersion();

  const result = await showMessageBox({
    type: 'info',
    buttons: [t('dialog.update.ok'), t('dialog.update.cancel')],
    defaultId: 0,
    title: t('dialog.update.available.title'),
    message: t('dialog.update.available.message', { current: currentVersion, latest: latestVersion }),
    detail: t('dialog.update.available.detail'),
    cancelId: 1,
  });

  if (result.response === 0) {
    await shell.openExternal(releaseUrl);
  }
}

async function showNoUpdate(version: string): Promise<void> {
  await showMessageBox({
    type: 'info',
    buttons: [t('dialog.update.ok')],
    defaultId: 0,
    title: t('dialog.update.title'),
    message: t('dialog.update.noUpdate.message'),
    detail: t('dialog.update.message', { version }),
  });
}

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
