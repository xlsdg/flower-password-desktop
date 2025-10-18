/**
 * Main React application component
 * Handles user interface and password generation logic
 */

import { useState, useEffect, useCallback, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { fpCode } from 'flowerpassword.js';
import { UI_TEXTS, KEYBOARD_KEYS, ALLOWED_URL_PROTOCOLS } from '../shared/constants';
import './styles/reset.less';
import './styles/index.less';

/**
 * FlowerPassword main application component
 * @returns React component
 */
export function App(): React.JSX.Element {
  const [password, setPassword] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [length, setLength] = useState<number>(16);
  const [generatedCode, setGeneratedCode] = useState<string>(UI_TEXTS.GENERATE_PASSWORD_BUTTON);

  // Refs for autofocus
  const passwordInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate if URL is safe to open externally
   * @param url - URL string to validate
   * @returns True if URL is safe (http/https protocol only)
   */
  const isValidExternalUrl = useCallback((url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return (ALLOWED_URL_PROTOCOLS as readonly string[]).includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }, []);

  /**
   * Generate password based on inputs
   */
  const generatePassword = useCallback((): string | false => {
    if (password.length < 1 || key.length < 1) {
      return false;
    }

    const fullKey = prefix + key + suffix;
    const code = fpCode(password, fullKey, length);
    return code;
  }, [password, key, prefix, suffix, length]);

  /**
   * Update generated code when inputs change
   */
  useEffect(() => {
    const code = generatePassword();
    if (code !== false) {
      setGeneratedCode(code);
    } else {
      setGeneratedCode(UI_TEXTS.GENERATE_PASSWORD_BUTTON);
    }
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
      window.electronAPI
        .writeText(code)
        .then(() => {
          window.electronAPI.hide();
        })
        .catch((error: Error) => {
          console.error('Failed to write to clipboard:', error);
        });
    }
  }, [generatePassword]);

  /**
   * Handle Enter key press in key input
   * @param event - Keyboard event
   */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === KEYBOARD_KEYS.ENTER) {
        const code = generatePassword();
        if (code !== false) {
          window.electronAPI
            .writeText(code)
            .then(() => {
              event.preventDefault();
              window.electronAPI.hide();
            })
            .catch((error: Error) => {
              console.error('Failed to write to clipboard:', error);
            });
        }
      }
    },
    [generatePassword]
  );

  /**
   * Handle external link clicks
   * @param event - Mouse event
   * @param url - URL to open
   */
  const handleExternalLink = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, url: string): void => {
      if (isValidExternalUrl(url)) {
        event.preventDefault();
        window.electronAPI.openExternal(url).catch((error: Error) => {
          console.error('Failed to open external URL:', error);
        });
      }
    },
    [isValidExternalUrl]
  );

  /**
   * Listen to clipboard domain extraction
   */
  useEffect(() => {
    window.electronAPI.onKeyFromClipboard((message: string) => {
      setKey(message);
    });

    // Focus password input on mount
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, []);

  /**
   * Generate length options
   */
  const lengthOptions: number[] = Array.from({ length: 27 }, (_, i) => i + 6);

  return (
    <div className="flower-password">
      <i className="close" title="关闭" onClick={handleClose}></i>
      <h1 className="title">花密 Flower Password</h1>

      <div className="input-wrap">
        <input
          ref={passwordInputRef}
          className="password"
          name="password"
          type="password"
          placeholder="记忆密码"
          tabIndex={1}
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />
      </div>

      <div className="input-wrap">
        <input
          className="key"
          name="key"
          type="text"
          placeholder="区分代号"
          tabIndex={2}
          value={key}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>

      <div className="ctrl-wrap">
        <button className="btn-code" tabIndex={3} onClick={handleCopyPassword}>
          {generatedCode}
        </button>
        <select
          className="sel-length"
          tabIndex={4}
          value={length}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setLength(parseInt(e.target.value, 10))}
        >
          {lengthOptions.map(len => (
            <option key={len} value={len}>
              {len.toString().padStart(2, '0')}位
            </option>
          ))}
        </select>
      </div>

      <div className="input-wrap">
        <input
          className="prefix"
          name="prefix"
          type="text"
          placeholder="区分代号前缀"
          tabIndex={5}
          value={prefix}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPrefix(e.target.value)}
        />
        <input
          className="suffix"
          name="suffix"
          type="text"
          placeholder="区分代号后缀"
          tabIndex={6}
          value={suffix}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSuffix(e.target.value)}
        />
      </div>

      <p className="hint">· 记忆密码:可选择一个简单易记的密码,用于生成其他高强度密码。</p>
      <p className="hint">· 区分代号:用于区别不同用途密码的简短代号,如淘宝账号可用"taobao"或"tb"等。</p>
      <p className="hint">· 输入框按 Enter 键关闭本窗口。</p>
      <p className="hint">
        · 花密官网地址:
        <a
          href="https://flowerpassword.com/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => handleExternalLink(e, 'https://flowerpassword.com/')}
        >
          https://flowerpassword.com/
        </a>
      </p>
    </div>
  );
}
