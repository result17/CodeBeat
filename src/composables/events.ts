import type { EventArgs } from '../heartbeatParams'
import { computed, ref, useEvent } from 'reactive-vscode'
import { debug, tasks, window, workspace } from 'vscode'
import { collectHeartbeatArgs } from '../heartbeatParams'

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
  const heartbeatParams = ref<EventArgs | null>(null)
  // const setTimeoutId = ref<NodeJS.Timeout>()

  onDidChangeActiveTextEditor(() => {
    eventName.value = 'onDidChangeActiveTextEditor'
    heartbeatParams.value = collectHeartbeatArgs()
  })

  onDidChangeTextEditorSelection(() => {
    eventName.value = 'onDidChangeTextEditorSelection'
    heartbeatParams.value = collectHeartbeatArgs()
  })

  onDidSaveTextDocument(() => {
    eventName.value = 'onDidSaveTextDocument'
    heartbeatParams.value = collectHeartbeatArgs()
  })

  return computed(() => ({
    eventName,
    params: heartbeatParams,
  }))
}
