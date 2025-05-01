import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'
import * as process from 'node:process'
import { useLogger, useOutputChannel } from 'reactive-vscode'
import { queryTodayDurationInterval } from './constants'
import { extensionState } from './index'

export interface BaseCliParams {
  '--api-url'?: string
}

export const baseCliParams: BaseCliParams = {
  '--api-url': 'http://127.0.0.1:3000',
}

export const logger = useLogger('CodeBeat', {
  outputChannel: useOutputChannel('codebeat ext'),
  getPrefix: type => `${new Date().toLocaleString()} [${type}] `,
})
export const resourceDir = '.codebeat'
export const binaryFileName = 'codebeatcli-windows-amd64.exe'

// TODO check if not exists
export function getCliLocation() {
  const homeDir = homedir() ?? process.cwd()
  return join(homeDir, resourceDir, binaryFileName)
}

const codebeatCli = getCliLocation()

export function shouldQueryTodayDuration() {
  return Date.now() >= extensionState.lastQueryDurationTime + queryTodayDurationInterval
}

interface CommandResult {
  stdout: string
  stderr: string
  code: number | null
  signal: NodeJS.Signals | null
  duration: number
}

/**
 * @param command
 * @param args command arguments
 * @param options optional config
 * @param options.timeout command running timeout
 * @param options.cwd working directory
 * @param options.env node env
 * @returns Promise<CommandResult>
 * @throws error
 */
export async function runCommand(
  command: string,
  args: string[] = [],
  options: {
    timeout?: number // command exec timeout
    cwd?: string
    env?: NodeJS.ProcessEnv
  } = {},
): Promise<CommandResult> {
  const startTime = Date.now()
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: 'pipe',
  })

  let stdout = ''
  let stderr = ''
  let timeoutId: NodeJS.Timeout | undefined

  child.stdout?.on('data', (data) => {
    stdout += data.toString()
  })

  child.stderr?.on('data', (data) => {
    stderr += data.toString()
  })

  // when timeout, kill child process
  if (options.timeout) {
    timeoutId = setTimeout(() => {
      child.kill('SIGTERM')
      const err = new Error(`Command timed out after ${options.timeout}ms`)
      logger.error(err.message, { command, args })
      throw err
    }, options.timeout)
  }

  try {
    const code = await new Promise<number | null>((resolve, reject) => {
      child.on('error', reject)
      child.on('close', (code) => {
        if (timeoutId)
          clearTimeout(timeoutId)
        resolve(code)
      })
    })

    const duration = Date.now() - startTime
    const result: CommandResult = {
      stdout,
      stderr,
      code,
      signal: child.signalCode,
      duration,
    }

    if (stderr) {
      logger.warn(`Command [${command}] stderr output is ${stderr}`)
    }

    if (code !== 0) {
      logger.error(`Command [${command}] child process exit code is ${code}.`)
    }

    if (stdout) {
      logger.info(`Command [${command}] std output is ${stdout}`)
    }

    return result
  }
  catch (error: unknown) {
    if (timeoutId)
      clearTimeout(timeoutId)

    if (error instanceof Error) {
      logger.error('Command execution failed', {
        error: error.message,
        stack: error.stack,
        command,
        args,
      })
      throw error
    }

    const err = new Error('Unknown error occurred during command execution')
    logger.error(err.message)
    throw err
  }
}

export async function queryTodayDuration() {
  try {
    return await runCommand(codebeatCli, [...Object.entries(baseCliParams).flat(), '--today'])
  }
  catch {
    logger.error('fail to query today duration')
  }
}

export async function sendHeartbeat(args: string[]) {
  try {
    logger.info(`To send heartbeat params is ${args}.`)
    return await runCommand(codebeatCli, args)
  }
  catch {
    logger.error('fail to send heartbeat')
  }
}
