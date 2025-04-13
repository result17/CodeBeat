import { execFile } from 'node:child_process'
import process from 'node:process'
import * as dotenv from 'dotenv'
import { computed, defineExtension, useStatusBarItem, watchEffect } from 'reactive-vscode'
import { StatusBarAlignment } from 'vscode'
import { useOnEvent } from './composables'
import { clockIconName, debounceMs } from './constants'
import { getCliLocation } from './utils'

dotenv.config()

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

  const params = useOnEvent()

  const args = computed(() => {
    if (!params || !params.value)
      return []
    const list = []
    for (const entire of Object.entries(params.value)) {
      list.push(...entire)
    }
    if (process.env.IS_LOCAL === 'true') {
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
    timeout = setTimeout(() => {
      console.info(`To send heartbeat params is ${args.value} and the cli location is ${cli}`)
      const proc = execFile(cli, args.value, (error, stdout, stderr) => {
        if (error) {
          console.error('Fail:', error.message)
          return
        }
        if (stderr) {
          console.error('STDERR:', stderr)
          return
        }
        console.log('STDOUT:', stdout)
      })
      proc.on('close', (code, signal) => {
        console.info(`Cli file closed. Exit code is ${code} and sinagl is ${signal}.`)
      })
    }, debounceMs)
  })
})

export { activate, deactivate }
