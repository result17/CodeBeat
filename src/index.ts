import { defineExtension, useStatusBarItem } from 'reactive-vscode'
import { StatusBarAlignment } from 'vscode'
import { clockIconName } from './constants'
import { useOnEvent } from './events'
import { formatMilliseconds } from './utils'

const { activate, deactivate } = defineExtension(() => {
  const statusBar = useStatusBarItem({
    id: 'com.github.result17',
    alignment: StatusBarAlignment.Left,
    priority: 3,
    text: clockIconName,
  })

  statusBar.show()

  useOnEvent(({ duringMs }) => {
    statusBar.text = `${clockIconName} ${formatMilliseconds(duringMs)}`
  })
})

export { activate, deactivate }
