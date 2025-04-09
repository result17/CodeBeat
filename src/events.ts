import { ref, useEvent, watchEffect } from 'reactive-vscode'
import { debug, tasks, window, workspace } from 'vscode'

export const onDidChangeTextEditorSelection = useEvent(window.onDidChangeTextEditorSelection)
export const onDidChangeActiveTextEditor = useEvent(window.onDidChangeActiveTextEditor)

export const onDidSaveTextDocument = useEvent(workspace.onDidSaveTextDocument)

export const onDidStartTask = useEvent(tasks.onDidStartTask)
export const onDidEndTask = useEvent(tasks.onDidEndTask)
export const onDidChangeActiveDebugSession = useEvent(debug.onDidChangeActiveDebugSession)
export const onDidChangeBreakpoints = useEvent(debug.onDidChangeBreakpoints)
export const onDidStartDebugSession = useEvent(debug.onDidStartDebugSession)
export const onDidTerminateDebugSession = useEvent(debug.onDidTerminateDebugSession)

interface OnEventParams {
  eventName: string
  duringMs: number
}

export function useOnEvent(onEvent: (params: OnEventParams) => void, debounceMs: number = 100) {
  const eventName = ref('')
  const duringMs = ref(0)
  const setTimeoutId = ref<NodeJS.Timeout>()
  onDidChangeActiveTextEditor(() => eventName.value = 'onDidChangeActiveTextEditor')
  onDidChangeTextEditorSelection(() => eventName.value = 'onDidChangeTextEditorSelection')
  onDidSaveTextDocument(() => eventName.value = 'onDidSaveTextDocument')

  setInterval(() => duringMs.value += debounceMs, debounceMs)

  watchEffect(() => {
    if (!eventName.value)
      return
    clearTimeout(setTimeoutId.value)
    setTimeoutId.value = setTimeout(() => {
      onEvent({
        eventName: eventName.value,
        duringMs: duringMs.value,
      })
    }, debounceMs)
  })
}
