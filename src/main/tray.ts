import { Tray, Menu, nativeImage, clipboard, dialog, app } from 'electron';
import * as path from 'node:path';
import * as psl from 'psl';
import { parse as parseUrl } from 'urlite';
import { showWindow, hideWindow, sendToRenderer, showWindowAtCursor, getWindow } from './window';
import { positionWindowBelowTray } from './position';
import { IPC_CHANNELS } from '../shared/types';
import type { ParsedURL, ParsedDomain } from '../shared/types';

let tray: Tray | null = null;

/**
 * 创建系统托盘
 * @returns 创建的 Tray 实例
 */
export function createTray(): Tray {
  // 使用 app.getAppPath() 获取应用根目录,确保开发和生产环境路径都正确
  const iconPath = path.join(app.getAppPath(), 'src/renderer/assets/IconTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true); // 设置为模板图标,适配 macOS 深色/浅色模式

  tray = new Tray(icon);
  tray.setToolTip('花密');

  // 点击托盘图标显示/隐藏窗口
  tray.on('click', () => {
    handleTrayClick();
  });

  // 右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      click: (): void => {
        handleShowWindowBelowTray();
      },
    },
    {
      type: 'separator',
    },
    {
      label: '退出',
      click: (): void => {
        void confirmQuit();
      },
    },
  ]);

  tray.on('right-click', () => {
    if (tray) {
      tray.popUpContextMenu(contextMenu);
    }
  });

  return tray;
}

/**
 * 获取托盘实例
 * @returns 托盘实例或 null
 */
export function getTray(): Tray | null {
  return tray;
}

/**
 * 从剪贴板读取URL并提取域名
 * 如果提取成功，将域名发送到渲染进程
 */
function parseClipboardUrl(): void {
  const text = clipboard.readText('clipboard');

  if (text && text.length > 0) {
    try {
      const url = parseUrl(text) as ParsedURL | null;

      if (url && url.hostname && psl.isValid(url.hostname)) {
        const parsed = psl.parse(url.hostname) as ParsedDomain;

        if (parsed && parsed.sld) {
          sendToRenderer(IPC_CHANNELS.KEY_FROM_CLIPBOARD, parsed.sld);
        }
      }
    } catch (error) {
      // 忽略解析错误，不影响窗口显示
      console.error('Failed to parse clipboard URL:', error);
    }
  }
}

/**
 * 处理托盘图标点击
 * 如果窗口已显示则隐藏，否则显示在托盘图标下方
 */
function handleTrayClick(): void {
  // 检查窗口是否已显示
  const win = getWindow();
  if (win && win.isVisible()) {
    hideWindow();
  } else {
    handleShowWindowBelowTray();
  }
}

/**
 * 处理显示窗口在托盘图标下方
 * 读取剪贴板并提取域名，窗口显示在托盘图标下方
 */
export function handleShowWindowBelowTray(): void {
  // 从剪贴板读取URL并提取域名
  parseClipboardUrl();

  // 计算托盘图标位置并显示窗口
  const win = getWindow();
  if (win && tray) {
    positionWindowBelowTray(win, tray);
  }
  showWindow();
}

/**
 * 处理显示窗口在鼠标位置
 * 读取剪贴板并提取域名，窗口显示在鼠标位置的右下方
 */
export function handleShowWindowAtCursor(): void {
  // 从剪贴板读取URL并提取域名
  parseClipboardUrl();

  // 在鼠标位置显示窗口
  showWindowAtCursor();
}

/**
 * 确认退出应用
 */
export async function confirmQuit(): Promise<void> {
  hideWindow();

  const iconPath = path.join(app.getAppPath(), 'src/renderer/assets/Icon.png');

  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: ['确定', '取消'],
    defaultId: 0,
    title: '花密',
    message: '确定退出？',
    icon: iconPath,
    cancelId: 1,
  });

  if (result.response === 0) {
    app.quit();
  }
}
