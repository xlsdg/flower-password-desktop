import { globalShortcut } from 'electron';
import { showWindowAtCursor } from './window';
import { t } from './i18n';
import { getConfig, setGlobalShortcut } from './config';
import { AVAILABLE_SHORTCUTS } from '../shared/constants';
import { showMessageBox } from './dialog';
import type { GlobalShortcut } from '../shared/types';

/**
 * Register global shortcuts
 * @param shortcut - Global shortcut to register
 */
export function applyShortcuts(shortcut: GlobalShortcut): void {
  unregisterShortcuts();

  const success = globalShortcut.register(shortcut, () => {
    showWindowAtCursor();
  });

  if (!success) {
    console.error('Failed to register global shortcut');
    void showMessageBox({
      type: 'error',
      title: t('dialog.shortcut.register.failed.title'),
      message: t('dialog.shortcut.register.failed.message'),
      buttons: ['OK'],
    });
  }
}

/**
 * Unregister all global shortcuts
 */
export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll();
}

/**
 * Show global shortcut selection dialog
 * Allows user to choose from predefined shortcuts
 */
export async function showShortcutDialog(): Promise<void> {
  const config = getConfig();
  const currentShortcut = config.globalShortcut;

  const shortcuts = Array.from(AVAILABLE_SHORTCUTS);
  const buttons: string[] = (shortcuts as string[]).concat(['Cancel']);
  const defaultId = shortcuts.indexOf(currentShortcut) >= 0 ? shortcuts.indexOf(currentShortcut) : 0;

  const result = await showMessageBox({
    type: 'question',
    title: t('dialog.shortcut.set.title'),
    message: t('dialog.shortcut.set.message'),
    detail: t('dialog.shortcut.set.current') + currentShortcut + '\n\nSelect a new shortcut:',
    buttons: buttons,
    defaultId: defaultId,
    cancelId: buttons.length - 1,
  });

  if (result.response === buttons.length - 1) {
    return;
  }

  const newShortcut = shortcuts[result.response];
  if (!newShortcut || newShortcut === currentShortcut) {
    return;
  }

  setGlobalShortcut(newShortcut);
}
