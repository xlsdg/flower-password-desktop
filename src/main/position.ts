import { screen, type BrowserWindow, type Tray } from 'electron';

/**
 * 计算窗口在托盘图标下方的位置
 * @param tray - 托盘实例
 * @param windowBounds - 窗口边界信息
 * @returns 窗口应该显示的坐标 {x, y}
 */
export function calculatePositionBelowTray(
  tray: Tray,
  windowBounds: { width: number; height: number }
): { x: number; y: number } {
  const trayBounds = tray.getBounds();

  // macOS: 托盘在顶部，窗口显示在托盘图标下方居中
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height);

  return { x, y };
}

/**
 * 计算窗口在鼠标右下方的位置
 * @param windowBounds - 窗口边界信息
 * @returns 窗口应该显示的坐标 {x, y}
 */
export function calculatePositionAtCursor(windowBounds: { width: number; height: number }): { x: number; y: number } {
  // 获取鼠标当前位置
  const cursorPoint = screen.getCursorScreenPoint();

  // 获取鼠标所在的显示器
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { x: screenX, y: screenY, width: screenWidth, height: screenHeight } = display.workArea;

  // 计算窗口位置：窗口左上角在鼠标右下方
  let x = cursorPoint.x;
  let y = cursorPoint.y;

  // 确保窗口不会超出屏幕右边界
  if (x + windowBounds.width > screenX + screenWidth) {
    x = screenX + screenWidth - windowBounds.width;
  }

  // 确保窗口不会超出屏幕下边界
  if (y + windowBounds.height > screenY + screenHeight) {
    y = screenY + screenHeight - windowBounds.height;
  }

  // 确保窗口不会超出屏幕左边界
  if (x < screenX) {
    x = screenX;
  }

  // 确保窗口不会超出屏幕上边界
  if (y < screenY) {
    y = screenY;
  }

  return { x, y };
}

/**
 * 将窗口定位到托盘图标下方并显示
 * @param window - 窗口实例
 * @param tray - 托盘实例
 */
export function positionWindowBelowTray(window: BrowserWindow, tray: Tray): void {
  const windowBounds = window.getBounds();
  const position = calculatePositionBelowTray(tray, windowBounds);
  window.setPosition(position.x, position.y, false);
}

/**
 * 将窗口定位到鼠标右下方并显示
 * @param window - 窗口实例
 */
export function positionWindowAtCursor(window: BrowserWindow): void {
  const windowBounds = window.getBounds();
  const position = calculatePositionAtCursor(windowBounds);
  window.setPosition(position.x, position.y, false);
}
