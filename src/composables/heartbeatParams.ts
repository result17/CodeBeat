import type { ComputedRef } from 'reactive-vscode'
import type { Uri } from 'vscode'
import { computed, useActiveTextEditor, useTextEditorSelection, useWorkspaceFolders } from 'reactive-vscode'
import { env, version } from 'vscode'
import { useSelf } from './self'

interface EventArgs {
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

export function useCollectHeartbeatArgs(): ComputedRef<EventArgs | null> {
  const editor = useActiveTextEditor()
  const ext = useSelf()
  const selection = useTextEditorSelection(editor).value
  const workspaces = useWorkspaceFolders()

  const entity = editor.value?.document.fileName
  const plugin = computed(() => `${env.appName}_${version}/codebeat_${ext.value?.packageJSON.version ?? '0.0.0'}`)
  const lineno = selection.start.line
  const cursorPos = selection.start.character
  const lines = editor.value?.document.lineCount
  const currentWorkspace = computed(() => {
    if (workspaces.value) {
      const workspace = workspaces.value.find(workspace => workspace.uri === editor.value?.document.uri)
      if (workspace)
        return workspace
      if (!workspace && workspaces.value.length > 0)
        return workspaces.value[0]
    }
    return null
  })

  const alternateProjectName = currentWorkspace.value?.name

  const projectFloder = currentWorkspace.value?.uri.fsPath

  return computed(() => {
    if (entity) {
      const args: EventArgs = {
        '--entity': entity,
        '-plugin': plugin.value,
        '--lineno': lineno,
        '--cursorpos': cursorPos,
        '--lines-in-file': lines,
      }
      if (alternateProjectName)
        args['--alternate-project'] = alternateProjectName
      if (projectFloder)
        args['--project-folder'] = projectFloder
      return args
    }
    return null
  })
}
