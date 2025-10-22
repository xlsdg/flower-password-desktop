import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { enUS } from './locales/en-US';
import { zhCN } from './locales/zh-CN';
import { zhTW } from './locales/zh-TW';

export async function initI18n(): Promise<void> {
  await i18n.use(initReactI18next).init({
    resources: {
      'en-US': { translation: enUS },
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
    },
    lng: 'en-US',
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}
