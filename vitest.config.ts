import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    threads: false,
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/tests/**/*.test.ts']
  },
  plugins: [tsconfigPaths()],
});