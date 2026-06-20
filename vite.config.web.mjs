import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Standalone Vite configuration for building the app as a pure web
 * (browser) bundle, independent of Electron. The output is a static
 * site (HTML + JS + CSS + assets) that can be deployed to any web
 * server by simply uploading the contents of the `web` folder.
 *
 * The target environment is selected via the VITE_ENV variable
 * (local | pre | pro). It defaults to "pro" so the web build points
 * to the production API.
 *
 * Usage:
 *   npm run build:web
 */
export default defineConfig({
  // Relative base so the built site works when served from any
  // subdirectory of a web server (e.g. https://host/teacher-notebook/).
  base: './',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_ENV': JSON.stringify(process.env.VITE_ENV || 'pro'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'web',
    emptyOutDir: true,
    sourcemap: false,
  },
  preview: {
    port: 4173,
  },
});
