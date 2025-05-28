import type { PluginOption } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  const plugins: PluginOption[] = [
    sveltekit(),
    tailwindcss(),
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
