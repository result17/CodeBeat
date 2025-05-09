<script setup lang="ts">
import type { SummaryData, TimeRange } from 'codebeat-server'
import type { IMessage } from './shared'
import { onBeforeMount, onBeforeUnmount, ref, shallowRef } from 'vue'
import DaytimeRange from './components/DaytimeRangeChartView.vue'
import LastUpdatedAt from './components/LastUpdatedAt.vue'
import NoData from './components/NoDataView.vue'
import { ICommand } from './shared'
import { addMessageListener, postMsg, removeAllMessageListeners } from './util'

const timelineRef = shallowRef<TimeRange[]>([])
const lastUpdateRef = ref(0)

onBeforeMount(() => {
  postMsg({
    command: ICommand.summary_today_query,
  })
  addMessageListener((event: MessageEvent<IMessage<SummaryData>>) => {
    const message = event.data
    if (message.data) {
      timelineRef.value = message.data.timeline
      lastUpdateRef.value = Date.now()
    }
  })
})

onBeforeUnmount(removeAllMessageListeners)
</script>

<template>
  <DaytimeRange v-if="timelineRef.length > 0" :data="timelineRef" />
  <NoData v-if="timelineRef.length === 0" />
  <LastUpdatedAt :update-at="lastUpdateRef" />
</template>
