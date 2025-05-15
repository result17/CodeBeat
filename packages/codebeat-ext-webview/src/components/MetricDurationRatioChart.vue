<script setup lang="ts" generic="T extends HeartbeatMetrics">
import type { HeartbeatMetrics } from 'codebeat-server'
import type { MetricPieChartViewProps } from '../types'
import { onMounted, ref } from 'vue'
import { MetricPiePainter } from '../lib'

const props = defineProps<MetricPieChartViewProps<T>>()

const { data } = props

const chartContainer = ref<HTMLElement>()

onMounted(() => {
  console.log('init chart here')
  if (chartContainer.value) {
    const painter = new MetricPiePainter(chartContainer.value, data)
    painter.draw()
  }
})
</script>

<template>
  <div ref="chartContainer" class="chart-container" />
</template>
