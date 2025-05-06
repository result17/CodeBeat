import { createSingletonComposable, ref, useAbsolutePath, useFileUri, useWebviewView } from 'reactive-vscode'
import { workspace } from 'vscode'
import { logger } from '../utils'

export const useChartView = createSingletonComposable(async () => {
  const { fs: { readFile } } = workspace
  const absHTMLPath = useAbsolutePath('dist/webview/index.html')
  logger.info(`absPath is : ${absHTMLPath.value}`)
  const HTMLFileURI = useFileUri(absHTMLPath)
  const HTMLContent = (await readFile(HTMLFileURI.value)).toString()
  const html = ref(HTMLContent)
  logger.info(HTMLContent)
  // const path = useFileUri(join(self.value?.extensionPath ?? '', 'dist/webview/index.html')).value.fsPath
  // const html = ref(readFileSync(join(cwd(), 'dist/webview/index.html')).toString('utf-8'))

  return useWebviewView('codebeat-chart-webview', html.value, {
    webviewOptions: {
      enableScripts: true,
    },
  })
})
