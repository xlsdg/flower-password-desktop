import { screen, type BrowserWindow, type Tray } from 'electron';

/**
 * Calculate window position below tray icon
 * @param tray - Tray instance
 * @param windowBounds - Window bounds information
 * @returns Coordinates where window should be displayed {x, y}
 */
export function calculatePositionBelowTray(
  tray: Tray,
  windowBounds: { width: number; height: number }
): { x: number; y: number } {
  const trayBounds = tray.getBounds();

  // macOS: Tray is at top, window displays below tray icon centered
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height);

  return { x, y };
}

/**
 * Calculate window position at cursor bottom-right
 * @param windowBounds - Window bounds information
 * @returns Coordinates where window should be displayed {x, y}
 */
export function calculatePositionAtCursor(windowBounds: { width: number; height: number }): { x: number; y: number } {
  // Get current cursor position
  const cursorPoint = screen.getCursorScreenPoint();

  // Get the display where cursor is located
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { x: screenX, y: screenY, width: screenWidth, height: screenHeight } = display.workArea;

  // Calculate window position: window top-left at cursor bottom-right
  let x = cursorPoint.x;
  let y = cursorPoint.y;

  // Ensure window doesn't exceed right screen boundary
  if (x + windowBounds.width > screenX + screenWidth) {
    x = screenX + screenWidth - windowBounds.width;
  }

  // Ensure window doesn't exceed bottom screen boundary
  if (y + windowBounds.height > screenY + screenHeight) {
    y = screenY + screenHeight - windowBounds.height;
  }

  // Ensure window doesn't exceed left screen boundary
  if (x < screenX) {
    x = screenX;
  }

  // Ensure window doesn't exceed top screen boundary
  if (y < screenY) {
    y = screenY;
  }

  return { x, y };
}

/**
 * Position window below tray icon and show it
 * @param window - Window instance
 * @param tray - Tray instance
 */
export function positionWindowBelowTray(window: BrowserWindow, tray: Tray): void {
  const windowBounds = window.getBounds();
  const position = calculatePositionBelowTray(tray, windowBounds);
  window.setPosition(position.x, position.y, false);
}

/**
 * Position window at cursor bottom-right and show it
 * @param window - Window instance
 */
export function positionWindowAtCursor(window: BrowserWindow): void {
  const windowBounds = window.getBounds();
  const position = calculatePositionAtCursor(windowBounds);
  window.setPosition(position.x, position.y, false);
}
