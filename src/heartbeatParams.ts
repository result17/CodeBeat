import { computed, useActiveTextEditor, useTextEditorSelection, useWorkspaceFolders } from 'reactive-vscode'
import { env, version } from 'vscode'
import { useSelf } from './composables/self'

export interface EventArgs {
  '--entity': string
  '-plugin': string
  '--lineno'?: string
  '--cursorpos'?: string
  '--lines-in-file'?: string
  '--alternate-project'?: string
  '--project-folder'?: string
  '--config'?: string
  '--log-file'?: string
}

const editor = useActiveTextEditor()
const ext = useSelf()
const selection = useTextEditorSelection(editor)
const workspaces = useWorkspaceFolders()
const plugin = computed(() => `${env.appName}_${version}/codebeat_${ext.value?.packageJSON.version ?? '0.0.0'}`)

export function collectHeartbeatArgs(): EventArgs | null {
  if (!editor.value?.document) {
    return null
  }
  const { document } = editor.value
  const entity = document.fileName
  const lines = document.lineCount

  const currentWorkspace = workspaces.value?.find(
    workspace => workspace.uri === document.uri,
  ) ?? workspaces.value?.[0] ?? null

  const { line: lineno, character: cursorPos } = selection.value.start

  const alternateProjectName = currentWorkspace?.name
  const projectFolder = currentWorkspace?.uri.fsPath

  if (!entity) {
    return null
  }

  const args: EventArgs = {
    '--entity': entity,
    '-plugin': plugin.value,
    '--lineno': String(lineno),
    '--cursorpos': String(cursorPos),
    '--lines-in-file': String(lines),
  }

  if (alternateProjectName) {
    args['--alternate-project'] = alternateProjectName
  }
  if (projectFolder) {
    args['--project-folder'] = projectFolder
  }

  return args
}
