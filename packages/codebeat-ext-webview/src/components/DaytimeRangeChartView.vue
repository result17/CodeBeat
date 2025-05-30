<script setup lang="ts">
import type { ProjectSchedule } from '../lib'
import type { DaytimeRangeChartViewProps } from '../types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DayTimeRangePainter } from '../lib'
import IxTimeline from './IxTimeline.vue'
import NoDataView from './NoDataView.vue'

const props = defineProps<DaytimeRangeChartViewProps>()

let painter: DayTimeRangePainter

const chartContainer = ref<HTMLElement>()

const validData = computed(() => props.data.filter(({ duration }) => duration > 0))

const uniqueProjectSet = computed(() => {
  return validData.value.reduce<Set<string>>((set, { project }) => {
    if (!set.has(project)) {
      set.add(project)
    }
    return set
  }, new Set())
})

// trans timestamp to Date
const processedData = computed<ProjectSchedule[]>(() => {
  return validData.value.map(({
    project,
    start,
    duration,
  }) => {
    return {
      project,
      start,
      end: start + duration,
      duration,
    }
  })
})

function handleResize() {
  if (chartContainer.value) {
    painter.setWidth(chartContainer.value.offsetWidth)
    painter.draw()
  }
}

watch(processedData, () => {
  painter.setData(processedData.value, uniqueProjectSet.value.size)
  painter.draw()
})

onMounted(() => {
  if (chartContainer.value && processedData.value.length > 0) {
    painter = new DayTimeRangePainter(chartContainer.value, processedData.value, uniqueProjectSet.value.size)
    painter.draw()
    window.addEventListener('resize', handleResize)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="chart-title">
    <IxTimeline /><span>Timeline</span>
  </div>
  <div ref="chartContainer" class="chart-container" />
  <NoDataView v-if="processedData.length === 0" />
</template>
