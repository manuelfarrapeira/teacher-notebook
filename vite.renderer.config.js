const { defineConfig } = require('vite');
const path = require('path');

// https://vitejs.dev/config
module.exports = defineConfig({
  define: {
    'import.meta.env.VITE_ENV': JSON.stringify(process.env.VITE_ENV || 'pre'),
  },
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
