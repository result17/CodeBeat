import dotenv from 'dotenv'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

dotenv.config({ path: '.env.local' })

export default defineConfig({
  plugins: [tsconfigPaths()],
  envDir: './',
  test: {
    environment: 'node',
    setupFiles: [],
    coverage: {
      provider: 'v8',
    },
    // 启用process.env支持
    env: {
      NODE_ENV: 'test',
    },
  },
})
