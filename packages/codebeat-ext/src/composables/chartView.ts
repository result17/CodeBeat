import type { IMessage } from 'codebeat-ext-webview'
import { ICommand } from 'codebeat-ext-webview'
import { computed, createSingletonComposable, ref, useAbsolutePath, useFileUri, useWebviewView, watch, watchEffect } from 'reactive-vscode'
import { Uri } from 'vscode'
import { logger, queryAndPostTodaySummaryMessage } from '../utils'
import { useSelf } from './self'

// Constants for webview resources
const WEBVIEW_RESOURCES_DIR = 'dist/webview'
const CSS_FILE_NAME = 'codebeat-webview.css'
const JS_FILE_NAME = 'codebeat-webview.js'

export const useChartView = createSingletonComposable(() => {
  const absDist = useAbsolutePath('dist/webview')
  const cspSourceRef = ref('')
  const DistFileURI = useFileUri(absDist)
  const styleUriRef = ref<Uri>()
  const scriptUriRef = ref<Uri>()
  const extension = useSelf()
  const extensionUri = extension.value?.extensionUri
  // Initial loading state
  const isInitialized = ref(false)

  const html = computed(() => `<!DOCTYPE html>
                      <html>
                        <head>
                        ${cspSourceRef.value && isInitialized.value
                          ? `
                          <meta charset="UTF-8">
                          <meta http-equiv="Content-Security-Policy"
                            content="default-src 'none';
                                    img-src ${cspSourceRef.value} https:;
                                    script-src ${cspSourceRef.value} 'unsafe-inline';
                                    style-src ${cspSourceRef.value} 'unsafe-inline';">
                          <base href="${styleUriRef.value?.with({ path: '/' }).toString()}">
                          <link rel="stylesheet" href="${styleUriRef.value}">
                        `
                          : ''}
                        </head>
                        <body>
                          <div id="app">${!isInitialized.value ? 'Loading...' : ''}</div>
                          ${cspSourceRef.value && isInitialized.value
                            ? `
                            <script src="${scriptUriRef.value}"></script>
                          `
                            : ''}
                        </body>
                      </html>`)

  const webview = useWebviewView('codebeat-chart-webview', html, {
    webviewOptions: {
      enableScripts: true,
      localResourceRoots: [DistFileURI.value],
      enableCommandUris: true,
    },
    async onDidReceiveMessage(message: IMessage<undefined>) {
      if (message.command && message.command === ICommand.summary_today_query) {
        await queryAndPostTodaySummaryMessage(webview, true)
      }
    },
    retainContextWhenHidden: true,
  })

  watchEffect(() => {
    if (!webview.view.value)
      return

    cspSourceRef.value = webview.view.value.webview.cspSource ?? ''

    if (extensionUri) {
      try {
        const { webview: webviewPanel } = webview.view.value
        const resourceBaseUri = Uri.joinPath(extensionUri, WEBVIEW_RESOURCES_DIR)

        styleUriRef.value = webviewPanel.asWebviewUri(
          Uri.joinPath(resourceBaseUri, CSS_FILE_NAME),
        )

        scriptUriRef.value = webviewPanel.asWebviewUri(
          Uri.joinPath(resourceBaseUri, JS_FILE_NAME),
        )

        isInitialized.value = true
      }
      catch (error) {
        logger.error('Failed to initialize webview resources', error)
      }
    }
  })

  watch([html], () => {
    // Update webview content and refresh if needed
    if (webview.view.value) {
      try {
        const webviewPanel = webview.view.value.webview
        const currentHtml = html.value

        // Only update if content actually changed
        if (webviewPanel.html !== currentHtml) {
          logger.info('Updating webview content')
          webviewPanel.html = currentHtml

          // Only force refresh if webview is visible
          if (webview.view.value.visible) {
            logger.info('Forcing webview refresh')
            webview.forceRefresh()
          }
        }
      }
      catch (error) {
        logger.error('Failed to update webview content', error)
      }
    }
  })
  return webview
})
