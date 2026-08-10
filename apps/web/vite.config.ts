import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@neonatal/clinical-domain': fileURLToPath(
        new URL(
          '../../packages/clinical-domain/src/index.ts',
          import.meta.url,
        ),
      ),
    },
  },

  server: {
    port: 5173,
  },

  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
  },
});