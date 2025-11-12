import { useCallback, useState } from 'react';
import { fpCode } from 'flowerpassword.js';

import { MASKED_CHAR_MIN_LENGTH, MASKED_CHAR_VISIBLE_END, MASKED_CHAR_VISIBLE_START } from '../../shared/constants';

interface UsePasswordGeneratorReturn {
  password: string;
  key: string;
  prefix: string;
  suffix: string;
  passwordLength: number;
  isPasswordVisible: boolean;
  setPassword: (password: string) => void;
  setKey: (key: string) => void;
  setPrefix: (prefix: string) => void;
  setSuffix: (suffix: string) => void;
  setPasswordLength: (length: number) => void;
  setIsPasswordVisible: (visible: boolean) => void;
  generatePassword: () => string | null;
  maskPassword: (pwd: string) => string;
  getPasswordDisplay: (defaultLabel: string) => string;
}

export function usePasswordGenerator(): UsePasswordGeneratorReturn {
  const [password, setPassword] = useState('');
  const [key, setKey] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const generatePassword = useCallback((): string | null => {
    if (password.length === 0 || key.length === 0) {
      return null;
    }

    const distinguishCode = `${prefix}${key}${suffix}`;
    return fpCode(password, distinguishCode, passwordLength);
  }, [password, key, prefix, suffix, passwordLength]);

  const maskPassword = useCallback((pwd: string): string => {
    if (pwd.length <= MASKED_CHAR_MIN_LENGTH) {
      return '•'.repeat(pwd.length);
    }
    const start = pwd.slice(0, MASKED_CHAR_VISIBLE_START);
    const end = pwd.slice(-MASKED_CHAR_VISIBLE_END);
    const middle = '•'.repeat(pwd.length - MASKED_CHAR_MIN_LENGTH);
    return `${start}${middle}${end}`;
  }, []);

  const getPasswordDisplay = useCallback(
    (defaultLabel: string): string => {
      const code = generatePassword();
      if (code === null) {
        return defaultLabel;
      }
      return isPasswordVisible ? code : maskPassword(code);
    },
    [generatePassword, isPasswordVisible, maskPassword]
  );

  return {
    // State
    password,
    key,
    prefix,
    suffix,
    passwordLength,
    isPasswordVisible,

    // Setters
    setPassword,
    setKey,
    setPrefix,
    setSuffix,
    setPasswordLength,
    setIsPasswordVisible,

    // Methods
    generatePassword,
    maskPassword,
    getPasswordDisplay,
  };
}
