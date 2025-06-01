import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsup'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  entry: ['src/shared/index.ts'],
  outDir: 'dist/shared',
  format: ['esm'],
  dts: {
    banner: fs.readFileSync(join(__dirname, '../env.d.ts'), 'utf-8'),
    resolve: true,
    entry: ['src/shared/index.ts'],
  },
  bundle: true,
  clean: true,
  skipNodeModulesBundle: true,
  target: 'es2020',

})
