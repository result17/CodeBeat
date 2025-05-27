import type { PluginOption } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  const plugins: PluginOption[] = [
    sveltekit(),
  ]

  return {
    plugins,
    optimizeDeps: {
    },
    build: {
      target: 'esnext',
    },
  }
})
