export const zhCN = {
  app: {
    name: '花密',
  },
  dialog: {
    quit: {
      message: '确定退出？',
      confirm: '确定',
      cancel: '取消',
    },
    shortcut: {
      register: {
        failed: {
          title: '快捷键注册失败',
          message: '无法注册全局快捷键（CmdOrCtrl+Alt+S）。该快捷键可能已被其他应用占用。',
        },
      },
      set: {
        title: '设置全局快捷键',
        message: '请选择一个新的快捷键：',
        detail: '当前快捷键：{shortcut}',
        cancel: '取消',
      },
    },
    autoLaunch: {
      set: {
        failed: {
          title: '开机自启设置失败',
          message: '无法配置开机自启功能，请检查系统权限设置。',
        },
      },
    },
    update: {
      title: '检查更新',
      message: '当前版本：{version}',
      ok: '确定',
      cancel: '取消',
      available: {
        title: '发现新版本',
        message: '发现新版本！\n\n当前版本：{current}\n最新版本：{latest}',
        detail: '点击确定将打开浏览器，跳转到下载页面。',
      },
      noUpdate: {
        message: '您正在使用最新版本。',
      },
      error: {
        title: '更新错误',
        message: '检查更新失败。',
      },
    },
  },
  tray: {
    tooltip: '花密',
    show: '显示',
    quit: '退出',
  },
  menu: {
    theme: '主题',
    language: '语言',
    autoLaunch: '开机自启',
    checkUpdate: '检查更新',
    globalShortcut: '全局快捷键',
  },
  theme: {
    light: '浅色',
    dark: '深色',
    auto: '自动',
  },
  language: {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'en-US': 'English',
    'auto': '自动',
  },
  metadata: {
    htmlTitle: '花密',
    htmlDescription: '花密 - 基于记忆密码与区分代号生成密码的应用',
  },
} as const;
