import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    modulePreload: false, // 👈 disables <link rel="modulepreload">
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js', // 👈 simple JS file names
      },
    },
  },
});
