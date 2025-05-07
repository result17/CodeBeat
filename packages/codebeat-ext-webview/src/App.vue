<script setup lang="ts">
import type { IMessage } from './shared'
import { ICommand } from './shared'
import { onBeforeMount, shallowRef } from 'vue'
import DaytimeRange from './components/daytimeRangeChart.vue'
import type { SummaryData, TimeRange } from 'codebeat-server'

const timelineRef = shallowRef<TimeRange[]>([])

const { postMessage } = window.acquireVsCodeApi()

onBeforeMount(() => {
  postMessage<IMessage<undefined>>({
    command: ICommand.summary_today_query,
  })
})

window.addEventListener('message', (event: MessageEvent<IMessage<SummaryData>>) => {
  const message = event.data
  if (message.data) {
    timelineRef.value = message.data.timeline
  }
})
</script>

<template>
  <DaytimeRange v-if="timelineRef.length > 0" :data="timelineRef" />
</template>
