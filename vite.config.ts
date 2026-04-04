import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [vanillaExtractPlugin(), react()],
  test: {
    name: 'raster',
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      exclude: ['**/*.css.ts', '**/index.ts'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 75,
        lines: 80,
      },
    },
  },
});
