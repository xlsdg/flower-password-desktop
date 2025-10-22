import { screen, type BrowserWindow, type Tray } from 'electron';

import type { Position, Size } from '../shared/types';

export function calculatePositionBelowTray(tray: Tray, windowBounds: Size): Position {
  const { x, y, width, height } = tray.getBounds();

  if (process.platform === 'darwin') {
    return {
      x: Math.round(x + width / 2 - windowBounds.width / 2),
      y: Math.round(y + height),
    };
  }

  return {
    x: Math.round(x + width - windowBounds.width),
    y: Math.round(y - windowBounds.height),
  };
}

export function calculatePositionAtCursor(windowBounds: Size): Position {
  const cursorPoint = screen.getCursorScreenPoint();
  const { workArea } = screen.getDisplayNearestPoint(cursorPoint);
  const { x: screenX, y: screenY, width, height } = workArea;

  let x = cursorPoint.x;
  let y = cursorPoint.y;

  if (x + windowBounds.width > screenX + width) {
    x = screenX + width - windowBounds.width;
  }
  if (y + windowBounds.height > screenY + height) {
    y = screenY + height - windowBounds.height;
  }
  if (x < screenX) {
    x = screenX;
  }
  if (y < screenY) {
    y = screenY;
  }

  return { x, y };
}

export function positionWindowBelowTray(window: BrowserWindow, tray: Tray): void {
  const position = calculatePositionBelowTray(tray, window.getBounds());
  window.setPosition(position.x, position.y, false);
}

export function positionWindowAtCursor(window: BrowserWindow): void {
  const position = calculatePositionAtCursor(window.getBounds());
  window.setPosition(position.x, position.y, false);
}
