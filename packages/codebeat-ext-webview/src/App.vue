<script setup lang="ts">
import type { MetricDurationData, SummaryData, TimeRange } from 'codebeat-server'
import type { IMessage } from './shared'
import { onBeforeMount, onBeforeUnmount, shallowRef } from 'vue'
import DaytimeRange from './components/DaytimeRangeChartView.vue'
import LastUpdatedAt from './components/LastUpdatedAt.vue'
import MetricPieChart from './components/MetricDurationRatioChartView'
import NoData from './components/NoDataView.vue'
import { addMessageListener, postMsg, removeAllMessageListeners } from './lib'
import { ICommand } from './shared'
import { lastUpdateRef } from './state'

const timelineRef = shallowRef<TimeRange[]>([])
const metricDurationRef = shallowRef<MetricDurationData<'project'>>()

onBeforeMount(() => {
  postMsg({
    command: ICommand.summary_today_query,
  })
  postMsg({
    command: ICommand.metric_duration_project_query,
  })

  addMessageListener((event: MessageEvent<IMessage<SummaryData>>) => {
    const message = event.data
    if (message.command === ICommand.summary_today_response && message.data) {
      timelineRef.value = message.data.timeline
    }
  })

  addMessageListener((event: MessageEvent<IMessage<MetricDurationData<'project'>>>) => {
    const message = event.data
    if (message.command === ICommand.metric_duration_response && message.data && message.data.metricKey === 'project') {
      // Handle the metric duration response
      metricDurationRef.value = message.data
    }
  })
})

onBeforeUnmount(removeAllMessageListeners)
</script>

<template>
  <DaytimeRange v-if="timelineRef.length > 0" :data="timelineRef" />
  <NoData v-if="timelineRef.length === 0" />
  <MetricPieChart v-if="metricDurationRef" :data="metricDurationRef" metric-key="project" />
  <LastUpdatedAt class="pt-10" :update-at="lastUpdateRef" />
</template>

<style>
.pt-10 {
  padding-top: 10px;
}

.chart-title {
  display: flex;
  gap: 0.125rem;
  padding-block: 10px;
}

.chart-container {
  width: 100%;
  border-radius: 8px;
  background-color: var(--vscode-editor-background);
}
</style>
