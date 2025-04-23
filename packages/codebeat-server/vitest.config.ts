import process from 'node:process'
import dotenv from 'dotenv'
import { defineConfig } from 'vitest/config'

dotenv.config()
dotenv.config({ path: process.env.VITE_ENV || '.local.vars' })

export default defineConfig({
  envDir: './',
  test: {
    environment: 'node',
    setupFiles: [],
    coverage: {
      provider: 'v8',
    },
  },
})
