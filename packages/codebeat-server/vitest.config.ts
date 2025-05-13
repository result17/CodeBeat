import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  envDir: './',
  test: {
    environment: 'node',
    setupFiles: [],
    coverage: {
      provider: 'v8',
    },
  },
})
