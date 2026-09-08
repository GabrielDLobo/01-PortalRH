/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    // tests/e2e is Playwright's suite (its own runner, own config) --
    // Vitest's default include glob otherwise also picks up *.spec.ts there.
    exclude: ['node_modules/**', 'tests/e2e/**'],
  },
});
