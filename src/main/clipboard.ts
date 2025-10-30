import { clipboard } from 'electron';

interface ClipboardManager {
  originalText: string;
  timeoutId: NodeJS.Timeout | null;
  writeText: (text: string, timeout?: number) => void;
  clearTimer: () => void;
}

export const clipboardManager: ClipboardManager = {
  originalText: '',
  timeoutId: null,
  writeText,
  clearTimer,
};

function clearTimer(): void {
  if (clipboardManager.timeoutId !== null) {
    clearTimeout(clipboardManager.timeoutId);
    clipboardManager.timeoutId = null;
  }

  clipboardManager.originalText = '';
}

function clearClipboardIfUnchanged(): void {
  const currentContent = clipboard.readText();
  if (currentContent === clipboardManager.originalText) {
    clipboard.writeText('');
  }

  clearTimer();
}

function writeText(text: string, timeout: number = 10000): void {
  clearTimer();

  clipboard.writeText(text);
  clipboardManager.originalText = text;

  clipboardManager.timeoutId = setTimeout(() => {
    clearClipboardIfUnchanged();
  }, timeout);
}
