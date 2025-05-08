import process from 'node:process'
import * as dotenv from 'dotenv'
import { computed, defineExtension, extensionContext, reactive, useStatusBarItem, watchEffect } from 'reactive-vscode'
import { ExtensionMode, StatusBarAlignment } from 'vscode'
import { useChartView, useOnEvent } from './composables'
import { clockIconName, debounceMs } from './constants'
import { logger, queryAndPostTodaySummaryMessage, queryTodayDuration, sendHeartbeat, shouldQueryTodayData } from './utils'

dotenv.config()

interface ExtensionState {
  file: string
  lastHeartbeatSentTime: number
  lastQueryDurationTime: number
}

export const extensionState = reactive<ExtensionState>({
  file: '',
  lastHeartbeatSentTime: 0,
  lastQueryDurationTime: 0,
})

const { activate, deactivate } = defineExtension(() => {
  logger.show()
  let timeout: NodeJS.Timeout | null = null
  // Register webview view provider
  const webview = useChartView()

  const statusBar = useStatusBarItem({
    id: 'com.github.result17',
    alignment: StatusBarAlignment.Left,
    priority: 3,
    text: clockIconName,
  })

  statusBar.show()

  const params = useOnEvent()

  const args = computed(() => {
    if (!params || !params.value)
      return []
    const list = []
    for (const entire of Object.entries(params.value)) {
      list.push(...entire)
    }
    if (process.env.IS_LOCAL === 'true' || (extensionContext.value && extensionContext.value.extensionMode === ExtensionMode.Development)) {
      list.unshift('--local-save', '--dlog')
    }
    return list
  })

  watchEffect(() => {
    if (!args.value.includes('--entity'))
      return
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(async () => {
      // update ext state
      extensionState.file = params.value?.['--entity'] ?? ''
      extensionState.lastHeartbeatSentTime = Date.now()

      const heartbeatResult = await sendHeartbeat(args.value)

      if (heartbeatResult && heartbeatResult.code !== null && heartbeatResult.code === 0) {
        const shouldQueryFlag = shouldQueryTodayData()
        logger.info(`heartbeatResult code is ${heartbeatResult?.code}, should query is ${shouldQueryFlag}`)
        if (shouldQueryFlag) {
          extensionState.lastQueryDurationTime = Date.now()
          const [todayDurationResult] = await Promise.allSettled([queryTodayDuration(), queryAndPostTodaySummaryMessage(webview, shouldQueryFlag)])
          if (todayDurationResult && todayDurationResult.status === 'fulfilled' && todayDurationResult.value && todayDurationResult.value.stdout) {
            // update statusBar text to today duration
            statusBar.text = `${clockIconName} ${todayDurationResult.value.stdout}`
          }
        }
      }
    }, debounceMs)
  })
})

export { activate, deactivate }
