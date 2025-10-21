/**
 * English translations for main process
 */
export const enUS = {
  app: {
    name: 'FlowerPassword',
  },
  dialog: {
    quit: {
      message: 'Are you sure you want to quit?',
      confirm: 'Quit',
      cancel: 'Cancel',
    },
    shortcut: {
      registerFailed: 'Failed to register global shortcut',
      registerFailedMessage:
        'Failed to register global shortcut (CmdOrCtrl+Alt+S). The shortcut may be already in use by another application.',
    },
    autoLaunch: {
      setFailed: 'Failed to set auto-launch',
      setFailedMessage: 'Failed to configure launch at login. Please check system permissions.',
    },
  },
  tray: {
    tooltip: 'FlowerPassword',
    show: 'Show',
    quit: 'Quit',
    settings: 'Settings',
  },
  menu: {
    theme: 'Theme',
    language: 'Language',
    autoLaunch: 'Launch at Login',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
  },
  language: {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'en-US': 'English',
    'auto': 'Auto',
  },
  metadata: {
    htmlTitle: 'FlowerPassword',
    htmlDescription: 'FlowerPassword - Generate passwords based on memory password and distinction code',
  },
} as const;
