import path from 'node:path'
import process from 'node:process'
import dotEnv from 'dotenv'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const config = dotEnv.config({
  path: path.resolve(process.cwd(), '.env.local'),
}).parsed

export default defineConfig({
  plugins: [tsconfigPaths()],
  envDir: './',
  test: {
    environment: 'node',
    setupFiles: [],
    coverage: {
      provider: 'v8',
    },
    env: {
      ...config,
    },
  },
})
