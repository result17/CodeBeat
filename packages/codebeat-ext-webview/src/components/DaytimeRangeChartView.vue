<script setup lang="ts">
import type { ProjectSchedule } from '../lib'
import type { DaytimeRangeChartViewProps } from '../types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DayTimeRangePainter } from '../lib'
import IxTimeline from './IxTimeline.vue'

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
  const drawResult = painter.draw()
  console.log(`data changed, and draw result is ${drawResult}`)
})

onMounted(() => {
  painter = new DayTimeRangePainter(chartContainer.value as HTMLElement, processedData.value, uniqueProjectSet.value.size)
  if (processedData.value.length > 0) {
    handleResize()
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div>
    <div class="chart-title">
      <IxTimeline /><span>Timeline</span>
    </div>
    <div ref="chartContainer" class="chart-container" />
  </div>
</template>
