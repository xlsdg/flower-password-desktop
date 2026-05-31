import { useEffect, useRef } from 'react';

export function useWindowEvents(
  password: string,
  passwordInputRef: React.RefObject<HTMLInputElement | null>,
  keyInputRef: React.RefObject<HTMLInputElement | null>,
  onClipboardKey: (value: string) => void
): void {
  const passwordRef = useRef(password);

  useEffect(() => {
    passwordRef.current = password;
  }, [password]);

  useEffect(() => {
    const handleClipboardKey = (value: string): void => {
      onClipboardKey(value);
    };

    const focusTarget = (): void => {
      const targetInput = passwordRef.current.length === 0 ? passwordInputRef.current : keyInputRef.current;
      targetInput?.focus();
    };

    const handleWindowShown = (): void => {
      if (document.hasFocus()) {
        focusTarget();
      } else {
        window.addEventListener('focus', focusTarget, { once: true });
      }
    };

    const unsubscribeKeyFromClipboard = window.rendererBridge.onKeyFromClipboard(handleClipboardKey);
    const unsubscribeWindowShown = window.rendererBridge.onWindowShown(handleWindowShown);

    return (): void => {
      window.removeEventListener('focus', focusTarget);
      unsubscribeKeyFromClipboard();
      unsubscribeWindowShown();
    };
  }, [passwordInputRef, keyInputRef, onClipboardKey]);
}
