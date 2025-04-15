import type { EventArgs } from '../heartbeatParams'
import { ref, useEvent } from 'reactive-vscode'
import { debug, tasks, window, workspace } from 'vscode'
import { collectHeartbeatArgs } from '../heartbeatParams'
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
  const heartbeatParams = ref<EventArgs | null>(null)

  const updateHeartbeatParams = () => {
    try {
      heartbeatParams.value = collectHeartbeatArgs()
    }
    catch (error) {
      logger.warn('Failed to collect heartbeat args:', error)
      heartbeatParams.value = null
    }
  }

  onDidChangeActiveTextEditor(updateHeartbeatParams)

  onDidChangeTextEditorSelection(updateHeartbeatParams)

  onDidSaveTextDocument(updateHeartbeatParams)

  return heartbeatParams
}
