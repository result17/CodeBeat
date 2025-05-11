<script setup lang="ts">
import type { SummaryData, TimeRange } from 'codebeat-server'
import type { IMessage } from './shared'
import { onBeforeMount, onBeforeUnmount, ref, shallowRef } from 'vue'
import DaytimeRange from './components/DaytimeRangeChartView.vue'
import LastUpdatedAt from './components/LastUpdatedAt.vue'
import NoData from './components/NoDataView.vue'
import { addMessageListener, postMsg, removeAllMessageListeners } from './lib'
import { ICommand } from './shared'

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
  <LastUpdatedAt class="pt-10" :update-at="lastUpdateRef" />
</template>

<style>
.pt-10 {
  padding-top: 10px;
}
</style>
