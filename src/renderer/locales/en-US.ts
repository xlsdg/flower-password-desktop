export const enUS = {
  app: {
    title: 'Flower Password',
    close: 'Close',
  },
  metadata: {
    title: 'FlowerPassword',
    description: 'FlowerPassword - Generate passwords based on memory password and distinction code',
    htmlLang: 'en-US',
  },
  form: {
    passwordPlaceholder: 'Memory Password',
    keyPlaceholder: 'Distinction Code',
    prefixPlaceholder: 'Prefix',
    suffixPlaceholder: 'Suffix',
    generateButton: 'Generate Password (Click to Copy)',
    lengthUnit: ' chars',
  },
  hints: {
    password: 'Memory Password: A simple password to generate strong passwords.',
    key: 'Distinction Code: A short code for different accounts, e.g., "taobao" or "tb".',
    website: 'Official Website: ',
  },
} as const;
