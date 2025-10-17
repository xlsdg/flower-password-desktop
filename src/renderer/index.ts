/**
 * 渲染进程主文件
 * 处理用户界面交互和密码生成逻辑
 */

import { fpCode } from 'flowerpassword.js';

/**
 * DOM 元素引用
 */
interface DOMElements {
  btnClose: HTMLElement;
  iptPassword: HTMLInputElement;
  iptKey: HTMLInputElement;
  iptPrefix: HTMLInputElement;
  iptSuffix: HTMLInputElement;
  btnCode: HTMLButtonElement;
  selLength: HTMLSelectElement;
}

/**
 * 获取所有需要的 DOM 元素
 * @returns DOM 元素对象
 * @throws 如果必需的元素不存在则抛出错误
 */
function getDOMElements(): DOMElements {
  const btnClose = document.getElementById('close');
  const iptPassword = document.getElementById('password') as HTMLInputElement;
  const iptKey = document.getElementById('key') as HTMLInputElement;
  const iptPrefix = document.getElementById('prefix') as HTMLInputElement;
  const iptSuffix = document.getElementById('suffix') as HTMLInputElement;
  const btnCode = document.getElementById('code') as HTMLButtonElement;
  const selLength = document.getElementById('length') as HTMLSelectElement;

  if (!btnClose || !iptPassword || !iptKey || !iptPrefix || !iptSuffix || !btnCode || !selLength) {
    throw new Error('Required DOM elements not found');
  }

  return {
    btnClose,
    iptPassword,
    iptKey,
    iptPrefix,
    iptSuffix,
    btnCode,
    selLength,
  };
}

/**
 * 隐藏窗口
 */
function hide(): void {
  window.electronAPI.hide();
}

/**
 * 生成密码
 * @param elements - DOM 元素对象
 * @returns 生成的密码字符串，如果输入无效则返回 false
 */
function showCode(elements: DOMElements): string | false {
  const password = elements.iptPassword.value;
  const key = elements.iptKey.value;
  const prefix = elements.iptPrefix.value;
  const suffix = elements.iptSuffix.value;
  const length = parseInt(elements.selLength.value, 10);

  const defaultText = '生成密码(点击复制)';

  if (password.length < 1 || key.length < 1) {
    elements.btnCode.textContent = defaultText;
    return false;
  }

  const fullKey = prefix + key + suffix;
  const code = fpCode(password, fullKey, length);
  elements.btnCode.textContent = code;

  return code;
}

/**
 * 处理输入变化事件
 * @param elements - DOM 元素对象
 */
function handleInputChange(elements: DOMElements): void {
  showCode(elements);
}

/**
 * 处理回车键按下事件
 * @param event - 键盘事件
 * @param elements - DOM 元素对象
 */
function handleKeyPress(event: KeyboardEvent, elements: DOMElements): void {
  if (event.keyCode === 13) {
    const code = showCode(elements);
    if (code !== false) {
      window.electronAPI
        .writeText(code)
        .then(() => {
          event.preventDefault();
          hide();
        })
        .catch((error: Error) => {
          console.error('Failed to write to clipboard:', error);
        });
    }
  }
}

/**
 * 处理密码按钮点击事件
 * @param elements - DOM 元素对象
 */
function handleCodeButtonClick(elements: DOMElements): void {
  const code = showCode(elements);
  if (code !== false) {
    window.electronAPI
      .writeText(code)
      .then(() => {
        hide();
      })
      .catch((error: Error) => {
        console.error('Failed to write to clipboard:', error);
      });
  }
}

/**
 * 设置外部链接处理
 */
function setupExternalLinks(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('a[href]');

  links.forEach((link) => {
    const url = link.getAttribute('href');
    if (url && url.startsWith('https')) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        window.electronAPI.openExternal(url).catch((error: Error) => {
          console.error('Failed to open external URL:', error);
        });
      });
    }
  });
}

/**
 * 初始化应用
 */
function initialize(): void {
  try {
    const elements = getDOMElements();

    // 监听输入变化，实时生成密码
    elements.iptPassword.addEventListener('input', () => handleInputChange(elements), false);
    elements.iptKey.addEventListener('input', () => handleInputChange(elements), false);
    elements.iptPrefix.addEventListener('input', () => handleInputChange(elements), false);
    elements.iptSuffix.addEventListener('input', () => handleInputChange(elements), false);
    elements.selLength.addEventListener('change', () => handleInputChange(elements), false);

    // 监听回车键
    elements.iptKey.addEventListener('keypress', (event) => handleKeyPress(event, elements), false);

    // 接收从剪贴板提取的域名
    window.electronAPI.onKeyFromClipboard((message: string) => {
      elements.iptKey.value = message;
      showCode(elements);
    });

    // 关闭按钮
    elements.btnClose.addEventListener('click', () => hide(), false);

    // 点击密码按钮复制
    elements.btnCode.addEventListener('click', () => handleCodeButtonClick(elements), false);

    // 处理外部链接
    setupExternalLinks();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

// 当 DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
