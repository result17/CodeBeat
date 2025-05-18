<script setup lang="ts">
import type { MetricDurationData, SummaryData, TimeRange } from 'codebeat-server'
import type { IMessage } from './shared'
import { onBeforeMount, onBeforeUnmount, shallowRef } from 'vue'
import DaytimeRange from './components/DaytimeRangeChartView.vue'
import LastUpdatedAt from './components/LastUpdatedAt.vue'
import MetricPieChart from './components/MetricDurationRatioChartView'
import NoData from './components/NoDataView.vue'
import { addMessageListener, postMsgList, removeAllMessageListeners } from './lib'
import { ICommand } from './shared'
import { lastUpdateRef } from './state'

const timelineRef = shallowRef<TimeRange[]>([])
const metricDurationRef = shallowRef<MetricDurationData<'project'>>()

onBeforeMount(() => {
  postMsgList([
    {
      message: ICommand.summary_today_query,
    },
    {
      message: ICommand.metric_duration_project_query,
      data: {
        metricKey: 'project',
      },
    },
  ])

  addMessageListener((event: MessageEvent<IMessage<SummaryData>>) => {
    const posted = event.data
    if (posted.message === ICommand.summary_today_response && posted.data) {
      timelineRef.value = posted.data.timeline
    }
  })

  addMessageListener((event: MessageEvent<IMessage<MetricDurationData<'project'>>>) => {
    const posted = event.data
    if (posted.message === ICommand.metric_duration_project_response && posted.data && posted.data.metric === 'project') {
      // Handle the metric duration response
      metricDurationRef.value = posted.data
    }
  })
})

onBeforeUnmount(removeAllMessageListeners)
</script>

<template>
  <DaytimeRange v-if="timelineRef.length > 0" :data="timelineRef" />
  <NoData v-if="timelineRef.length === 0" />
  <MetricPieChart v-if="metricDurationRef" :data="metricDurationRef" metric-key="project" />
  <div class="pt-10">
    <LastUpdatedAt :update-at="lastUpdateRef" />
  </div>
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

.legend-label {
  fill: var(--vscode-editor-foreground);
}
</style>
