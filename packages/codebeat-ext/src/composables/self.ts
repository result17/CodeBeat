import type { ComputedRef } from 'reactive-vscode'
import type { Extension } from 'vscode'
import { computed, extensionContext } from 'reactive-vscode'
import { logger } from '../utils'

export function useSelf(): ComputedRef<Extension<any> | undefined> {
  return computed(() => {
    if (!extensionContext.value) {
      logger.warn('Extension context is not available')
      return undefined
    }
    return extensionContext.value.extension
  })
}
