import type { RendererBridge } from '../shared/types';

declare global {
  interface Window {
    rendererBridge: RendererBridge;
  }
}
