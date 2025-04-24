import { homedir } from 'node:os'
import { join } from 'node:path'
import * as process from 'node:process'
import { useLogger } from 'reactive-vscode'

export const logger = useLogger('CodeBeat')
export const resourceDir = '.codebeat'
export const binaryFileName = 'codebeatcli-windows-amd64.exe'

// TODO check if not exists
export function getCliLocation() {
  const homeDir = homedir() ?? process.cwd()
  return join(homeDir, resourceDir, binaryFileName)
}
