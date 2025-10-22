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
      register: {
        failed: {
          title: 'Failed to register global shortcut',
          message:
            'Failed to register global shortcut (CmdOrCtrl+Alt+S). The shortcut may be already in use by another application.',
        },
      },
      set: {
        title: 'Set Global Shortcut',
        message: 'Select a new shortcut:',
        detail: 'Current shortcut: {shortcut}',
        cancel: 'Cancel',
      },
    },
    autoLaunch: {
      set: {
        failed: {
          title: 'Failed to set auto-launch',
          message: 'Failed to configure launch at login. Please check system permissions.',
        },
      },
    },
    update: {
      title: 'Check for Updates',
      message: 'Current version: {version}',
      ok: 'OK',
      download: 'Download',
      cancel: 'Cancel',
      available: {
        title: 'Update Available',
        message: 'A new version is available!\n\nCurrent: {current}\nLatest: {latest}',
        detail: 'Would you like to download the update now?',
      },
      noUpdate: {
        message: 'You are using the latest version.',
      },
      downloading: {
        title: 'Downloading Update',
        message: 'Downloading update in the background...',
        detail: 'You will be notified when the download is complete.',
      },
      downloaded: {
        title: 'Update Ready',
        message: 'Version {version} has been downloaded.',
        detail: 'Restart now to install the update?',
        install: 'Restart & Install',
        later: 'Later',
      },
      error: {
        title: 'Update Error',
        message: 'Failed to check for updates.',
      },
    },
  },
  tray: {
    tooltip: 'FlowerPassword',
    show: 'Show',
    quit: 'Quit',
  },
  menu: {
    theme: 'Theme',
    language: 'Language',
    autoLaunch: 'Launch at Login',
    checkUpdate: 'Check for Updates',
    globalShortcut: 'Global Shortcut',
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
