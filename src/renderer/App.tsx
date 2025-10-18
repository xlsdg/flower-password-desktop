/**
 * Main React application component
 * Handles user interface and password generation logic
 */

import { useState, useEffect, useCallback, useMemo, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { fpCode } from 'flowerpassword.js';
import { UI_TEXTS, KEYBOARD_KEYS, ALLOWED_URL_PROTOCOLS } from '../shared/constants';
import './styles/reset.less';
import './styles/index.less';

/**
 * Password length range configuration
 */
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 32;

/**
 * Generate array of password length options from min to max
 * @returns Array of length values from 6 to 32
 */
function generateLengthOptions(): number[] {
  const count = PASSWORD_MAX_LENGTH - PASSWORD_MIN_LENGTH + 1;
  return Array.from({ length: count }, (_, i) => i + PASSWORD_MIN_LENGTH);
}

/**
 * Validate if URL is safe to open externally
 * @param url - URL string to validate
 * @returns True if URL is safe (http/https protocol only)
 */
function validateExternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (ALLOWED_URL_PROTOCOLS as readonly string[]).includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * FlowerPassword main application component
 * @returns React component
 */
export function App(): React.JSX.Element {
  const [password, setPassword] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [passwordLength, setPasswordLength] = useState<number>(16);
  const [generatedPassword, setGeneratedPassword] = useState<string>(UI_TEXTS.GENERATE_PASSWORD_BUTTON);

  // Refs for autofocus
  const passwordInputRef = useRef<HTMLInputElement>(null);

  /**
   * Generate password based on current form inputs
   * @returns Generated password string or false if inputs are invalid
   */
  const generatePassword = useCallback((): string | false => {
    if (password.length < 1 || key.length < 1) {
      return false;
    }

    const distinguishCode = prefix + key + suffix;
    const code = fpCode(password, distinguishCode, passwordLength);
    return code;
  }, [password, key, prefix, suffix, passwordLength]);

  /**
   * Copy password to clipboard and hide window
   * Extracted to avoid duplication in handleCopyPassword and handleKeyPress
   * @param code - Generated password code
   */
  const copyPasswordAndHide = useCallback((code: string): void => {
    window.electronAPI
      .writeText(code)
      .then(() => {
        window.electronAPI.hide();
      })
      .catch((error: Error) => {
        console.error('Failed to write to clipboard:', error);
      });
  }, []);

  /**
   * Update generated code when inputs change
   */
  useEffect(() => {
    const code = generatePassword();
    setGeneratedPassword(code !== false ? code : UI_TEXTS.GENERATE_PASSWORD_BUTTON);
  }, [generatePassword]);

  /**
   * Handle close button click
   */
  const handleClose = useCallback((): void => {
    window.electronAPI.hide();
  }, []);

  /**
   * Copy generated password to clipboard and hide window
   */
  const handleCopyPassword = useCallback((): void => {
    const code = generatePassword();
    if (code !== false) {
      copyPasswordAndHide(code);
    }
  }, [generatePassword, copyPasswordAndHide]);

  /**
   * Handle Enter key press in key input
   * @param event - Keyboard event
   */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === KEYBOARD_KEYS.ENTER) {
        event.preventDefault();

        const code = generatePassword();
        if (code !== false) {
          copyPasswordAndHide(code);
        }
      }
    },
    [generatePassword, copyPasswordAndHide]
  );

  /**
   * Handle external link clicks
   * @param event - Mouse event
   * @param url - URL to open
   */
  const handleExternalLink = useCallback((event: React.MouseEvent<HTMLAnchorElement>, url: string): void => {
    event.preventDefault();
    if (validateExternalUrl(url)) {
      window.electronAPI.openExternal(url).catch((error: Error) => {
        console.error('Failed to open external URL:', error);
      });
    }
  }, []);

  /**
   * Listen to clipboard domain extraction
   */
  useEffect(() => {
    const handleClipboardKey = (message: string): void => {
      setKey(message);
    };

    // Set up IPC listener
    window.electronAPI.onKeyFromClipboard(handleClipboardKey);

    // Focus password input on mount
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }

    // Note: Electron IPC listeners don't need cleanup in this context
    // as they are managed by the main process and bound to window lifecycle
  }, []);

  /**
   * Generate length options (6-32 characters)
   * Memoized to avoid recreating array on every render
   */
  const lengthOptions = useMemo((): number[] => {
    return generateLengthOptions();
  }, []);

  /**
   * Handle input change events
   */
  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  }, []);

  const handleKeyChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setKey(e.target.value);
  }, []);

  const handlePrefixChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setPrefix(e.target.value);
  }, []);

  const handleSuffixChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setSuffix(e.target.value);
  }, []);

  const handlePasswordLengthChange = useCallback((e: ChangeEvent<HTMLSelectElement>): void => {
    setPasswordLength(parseInt(e.target.value, 10));
  }, []);

  return (
    <div className="app">
      <div className="app__header">
        <h1 className="app__title">花密 Flower Password</h1>
        <button className="app__close-btn" title="关闭" aria-label="关闭" tabIndex={0} onClick={handleClose}>
          ×
        </button>
      </div>

      <div className="app__form-group">
        <input
          ref={passwordInputRef}
          className="app__input app__input--password"
          name="password"
          type="password"
          placeholder="记忆密码"
          tabIndex={1}
          value={password}
          onChange={handlePasswordChange}
        />
      </div>

      <div className="app__form-group">
        <input
          className="app__input app__input--key"
          name="key"
          type="text"
          placeholder="区分代号"
          tabIndex={2}
          value={key}
          onChange={handleKeyChange}
          onKeyDown={handleKeyPress}
        />
      </div>

      <div className="app__controls">
        <button className="app__generate-btn" tabIndex={3} onClick={handleCopyPassword}>
          {generatedPassword}
        </button>
        <select
          className="app__length-select"
          tabIndex={4}
          value={passwordLength}
          onChange={handlePasswordLengthChange}
        >
          {lengthOptions.map(len => (
            <option key={len} value={len}>
              {len.toString().padStart(2, '0')}位
            </option>
          ))}
        </select>
      </div>

      <div className="app__form-group app__form-group--split">
        <input
          className="app__input app__input--prefix"
          name="prefix"
          type="text"
          placeholder="区分代号前缀"
          tabIndex={5}
          value={prefix}
          onChange={handlePrefixChange}
        />
        <input
          className="app__input app__input--suffix"
          name="suffix"
          type="text"
          placeholder="区分代号后缀"
          tabIndex={6}
          value={suffix}
          onChange={handleSuffixChange}
        />
      </div>

      <p className="app__hint">· 记忆密码:可选择一个简单易记的密码,用于生成其他高强度密码。</p>
      <p className="app__hint">· 区分代号:用于区别不同用途密码的简短代号,如淘宝账号可用"taobao"或"tb"等。</p>
      <p className="app__hint">
        · 花密官网地址:
        <a
          className="app__link"
          href="https://flowerpassword.com/"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={7}
          onClick={e => handleExternalLink(e, 'https://flowerpassword.com/')}
        >
          https://flowerpassword.com/
        </a>
      </p>
    </div>
  );
}
