import { useLogger } from 'reactive-vscode'

export const logger = useLogger('CodeBeat')

/**
 * Format milliseconds to time string
 * @param ms - milliseconds
 * @returns formatted string:
 *   - "0 min" if less than 1 minute
 *   - "x min(s)" if less than 1 hour
 *   - "x hrs y mins" if 1 hour or more
 */
export function formatMilliseconds(ms: number): string {
  if (ms < 0)
    return '0 min'

  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)

  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`
  }
  return `${minutes} min${minutes !== 1 ? 's' : ''}`
}

type onEventTrriger = Map<any, any>
