import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  define: {
    // Bake VITE_ENV into the main process bundle at build time
    // so the packaged app knows the environment (local/pre/pro)
    'process.env.VITE_ENV': JSON.stringify(process.env.VITE_ENV || 'pre'),
  },
});
