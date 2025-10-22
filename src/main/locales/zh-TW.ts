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
      register: {
        failed: {
          title: '快速鍵註冊失敗',
          message: '無法註冊全域快速鍵（CmdOrCtrl+Alt+S）。該快速鍵可能已被其他應用程式佔用。',
        },
      },
      set: {
        title: '設定全域快速鍵',
        message: '請選擇新的快速鍵：',
        detail: '目前快速鍵：{shortcut}',
        cancel: '取消',
      },
    },
    autoLaunch: {
      set: {
        failed: {
          title: '開機自啟設定失敗',
          message: '無法配置開機自啟功能，請檢查系統權限設定。',
        },
      },
    },
    update: {
      title: '檢查更新',
      message: '目前版本：{version}',
      ok: '確定',
      download: '下載',
      cancel: '取消',
      available: {
        title: '發現新版本',
        message: '發現新版本！\n\n目前版本：{current}\n最新版本：{latest}',
        detail: '是否立即下載更新？',
      },
      noUpdate: {
        message: '您正在使用最新版本。',
      },
      downloading: {
        title: '正在下載更新',
        message: '正在背景下載更新...',
        detail: '下載完成後將通知您。',
      },
      downloaded: {
        title: '更新已就緒',
        message: '版本 {version} 已下載完成。',
        detail: '是否立即重新啟動並安裝更新？',
        install: '重新啟動並安裝',
        later: '稍後',
      },
      error: {
        title: '更新錯誤',
        message: '檢查更新失敗。',
      },
    },
  },
  tray: {
    tooltip: '花密',
    show: '顯示',
    quit: '退出',
  },
  menu: {
    theme: '主題',
    language: '語言',
    autoLaunch: '開機自啟',
    checkUpdate: '檢查更新',
    globalShortcut: '全域快速鍵',
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
