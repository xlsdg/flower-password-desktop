/**
 * Global type declarations for the renderer process
 * This file is automatically included by TypeScript, no manual import needed
 */

import type { ElectronAPI } from '../shared/types';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
