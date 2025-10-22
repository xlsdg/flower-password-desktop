import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, '.vite/renderer'),
  },
});
