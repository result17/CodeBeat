// This file is generated by `vscode-ext-gen`. Do not modify manually.
// @see https://github.com/antfu/vscode-ext-gen

// Meta info
export const publisher = "result17"
export const name = "codebeat-ext"
export const version = "0.0.0"
export const displayName = "CodeBeat-ext"
export const description = undefined
export const extensionId = `${publisher}.${name}`

/**
 * Type union of all commands
 */
export type CommandKey = 
  | "codeBeat.toggle"

/**
 * Commands map registed by `result17.codebeat-ext`
 */
export const commands = {
  /**
   * Toggle
   * @value `codeBeat.toggle`
   */
  codeBeatToggle: "codeBeat.toggle",
} satisfies Record<string, CommandKey>

/**
 * Type union of all configs
 */
export type ConfigKey = 
  | "codeBeat.enable"

export interface ConfigKeyTypeMap {
  "codeBeat.enable": boolean,
}

export interface ConfigShorthandMap {
  codeBeatEnable: "codeBeat.enable",
}

export interface ConfigShorthandTypeMap {
  codeBeatEnable: boolean,
}

export interface ConfigItem<T extends keyof ConfigKeyTypeMap> {
  key: T,
  default: ConfigKeyTypeMap[T],
}


/**
 * Configs map registered by `result17.codebeat-ext`
 */
export const configs = {
  /**
   * 
   * @key `codeBeat.enable`
   * @default `true`
   * @type `boolean`
   */
  codeBeatEnable: {
    key: "codeBeat.enable",
    default: true,
  } as ConfigItem<"codeBeat.enable">,
}

export interface ScopedConfigKeyTypeMap {
}

export const scopedConfigs = {
  scope: "codebeat-ext",
  defaults: {
  } satisfies ScopedConfigKeyTypeMap,
}

export interface NestedConfigs {
  "codeBeat": {
    "enable": boolean,
  },
}

export interface NestedScopedConfigs {
}

