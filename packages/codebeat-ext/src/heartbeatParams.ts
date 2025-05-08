import type { BaseCliParams } from './utils'
import { computed, useActiveTextEditor, useTextEditorSelection, useWorkspaceFolders } from 'reactive-vscode'
import { env, version } from 'vscode'
import { useSelf } from './composables/self'
import { heartbeatTimeInterval } from './constants'
import { extensionState } from './index'
import { baseCliParams } from './utils'

export interface EventParams extends BaseCliParams {
  '--entity': string
  '--plugin': string
  '--language': string
  '--lineno'?: string
  '--cursorpos'?: string
  '--lines-in-file'?: string
  '--alternate-project'?: string
  '--project-path'?: string
  '--config'?: string
  '--log-file'?: string
}

const editor = useActiveTextEditor()
const ext = useSelf()
const selection = useTextEditorSelection(editor)
const workspaces = useWorkspaceFolders()
const plugin = computed(() => `${env.appName}_${version}/codebeat_${ext.value?.packageJSON.version ?? '0.0.0'}`)

export function shouldSendHeartbeat(isWrite: boolean): boolean {
  if (!editor.value?.document) {
    return false
  }
  const { document } = editor.value
  const entity = document.fileName
  const now = Date.now()
  const { file, lastHeartbeatSentTime } = extensionState
  return isWrite || now >= lastHeartbeatSentTime + heartbeatTimeInterval || file !== entity
}

export function collectHeartbeatParams(): EventParams | null {
  if (!editor.value?.document) {
    return null
  }
  const { document } = editor.value
  const entity = document.fileName
  const lines = document.lineCount
  const language = document.languageId

  const currentWorkspace = workspaces.value?.find(
    workspace => workspace.uri === document.uri,
  ) ?? workspaces.value?.[0] ?? null

  const params: EventParams = {
    ...baseCliParams,
    '--entity': entity,
    '--plugin': plugin.value,
    '--language': language,
    '--lines-in-file': String(lines),
  }

  if (selection.value) {
    const { line: lineno, character: cursorPos } = selection.value.start
    params['--lineno'] = String(lineno)
    params['--cursorpos'] = String(cursorPos)
  }

  const alternateProjectName = currentWorkspace?.name
  const projectFolder = currentWorkspace?.uri.fsPath

  if (!entity) {
    return null
  }

  if (alternateProjectName) {
    params['--alternate-project'] = alternateProjectName
  }
  if (projectFolder) {
    params['--project-path'] = projectFolder
  }
  return params
}
