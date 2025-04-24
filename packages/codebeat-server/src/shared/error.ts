import type { ErrorCode } from '@/lib/errors'

export function statusToCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 500:
      return 'INTERNAL_SERVER_ERROR'
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}

export function codeToStatus(code: ErrorCode) {
  switch (code) {
    case 'BAD_REQUEST':
      return 400
    case 'INTERNAL_SERVER_ERROR':
      return 500
    default:
      return 500
  }
}
