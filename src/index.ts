import { execFile } from 'node:child_process'
import { computed, defineExtension, useStatusBarItem, watchEffect } from 'reactive-vscode'
import { StatusBarAlignment } from 'vscode'
import { onDidChangeTextEditorSelection, useOnEvent } from './composables'
import { clockIconName, debounceMs } from './constants'
import { getCliLocation, logger } from './utils'

const { activate, deactivate } = defineExtension(() => {
  let timeout: NodeJS.Timeout | null = null
  const cli = getCliLocation()

  const statusBar = useStatusBarItem({
    id: 'com.github.result17',
    alignment: StatusBarAlignment.Left,
    priority: 3,
    text: clockIconName,
  })

  statusBar.show()
  onDidChangeTextEditorSelection(() => {
    logger.info('selected')
  })

  const params = useOnEvent()

  const args = computed(() => {
    debugger
    if (!params || !params.value)
      return []
    const list = []
    for (const entire of Object.entries(params.value)) {
      list.push(...entire)
    }
    return list
  })

  watchEffect(() => {
    console.debug(`The args is ${args.value}`)
  })

  // watchEffect(() => {
  //   if (!args.value.includes('entity'))
  //     return
  //   if (timeout) {
  //     clearTimeout(timeout)
  //   }
  //   timeout = setTimeout(() => {
  //     logger.info(`To send heartbeat params is ${args.value}`)
  //     const proc = execFile(cli, args.value)
  //     proc.on('close', (code, signal) => {
  //       logger.info(`Cli file closed. Exit code is ${code} and sinagl is ${signal}.`)
  //     })
  //   }, debounceMs)
  // })
})

export { activate, deactivate }
