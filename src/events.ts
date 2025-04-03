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

export function useOnEvent() {
  const eventName = ref('')
  const setTimeoutId = ref<NodeJS.Timeout>()
  onDidChangeActiveTextEditor(() => eventName.value = 'onDidChangeActiveTextEditor')
  onDidChangeTextEditorSelection(() => eventName.value = 'onDidChangeTextEditorSelection')
  onDidSaveTextDocument(() => eventName.value = 'onDidSaveTextDocument')

  watchEffect(() => {
    if (!eventName.value)
      return
    clearTimeout(setTimeoutId.value)
    setTimeoutId.value = setTimeout(() => {
      window.showInformationMessage(`${eventName.value} by setTimeout`)
    }, 100)
  })
}
