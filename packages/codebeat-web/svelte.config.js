import { preprocessMeltUI, sequence } from '@melt-ui/pp'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: sequence([
    vitePreprocess(),
    preprocessMeltUI(),
  ]),
  kit: {
    paths: {
      relative: false,
    },
  },
}

export default config
