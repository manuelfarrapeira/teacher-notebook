const { defineConfig } = require('vite');
const path = require('path');

// https://vitejs.dev/config
module.exports = defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
