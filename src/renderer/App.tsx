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

import { ALLOWED_PROTOCOLS, ENTER_KEY, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../shared/constants';
import { useFormSettings } from './hooks/useFormSettings';
import { usePasswordGenerator } from './hooks/usePasswordGenerator';
import { useWindowEvents } from './hooks/useWindowEvents';

import './styles/reset.less';
import './styles/index.less';

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

function createInputHandler<T>(
  setter: (value: T) => void,
  onUpdate?: (value: T) => void
): (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void {
  return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const value = event.target.value as T;
    setter(value);
    onUpdate?.(value);
  };
}

function createNumberInputHandler(
  setter: (value: number) => void,
  onUpdate?: (value: number) => void
): (event: ChangeEvent<HTMLSelectElement>) => void {
  return (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = Number.parseInt(event.target.value, 10);
    setter(value);
    onUpdate?.(value);
  };
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

  const [generateButtonLabel, setGenerateButtonLabel] = useState(t('form.generateButton'));

  useEffect(() => {
    setGenerateButtonLabel(getPasswordDisplay(t('form.generateButton')));
  }, [getPasswordDisplay, t]);

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

  const handlePasswordChange = useCallback(createInputHandler(setPassword), [setPassword]);
  const handleKeyChange = useCallback(createInputHandler(setKey), [setKey]);

  const handlePrefixChange = useCallback(
    createInputHandler(setPrefix, (value: string) => {
      window.rendererBridge.updateFormSettings({ prefix: value });
    }),
    [setPrefix]
  );

  const handleSuffixChange = useCallback(
    createInputHandler(setSuffix, (value: string) => {
      window.rendererBridge.updateFormSettings({ suffix: value });
    }),
    [setSuffix]
  );

  const handlePasswordLengthChange = useCallback(
    createNumberInputHandler(setPasswordLength, (value: number) => {
      window.rendererBridge.updateFormSettings({ passwordLength: value });
    }),
    [setPasswordLength]
  );

  const handlePasswordMouseEnter = useCallback((): void => {
    setIsPasswordVisible(true);
  }, []);

  const handlePasswordMouseLeave = useCallback((): void => {
    setIsPasswordVisible(false);
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
          ref={passwordInputRef}
          className="app__input app__input--password"
          name="password"
          type="password"
          placeholder={t('form.passwordPlaceholder')}
          tabIndex={1}
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
          tabIndex={2}
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
          className="app__generate-btn"
          tabIndex={3}
          onClick={handleCopyPassword}
          onMouseEnter={handlePasswordMouseEnter}
          onMouseLeave={handlePasswordMouseLeave}
        >
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
          tabIndex={6}
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
          tabIndex={7}
          onClick={event => handleExternalLink(event, 'https://flowerpassword.com/')}
        >
          https://flowerpassword.com/
        </a>
      </p>
    </div>
  );
}
