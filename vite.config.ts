import { defineConfig } from 'vitest/config';

// El `base` de GitHub Pages y la config de PWA se añaden en prompts posteriores.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
