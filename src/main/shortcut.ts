import { globalShortcut } from 'electron';

import { AVAILABLE_SHORTCUTS } from '../shared/constants';
import type { GlobalShortcut } from '../shared/types';
import { readConfig, setGlobalShortcut } from './config';
import { showMessageBox } from './dialog';
import { t } from './i18n';
import { showWindowAtCursor } from './window';

export function registerGlobalShortcut(shortcut: GlobalShortcut): void {
  unregisterGlobalShortcuts();

  const success = globalShortcut.register(shortcut, () => {
    showWindowAtCursor();
  });

  if (success) {
    return;
  }

  console.error('Failed to register global shortcut');
  void showMessageBox({
    type: 'error',
    title: t('dialog.shortcut.register.failed.title'),
    message: t('dialog.shortcut.register.failed.message'),
    buttons: ['OK'],
  });
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}

export async function promptShortcutSelection(): Promise<void> {
  const { globalShortcut: currentShortcut } = readConfig();
  const shortcuts = [...AVAILABLE_SHORTCUTS];
  const cancelLabel = t('dialog.shortcut.set.cancel');
  const alternativeShortcuts = shortcuts.filter(shortcut => shortcut !== currentShortcut);

  if (alternativeShortcuts.length === 0) {
    console.warn('No alternative shortcuts available for selection.');
    return;
  }

  const buttonLabels = [...alternativeShortcuts, cancelLabel];

  const result = await showMessageBox({
    type: 'question',
    title: t('dialog.shortcut.set.title'),
    message: t('dialog.shortcut.set.message'),
    detail: t('dialog.shortcut.set.detail', { shortcut: currentShortcut }),
    buttons: buttonLabels,
    defaultId: 0,
    cancelId: buttonLabels.length - 1,
  });

  if (result.response === buttonLabels.length - 1) {
    return;
  }

  const newShortcut = alternativeShortcuts[result.response];
  if (newShortcut === undefined) {
    return;
  }

  setGlobalShortcut(newShortcut);
}
