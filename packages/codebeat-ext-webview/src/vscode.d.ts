declare const acquireVsCodeApi: () => {
  postMessage: <T>(message: T) => void
  getState: <T>() => T | undefined
  setState: <T>(newState: T) => T
}

interface Window {
  acquireVsCodeApi: typeof acquireVsCodeApi
}
