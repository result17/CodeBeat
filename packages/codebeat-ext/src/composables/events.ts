import type { EventParams } from '../heartbeatParams'
import { ref, useEvent } from 'reactive-vscode'
import vscode, { debug, tasks, window, workspace } from 'vscode'
import { collectHeartbeatParams, shouldSendHeartbeat } from '../heartbeatParams'
import { logger } from '../utils'

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
  const heartbeatParams = ref<EventParams | null>(null)

  const updateHeartbeatParams = (isWrite: boolean = false) => {
    try {
      // when heartbeatParams changes, it's effect will send a heartbeat record to cli
      if (shouldSendHeartbeat(isWrite)) {
        const params = collectHeartbeatParams()
        heartbeatParams.value = params
      }
    }
    catch (error) {
      logger.warn('Failed to collect heartbeat args:', error)
      heartbeatParams.value = null
    }
  }

  onDidChangeActiveTextEditor(() => updateHeartbeatParams())

  onDidChangeTextEditorSelection((e) => {
    if (e.kind !== vscode.TextEditorSelectionChangeKind.Command) {
      updateHeartbeatParams()
    }
  })

  onDidSaveTextDocument(() => updateHeartbeatParams(true))

  return heartbeatParams
}
