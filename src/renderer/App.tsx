import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { fpCode } from 'flowerpassword.js';

import './styles/reset.less';
import './styles/index.less';

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 32;
const DEFAULT_PASSWORD_LENGTH = 16;
const ENTER_KEY = 'Enter';
const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);
const PASSWORD_LENGTH_CHOICES = Array.from(
  { length: PASSWORD_MAX_LENGTH - PASSWORD_MIN_LENGTH + 1 },
  (_, index) => index + PASSWORD_MIN_LENGTH
);

function isSafeExternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_PROTOCOLS.has(parsedUrl.protocol);
  } catch {
    return false;
  }
}

export function App(): JSX.Element {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [key, setKey] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [passwordLength, setPasswordLength] = useState(DEFAULT_PASSWORD_LENGTH);
  const [generateButtonLabel, setGenerateButtonLabel] = useState(t('form.generateButton'));

  const keyInputRef = useRef<HTMLInputElement>(null);

  const generatePassword = useCallback((): string | null => {
    if (password.length === 0 || key.length === 0) {
      return null;
    }

    const distinguishCode = `${prefix}${key}${suffix}`;
    return fpCode(password, distinguishCode, passwordLength);
  }, [password, key, prefix, suffix, passwordLength]);

  useEffect(() => {
    const code = generatePassword();
    setGenerateButtonLabel(code ?? t('form.generateButton'));
  }, [generatePassword, t]);

  const copyAndHide = useCallback((code: string): void => {
    window.rendererBridge.writeText(code);
    window.rendererBridge.hide();
  }, []);

  const handleClose = useCallback((): void => {
    window.rendererBridge.hide();
  }, []);

  const handleCopyPassword = useCallback((): void => {
    const code = generatePassword();
    if (code !== null) {
      copyAndHide(code);
    }
  }, [generatePassword, copyAndHide]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key !== ENTER_KEY) {
        return;
      }

      event.preventDefault();
      const code = generatePassword();
      if (code !== null) {
        copyAndHide(code);
      }
    },
    [generatePassword, copyAndHide]
  );

  const handleExternalLink = useCallback((event: MouseEvent<HTMLAnchorElement>, url: string): void => {
    event.preventDefault();

    if (!isSafeExternalUrl(url)) {
      return;
    }

    window.rendererBridge.openExternal(url).catch(error => {
      console.error('Failed to open external URL:', error);
    });
  }, []);

  const loadInitialConfig = useCallback(async (): Promise<void> => {
    try {
      const config = await window.rendererBridge.getConfig();
      setPasswordLength(config.formSettings.passwordLength);
      setPrefix(config.formSettings.prefix);
      setSuffix(config.formSettings.suffix);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }, []);

  useEffect(() => {
    void loadInitialConfig();
  }, [loadInitialConfig]);

  const handleClipboardKey = useCallback((value: string): void => {
    setKey(value);
  }, []);

  const handleWindowShown = useCallback((): void => {
    keyInputRef.current?.focus();
  }, []);

  useEffect(() => {
    window.rendererBridge.onKeyFromClipboard(handleClipboardKey);
    window.rendererBridge.onWindowShown(handleWindowShown);
  }, [handleClipboardKey, handleWindowShown]);

  const handlePasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value);
  }, []);

  const handleKeyChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setKey(event.target.value);
  }, []);

  const handlePrefixChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const newPrefix = event.target.value;
    setPrefix(newPrefix);
    window.rendererBridge.updateFormSettings({ prefix: newPrefix });
  }, []);

  const handleSuffixChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const newSuffix = event.target.value;
    setSuffix(newSuffix);
    window.rendererBridge.updateFormSettings({ suffix: newSuffix });
  }, []);

  const handlePasswordLengthChange = useCallback((event: ChangeEvent<HTMLSelectElement>): void => {
    const newLength = Number.parseInt(event.target.value, 10);
    setPasswordLength(newLength);
    window.rendererBridge.updateFormSettings({ passwordLength: newLength });
  }, []);

  return (
    <div className="app">
      <div className="app__header">
        <h1 className="app__title">{t('app.title')}</h1>
        <button
          className="app__close-btn"
          title={t('app.close')}
          aria-label={t('app.close')}
          tabIndex={0}
          onClick={handleClose}
        >
          ×
        </button>
      </div>

      <div className="app__form-group">
        <input
          className="app__input app__input--password"
          name="password"
          type="password"
          placeholder={t('form.passwordPlaceholder')}
          tabIndex={1}
          value={password}
          onChange={handlePasswordChange}
        />
      </div>

      <div className="app__form-group">
        <input
          ref={keyInputRef}
          className="app__input app__input--key"
          name="key"
          type="text"
          placeholder={t('form.keyPlaceholder')}
          tabIndex={2}
          value={key}
          onChange={handleKeyChange}
          onKeyDown={handleKeyPress}
        />
      </div>

      <div className="app__controls">
        <button className="app__generate-btn" tabIndex={3} onClick={handleCopyPassword}>
          {generateButtonLabel}
        </button>
        <select
          className="app__length-select"
          tabIndex={4}
          value={passwordLength}
          onChange={handlePasswordLengthChange}
        >
          {PASSWORD_LENGTH_CHOICES.map(length => (
            <option key={length} value={length}>
              {length.toString().padStart(2, '0')}
              {t('form.lengthUnit')}
            </option>
          ))}
        </select>
      </div>

      <div className="app__form-group app__form-group--split">
        <input
          className="app__input app__input--prefix"
          name="prefix"
          type="text"
          placeholder={t('form.prefixPlaceholder')}
          tabIndex={5}
          value={prefix}
          onChange={handlePrefixChange}
        />
        <input
          className="app__input app__input--suffix"
          name="suffix"
          type="text"
          placeholder={t('form.suffixPlaceholder')}
          tabIndex={6}
          value={suffix}
          onChange={handleSuffixChange}
        />
      </div>

      <p className="app__hint">· {t('hints.password')}</p>
      <p className="app__hint">· {t('hints.key')}</p>
      <p className="app__hint">
        · {t('hints.website')}
        <a
          className="app__link"
          href="https://flowerpassword.com/"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={7}
          onClick={event => handleExternalLink(event, 'https://flowerpassword.com/')}
        >
          https://flowerpassword.com/
        </a>
      </p>
    </div>
  );
}
