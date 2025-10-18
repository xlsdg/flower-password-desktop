// Shared type definitions

/**
 * Electron API interface
 */
export interface ElectronAPI {
  /**
   * Hide window
   */
  hide: () => void;

  /**
   * Quit application
   */
  quit: () => void;

  /**
   * Write text to clipboard
   * @param text - Text to write
   */
  writeText: (text: string) => Promise<void>;

  /**
   * Open external link in default browser
   * @param url - URL to open
   */
  openExternal: (url: string) => Promise<void>;

  /**
   * Listen for domain extracted from clipboard
   * @param callback - Callback function to receive domain
   */
  onKeyFromClipboard: (callback: (value: string) => void) => void;
}

/**
 * IPC channel names
 */
export const IPC_CHANNELS = {
  HIDE: 'hide',
  QUIT: 'quit',
  CLIPBOARD_WRITE_TEXT: 'clipboard:writeText',
  SHELL_OPEN_EXTERNAL: 'shell:openExternal',
  KEY_FROM_CLIPBOARD: 'key-from-clipboard',
} as const;

/**
 * Window configuration
 */
export interface WindowConfig {
  width: number;
  height: number;
  show: boolean;
  frame: boolean;
  resizable: boolean;
  skipTaskbar: boolean;
}

/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Bounds information (position + size)
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Tray bounds (type alias for semantic naming)
 */
export type TrayBounds = Bounds;

/**
 * Window bounds (type alias for semantic naming)
 */
export type WindowBounds = Bounds;

/**
 * URL parsing result
 */
export interface ParsedURL {
  protocol: string;
  hostname: string;
  pathname: string;
}

/**
 * PSL parsing result
 * Re-export ParsedDomain from psl package for convenience
 */
export type { ParsedDomain } from 'psl';
