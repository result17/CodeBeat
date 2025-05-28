import type { Config } from 'tailwindcss'

function getColorFromVarName(varName: string) {
  return `rgb(var(--${varName}) / <alpha-value>)`
}

function getColorsFromName(varName: string, levels: number[]) {
  if (levels.length === 0) {
    return { [varName]: getColorFromVarName(varName) }
  }
  return Object.fromEntries(levels.map(l => [l, getColorFromVarName(`${varName}-${l}`)]))
}

function getColorsFromNameList(varName: string[], levels: number[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
  return varName.reduce((colors, name) => {
    const colorLevels = getColorsFromName(name, levels)
    return { ...colors, ...colorLevels }
  }, {})
}

export default {
  theme: {
    extend: {
      colors: getColorsFromNameList(['primary', 'neutral', 'primary-dark', 'neutral-dark', 'thunder-primary']),
    },
  },
} satisfies Config
