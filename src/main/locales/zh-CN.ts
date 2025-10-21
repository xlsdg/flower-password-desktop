/**
 * Simplified Chinese translations for main process
 */
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
      registerFailed: '快捷键注册失败',
      registerFailedMessage: '无法注册全局快捷键（CmdOrCtrl+Alt+S）。该快捷键可能已被其他应用占用。',
    },
    autoLaunch: {
      setFailed: '开机自启设置失败',
      setFailedMessage: '无法配置开机自启功能，请检查系统权限设置。',
    },
  },
  tray: {
    tooltip: '花密',
    show: '显示',
    quit: '退出',
    settings: '设置',
  },
  menu: {
    theme: '主题',
    language: '语言',
    autoLaunch: '开机自启',
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
