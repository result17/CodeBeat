import type { Painter } from 'codebeat-ext-webview'

export function shouldUpdateSize(container: HTMLElement, painter: Painter) {
  if (!container || !painter)
    return false

  const width = container.offsetWidth
  const height = container.offsetHeight

  if (width === 0 || height === 0)
    return false

  return true
}
