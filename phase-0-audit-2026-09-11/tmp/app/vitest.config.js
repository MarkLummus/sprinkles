import { defineConfig } from 'vitest/config';

// Default environment is 'node': the domain suite must stay provably runnable
// with no DOM present. A future component test opts into a DOM per-file with
// a `@vitest-environment jsdom` docblock, not here.
export default defineConfig({
  test: {
    environment: 'node',
  },
});
