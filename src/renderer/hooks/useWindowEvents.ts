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
        let timerId: ReturnType<typeof setTimeout> | undefined;
        const onFocus = (): void => {
          clearTimeout(timerId);
          focusTarget();
        };
        window.addEventListener('focus', onFocus, { once: true });
        timerId = setTimeout(() => {
          window.removeEventListener('focus', onFocus);
          focusTarget();
        }, 100);
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
