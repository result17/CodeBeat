import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/shared/index.ts'],
  outDir: 'dist/shared',
  format: ['esm'],
  dts: {
    resolve: true,
    entry: ['src/shared/index.ts'],
  },
  bundle: true,
  clean: true,
  skipNodeModulesBundle: true,
  target: 'es2020',
})
