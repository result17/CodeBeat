import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/shared/index.ts',
  ],
  outDir: 'dist/shared',
  format: ['esm'],
  dts: true,
})
