import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../codebeat-ext/dist/webview',
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    manifest: false,
    rollupOptions: {
      input: {
        main: 'src/main.ts',
      },
      output: {
        assetFileNames: 'codebeat-webview.[ext]',
        entryFileNames: 'codebeat-webview.js',
      },
    },
  },
})
