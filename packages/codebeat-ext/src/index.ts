import { computed, defineExtension, reactive, useStatusBarItem, watchEffect } from 'reactive-vscode'
import { StatusBarAlignment } from 'vscode'
import { useChartView, useOnEvent } from './composables'
import { clockIconName, debounceMs } from './constants'
import { logger, parseAndPostTodayMetricDuration, queryAndPostTodaySummaryMessage, queryTodayDuration, sendHeartbeat, shouldQueryTodayData } from './utils'

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
  const { webview, curQueryMetric } = useChartView()

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
    // just open log file flag
    list.unshift('--local-save', '--dlog')
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
          const list: Promise<any>[] = [
            queryTodayDuration(),
            queryAndPostTodaySummaryMessage(webview, shouldQueryFlag),
          ]
          if (curQueryMetric.value) {
            list.push(parseAndPostTodayMetricDuration(webview, curQueryMetric.value, shouldQueryFlag))
          }
          const [todayDurationResult] = await Promise.allSettled(list)
          if (todayDurationResult?.status === 'fulfilled'
            && todayDurationResult.value
            && 'stdout' in todayDurationResult.value
            && todayDurationResult.value.stdout) {
            // update statusBar text to today duration
            statusBar.text = `${clockIconName} ${todayDurationResult.value.stdout}`
          }
        }
      }
    }, debounceMs)
  })
})

export { activate, deactivate }
