/**
 * Traditional Chinese translations for main process
 */
export const zhTW = {
  app: {
    name: '花密',
  },
  dialog: {
    quit: {
      message: '確定退出？',
      confirm: '確定',
      cancel: '取消',
    },
    shortcut: {
      registerFailed: '快速鍵註冊失敗',
      registerFailedMessage: '無法註冊全域快速鍵（CmdOrCtrl+Alt+S）。該快速鍵可能已被其他應用程式佔用。',
    },
    autoLaunch: {
      setFailed: '開機自啟設定失敗',
      setFailedMessage: '錯誤詳情：',
    },
  },
  tray: {
    tooltip: '花密',
    show: '顯示',
    quit: '退出',
    settings: '設定',
  },
  menu: {
    theme: '主題',
    language: '語言',
    autoLaunch: '開機自啟',
  },
  theme: {
    light: '淺色',
    dark: '深色',
    auto: '自動',
  },
  language: {
    'zh-CN': '簡體中文',
    'zh-TW': '繁體中文',
    'en-US': 'English',
    'auto': '自動',
  },
  metadata: {
    htmlTitle: '花密',
    htmlDescription: '花密 - 基於記憶密碼與區分代號生成密碼的應用',
  },
} as const;
