import { clipboard } from 'electron';

import { CLIPBOARD_CLEAR_TIMEOUT } from '../shared/constants';

interface ClipboardState {
  readonly originalText: string;
  readonly timeoutId: NodeJS.Timeout | null;
}

let clipboardState: ClipboardState = {
  originalText: '',
  timeoutId: null,
};

function clearTimer(): void {
  if (clipboardState.timeoutId !== null) {
    clearTimeout(clipboardState.timeoutId);
  }

  clipboardState = {
    originalText: '',
    timeoutId: null,
  };
}

function clearClipboardIfUnchanged(): void {
  const currentContent = clipboard.readText();
  if (currentContent === clipboardState.originalText) {
    clipboard.writeText('');
  }

  clearTimer();
}

function writeText(text: string, timeout: number = CLIPBOARD_CLEAR_TIMEOUT): void {
  clearTimer();

  clipboard.writeText(text);

  clipboardState = {
    originalText: text,
    timeoutId: setTimeout(() => {
      clearClipboardIfUnchanged();
    }, timeout),
  };
}

export const clipboardManager = {
  writeText,
  clearTimer,
} as const;
