import type { SummaryData } from 'codebeat-server'
import { shallowRef } from 'reactive-vscode'

export const todaySummaryData = shallowRef<SummaryData>()
