import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  rules: {
    'no-console': 'off',
    "@typescript-eslint/ban-ts-comment": "warn"
  },
  pnpm: true,
})
