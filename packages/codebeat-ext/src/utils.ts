import type { IMessage } from 'codebeat-ext-webview'
import type { HeartbeatMetrics, MetricDurationData, SummaryData } from 'codebeat-server'
import type { useWebviewView } from 'reactive-vscode'
import type { ZodSchema } from 'zod'
import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'
import * as process from 'node:process'
import { ICommand } from 'codebeat-ext-webview'
import { BaseMetricSchema, SummarySchema } from 'codebeat-server'
import { useLogger, useOutputChannel } from 'reactive-vscode'
import { queryTodayDurationInterval } from './constants'
import { extensionState } from './index'
import { todayMetricData, todaySummaryData } from './state'

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

export function shouldQueryTodayData() {
  return Date.now() >= extensionState.lastQueryDurationTime + queryTodayDurationInterval
}

export interface CommandResult {
  stdout: string
  stderr: string
  code: number | null
  signal: NodeJS.Signals | null
  execTime: number
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

    const execTime = Date.now() - startTime
    const result: CommandResult = {
      stdout,
      stderr,
      code,
      signal: child.signalCode,
      execTime,
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
    return await runCommand(codebeatCli, [...Object.entries(baseCliParams).flat(), '--today-duration', 'true'])
  }
  catch {
    logger.error('fail to query today duration')
  }
}

export async function queryTodayMetricDuration(metric: HeartbeatMetrics) {
  try {
    return await runCommand(codebeatCli, [...Object.entries(baseCliParams).flat(), '--today-metric-duration', metric])
  }
  catch {
    logger.error('fail to query today metric duration')
  }
}

export async function sendHeartbeat(args: string[]) {
  try {
    logger.info(`To send heartbeat params is ${args}.`)
    return await runCommand(codebeatCli, args)
  }
  catch {
    logger.error('Fail to send heartbeat')
  }
}

export async function queryTodaySummary() {
  try {
    return await runCommand(codebeatCli, [...Object.entries(baseCliParams).flat(), '--today-summary', 'true'])
  }
  catch {
    logger.error('Fail to query today summary')
  }
}

export function parseSummary<T>(commandResult: CommandResult | undefined): T {
  return parseCommandResult<T>(commandResult, SummarySchema)
}

export async function queryAndPostTodaySummaryMessage(webview: ReturnType<typeof useWebviewView>, retry: boolean = false) {
  let isPosted = false
  try {
    let summaryData: SummaryData
    if (!retry && todaySummaryData.value) {
      summaryData = todaySummaryData.value
    }
    else {
      const commandResult = await queryTodaySummary()
      summaryData = parseSummary<SummaryData>(commandResult)
      todaySummaryData.value = summaryData
    }
    logger.info(`Prepare to post [${ICommand.summary_today_response}]`)

    const postContent = {
      message: ICommand.summary_today_response,
      data: summaryData,
    } satisfies IMessage<SummaryData>

    isPosted = !!await webview.postMessage(postContent)
    return summaryData
  }
  catch (error) {
    if (error instanceof Error) {
      logger.error('Failed to parse summary data', error)
    }
    if (!isPosted) {
      logger.error(`Failed to post [${ICommand.summary_today_response}]`, error)
    }
  }
}

export function parseCommandResult<T>(commandResult: CommandResult | undefined, schema: ZodSchema): T {
  if (!commandResult) {
    throw new Error('Command result is not defined')
  }
  try {
    const out = commandResult.stdout
    logger.info('command stdout is', out)
    const result = JSON.parse(out)
    schema.safeParse(result)
    if (!result) {
      throw new Error('Command result is invalid')
    }
    return result
  }
  catch (error) {
    logger.error('failed to parse command result', error)
    throw error
  }
}

export async function parseAndPostTodayMetricDuration(webview: ReturnType<typeof useWebviewView>, metric: HeartbeatMetrics, retry: boolean = false) {
  let isPosted = false
  try {
    let result: MetricDurationData<HeartbeatMetrics>
    if (!retry && todayMetricData.value?.[metric]) {
      result = todayMetricData.value[metric]
    }
    else {
      const commandResult = await queryTodayMetricDuration(metric)
      result = parseCommandResult<MetricDurationData<HeartbeatMetrics>>(commandResult, BaseMetricSchema)
      todayMetricData.value[metric] = result
    }

    logger.info(`Prepare to post [${ICommand.metric_duration_project_response}]`)

    const postContent = {
      message: ICommand.metric_duration_project_response,
      data: result,
    } satisfies IMessage<MetricDurationData<HeartbeatMetrics>>

    isPosted = !!await webview.postMessage(postContent)
    return result
  }
  catch (error) {
    if (error instanceof Error) {
      logger.error('Failed to parse metric duration data', error)
    }
    if (!isPosted) {
      logger.error(`Failed to post [${ICommand.metric_duration_project_response}]`, error)
    }
  }
}
