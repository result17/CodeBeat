import { defineExtension, useStatusBarItem } from 'reactive-vscode'
import { StatusBarAlignment } from 'vscode'
import { useOnEvent } from './events'

const { activate, deactivate } = defineExtension(() => {
  useOnEvent()
  useStatusBarItem({
    id: 'com.github.result17',
    alignment: StatusBarAlignment.Left,
    priority: 3,

    text: '$(clock)',
  }).show()
})

export { activate, deactivate }
