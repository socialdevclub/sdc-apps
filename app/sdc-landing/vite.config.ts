import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import path from 'path';

export default defineConfig({
  envPrefix: 'PUBLIC',
  plugins: [commonjs(), react({ jsxImportSource: '@emotion/react' })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  server: {
    allowedHosts: ['local.socialdev.club'],
  },
});
