import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  // Vite will automatically copy files from publicDir to build output
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
