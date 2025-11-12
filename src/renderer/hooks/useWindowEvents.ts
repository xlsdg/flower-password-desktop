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

    const handleWindowShown = (): void => {
      if (passwordRef.current.length === 0) {
        passwordInputRef.current?.focus();
      } else {
        keyInputRef.current?.focus();
        keyInputRef.current?.select();
      }
    };

    const unsubscribeKeyFromClipboard = window.rendererBridge.onKeyFromClipboard(handleClipboardKey);
    const unsubscribeWindowShown = window.rendererBridge.onWindowShown(handleWindowShown);

    return (): void => {
      unsubscribeKeyFromClipboard();
      unsubscribeWindowShown();
    };
  }, [passwordInputRef, keyInputRef, onClipboardKey]);
}
