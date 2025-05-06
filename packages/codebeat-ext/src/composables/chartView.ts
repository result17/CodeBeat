import { computed, createSingletonComposable, ref, useAbsolutePath, useFileUri, useWebviewView, watch, watchEffect } from 'reactive-vscode'
import { Uri } from 'vscode'
import { useSelf } from './self'
import { logger } from '../utils'

// Constants for webview resources
const WEBVIEW_RESOURCES_DIR = 'dist/webview'
const CSS_FILE_NAME = 'codebeat-webview.css'
const JS_FILE_NAME = 'codebeat-webview.js'

export const useChartView = createSingletonComposable(async () => {
  const absDist = useAbsolutePath('dist')
  const cspSourceRef = ref('')
  const DistFileURI = useFileUri(absDist)
  const styleUriRef = ref<Uri>()
  const scriptUriRef = ref<Uri>()
  const extension = useSelf()
  const extensionUri = extension.value?.extensionUri

  const html = computed(() => `<!DOCTYPE html>
                      <html>
                        <head>
                        ${cspSourceRef.value ? `<meta http-equiv="Content-Security-Policy" 
                            content="default-src 'none';
                                    img-src ${cspSourceRef.value} https:;
                                    script-src ${cspSourceRef.value} 'unsafe-inline';
                                    style-src ${cspSourceRef.value} 'unsafe-inline';">
                          <link rel="stylesheet" href="${styleUriRef.value}">` : ''}
              
                        </head>
                        <body>
                          <div id="app"></div>
                           ${cspSourceRef.value ? `<script src="${scriptUriRef.value}"></script>` : ''}
                        </body>
                      </html>`)
  const webview = useWebviewView('codebeat-chart-webview', html.value, {
    webviewOptions: {
      enableScripts: true,
      localResourceRoots: [DistFileURI.value],
    },
  })

  watchEffect(() => {
    if (!webview.view.value) return
    
    cspSourceRef.value = webview.view.value.webview.cspSource ?? ''
    
    if (extensionUri) {
      try {
        const { webview: webviewPanel } = webview.view.value
        const resourceBaseUri = Uri.joinPath(extensionUri, WEBVIEW_RESOURCES_DIR)
        
        styleUriRef.value = webviewPanel.asWebviewUri(
          Uri.joinPath(resourceBaseUri, CSS_FILE_NAME)
        )
        
        scriptUriRef.value = webviewPanel.asWebviewUri(
          Uri.joinPath(resourceBaseUri, JS_FILE_NAME)
        )
        
        logger.info('Webview resource URIs initialized', {
          styleUri: styleUriRef.value,
          scriptUri: scriptUriRef.value
        })
      } catch (error) {
        logger.error('Failed to initialize webview resources', error)
      }
    }
  })

  watch([html], () => {
    logger.info(html.value)
    webview.forceRefresh()
    console.log(html.value)
  })
  return webview
})
