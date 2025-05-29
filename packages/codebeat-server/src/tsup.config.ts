import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/shared/index.ts',
  ],
  outDir: 'dist/shared',
  format: ['esm'],
  dts: {
    only: true,
    resolve: true,
  },
  bundle: true,
  clean: true,
  skipNodeModulesBundle: true,
  target: 'es2020',
})
