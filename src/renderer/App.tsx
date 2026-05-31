import { useCallback, useRef, type ChangeEvent, type JSX, type KeyboardEvent, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { ALLOWED_PROTOCOLS, ENTER_KEY, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../shared/constants';
import { useFormSettings } from './hooks/useFormSettings';
import { usePasswordGenerator } from './hooks/usePasswordGenerator';
import { useWindowEvents } from './hooks/useWindowEvents';

import './styles/index.less';
import './styles/reset.less';

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

  const {
    password,
    key,
    prefix,
    suffix,
    passwordLength,
    setPassword,
    setKey,
    setPrefix,
    setSuffix,
    setPasswordLength,
    setIsPasswordVisible,
    generatePassword,
    getPasswordDisplay,
  } = usePasswordGenerator();

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  useFormSettings(setPasswordLength, setPrefix, setSuffix);

  useWindowEvents(password, passwordInputRef, keyInputRef, setKey);

  const generateButtonLabel = getPasswordDisplay(t('form.generateButton'));

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

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      setPassword(event.target.value);
    },
    [setPassword]
  );

  const handleKeyChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      setKey(event.target.value);
    },
    [setKey]
  );

  const handlePrefixChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const value = event.target.value;
      setPrefix(value);
      window.rendererBridge.updateFormSettings({ prefix: value });
    },
    [setPrefix]
  );

  const handleSuffixChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const value = event.target.value;
      setSuffix(value);
      window.rendererBridge.updateFormSettings({ suffix: value });
    },
    [setSuffix]
  );

  const handlePasswordLengthChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      const value = Number.parseInt(event.target.value, 10);
      setPasswordLength(value);
      window.rendererBridge.updateFormSettings({ passwordLength: value });
    },
    [setPasswordLength]
  );

  const handlePasswordMouseEnter = useCallback((): void => {
    setIsPasswordVisible(true);
  }, [setIsPasswordVisible]);

  const handlePasswordMouseLeave = useCallback((): void => {
    setIsPasswordVisible(false);
  }, [setIsPasswordVisible]);

  return (
    <div className="app">
      <div className="app__header">
        <h1 className="app__title">{t('app.title')}</h1>
        <button
          type="button"
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
          ref={passwordInputRef}
          className="app__input app__input--password"
          name="password"
          type="password"
          placeholder={t('form.passwordPlaceholder')}
          aria-label={t('form.passwordPlaceholder')}
          value={password}
          onChange={handlePasswordChange}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div className="app__form-group">
        <input
          ref={keyInputRef}
          className="app__input app__input--key"
          name="key"
          type="text"
          placeholder={t('form.keyPlaceholder')}
          aria-label={t('form.keyPlaceholder')}
          value={key}
          onChange={handleKeyChange}
          onKeyDown={handleKeyPress}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div className="app__controls">
        <button
          type="button"
          className="app__generate-btn"
          onClick={handleCopyPassword}
          onMouseEnter={handlePasswordMouseEnter}
          onMouseLeave={handlePasswordMouseLeave}
        >
          {generateButtonLabel}
        </button>
        <select className="app__length-select" value={passwordLength} onChange={handlePasswordLengthChange}>
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
          aria-label={t('form.prefixPlaceholder')}
          value={prefix}
          onChange={handlePrefixChange}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <input
          className="app__input app__input--suffix"
          name="suffix"
          type="text"
          placeholder={t('form.suffixPlaceholder')}
          aria-label={t('form.suffixPlaceholder')}
          value={suffix}
          onChange={handleSuffixChange}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
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
          onClick={event => handleExternalLink(event, 'https://flowerpassword.com/')}
        >
          https://flowerpassword.com/
        </a>
      </p>
    </div>
  );
}
