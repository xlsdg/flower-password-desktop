import { useEffect, useRef } from 'react';

export function useWindowEvents(
  password: string,
  passwordInputRef: React.RefObject<HTMLInputElement | null>,
  keyInputRef: React.RefObject<HTMLInputElement | null>,
  onClipboardKey: (value: string) => void
): void {
  const passwordRef = useRef(password);
  const focusTimerRef = useRef(0);

  useEffect(() => {
    passwordRef.current = password;
  }, [password]);

  useEffect(() => {
    const clearFocusTimer = (): void => {
      window.clearTimeout(focusTimerRef.current);
    };

    const handleClipboardKey = (value: string): void => {
      onClipboardKey(value);
    };

    const handleWindowShown = (): void => {
      clearFocusTimer();
      focusTimerRef.current = window.setTimeout(() => {
        const targetInput = passwordRef.current.length === 0 ? passwordInputRef.current : keyInputRef.current;
        targetInput?.focus();
      }, 100);
    };

    const unsubscribeKeyFromClipboard = window.rendererBridge.onKeyFromClipboard(handleClipboardKey);
    const unsubscribeWindowShown = window.rendererBridge.onWindowShown(handleWindowShown);

    return (): void => {
      clearFocusTimer();
      unsubscribeKeyFromClipboard();
      unsubscribeWindowShown();
    };
  }, [passwordInputRef, keyInputRef, onClipboardKey]);
}
