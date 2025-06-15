import type { PluginOption } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import devToolsJson from 'vite-plugin-devtools-json'

export default defineConfig(() => {
  const plugins: PluginOption[] = [
    devToolsJson(),
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
