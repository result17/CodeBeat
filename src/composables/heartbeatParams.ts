import type { ComputedRef } from 'reactive-vscode'
import { computed, useActiveTextEditor, useTextEditorSelection, useWorkspaceFolders } from 'reactive-vscode'
import { env, version } from 'vscode'
import { useSelf } from './self'

interface EventArgRecord {
  '--entity': string
  '-plugin': string
  '--lineno'?: number
  '--cursorpos'?: number
  '--lines-in-file'?: number
  '--alternate-project'?: string
  '--project-folder'?: string
  '--config'?: string
  '--log-file'?: string
}

export function useCollectHeartbeatArgs(): ComputedRef<EventArgRecord | null> {
  const editor = useActiveTextEditor()
  const ext = useSelf()
  const selection = useTextEditorSelection(editor).value
  const workspaces = useWorkspaceFolders()

  const entity = editor.value?.document.fileName
  const plugin = computed(() => `${env.appName}_${version}/codebeat_${ext.value?.packageJSON.version ?? '0.0.0'}`)
  const lineno = selection.start.line
  const cursorPos = selection.start.character
  const lines = editor.value?.document.lineCount

  return computed(() => entity
    ? ({
        '--entity': entity,
        '-plugin': plugin.value,
        '--lineno': lineno,
        '--cursorpos': cursorPos,
        '--lines-in-file': lines,
      })
    : null)
}
