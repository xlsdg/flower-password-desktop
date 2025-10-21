/**
 * Simplified Chinese translations
 */
export const zhCN = {
  app: {
    title: 'Flower Password',
    close: '关闭',
  },
  metadata: {
    title: '花密',
    description: '花密 - 基于记忆密码与区分代号生成密码的应用',
    htmlLang: 'zh-CN',
  },
  form: {
    passwordPlaceholder: '记忆密码',
    keyPlaceholder: '区分代号',
    prefixPlaceholder: '区分代号前缀',
    suffixPlaceholder: '区分代号后缀',
    generateButton: '生成密码(点击复制)',
    lengthUnit: '位',
  },
  hints: {
    password: '记忆密码:可选择一个简单易记的密码,用于生成其他高强度密码。',
    key: '区分代号:用于区别不同用途密码的简短代号,如淘宝账号可用"taobao"或"tb"等。',
    website: '官网地址:',
  },
} as const;
