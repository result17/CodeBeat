import { computed, useActiveTextEditor, useTextEditorSelection, useWorkspaceFolders } from 'reactive-vscode'
import { env, version } from 'vscode'
import { useSelf } from './composables/self'

export interface EventArgs {
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

const editor = useActiveTextEditor()
const ext = useSelf()
const selection = useTextEditorSelection(editor)
const workspaces = useWorkspaceFolders()

export function collectHeartbeatArgs(): EventArgs | null {
  const entity = editor.value?.document.fileName
  const plugin = computed(() => `${env.appName}_${version}/codebeat_${ext.value?.packageJSON.version ?? '0.0.0'}`)
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

  if (entity) {
    const { line: lineno, character: cursorPos } = selection.value.start
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
}
