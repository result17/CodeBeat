import { createSingletonComposable, ref, useWebviewView } from 'reactive-vscode'

export const useChartView = createSingletonComposable(() => {
  const html = ref(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeBeat Chart</title>
</head>
<body>
    <h2>codebeat chart</h2>
    <div id="chart-container"></div>
</body>
</html>`)

  return useWebviewView('codebeat-chart-webview', html.value)
})
