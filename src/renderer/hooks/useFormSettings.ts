import { useEffect } from 'react';

export function useFormSettings(
  setPasswordLength: (length: number) => void,
  setPrefix: (prefix: string) => void,
  setSuffix: (suffix: string) => void
): void {
  useEffect(() => {
    const loadConfig = async (): Promise<void> => {
      try {
        const config = await window.rendererBridge.getConfig();
        setPasswordLength(config.formSettings.passwordLength);
        setPrefix(config.formSettings.prefix);
        setSuffix(config.formSettings.suffix);
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    void loadConfig();
  }, [setPasswordLength, setPrefix, setSuffix]);
}
