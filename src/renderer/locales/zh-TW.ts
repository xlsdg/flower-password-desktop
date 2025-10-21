/**
 * Traditional Chinese translations
 */
export const zhTW = {
  app: {
    title: 'Flower Password',
    close: '關閉',
  },
  metadata: {
    title: '花密',
    description: '花密 - 基於記憶密碼與區分代號生成密碼的應用',
    htmlLang: 'zh-TW',
  },
  form: {
    passwordPlaceholder: '記憶密碼',
    keyPlaceholder: '區分代號',
    prefixPlaceholder: '區分代號前綴',
    suffixPlaceholder: '區分代號後綴',
    generateButton: '生成密碼(點擊複製)',
    lengthUnit: '位',
  },
  hints: {
    password: '記憶密碼:可選擇一個簡單易記的密碼,用於生成其他高強度密碼。',
    key: '區分代號:用於區別不同用途密碼的簡短代號,如淘寶帳號可用「taobao」或「tb」等。',
    website: '官網地址:',
  },
} as const;
