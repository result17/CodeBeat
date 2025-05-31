<script setup lang="ts" generic="T extends HeartbeatMetrics">
import type { HeartbeatMetrics } from 'codebeat-server'
import type { ScaleOrdinal } from 'd3'
import type { MetricPieChartViewProps } from '../types'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { MetricPiePainter } from '../lib'
import NoDataView from './NoDataView.vue'

const props = defineProps<MetricPieChartViewProps<T>>()

const colorScale = shallowRef<ScaleOrdinal<string, string, never>>()

const validRatios = computed(() => props.data.ratios.filter(({ duration }) => duration > 0))

const pieChartContainer = ref<HTMLElement>()
const padding = ref(20)

let painter: MetricPiePainter<T>

function handleResize() {
  if (pieChartContainer.value) {
    const offsetWidth = pieChartContainer.value.offsetWidth
    painter.setWidth(offsetWidth)
    painter.setHeight(offsetWidth)
    painter.draw()
  }
}

watch(props.data, () => {
  console.log('data changed:', props.data)
  painter.setData({
    ...props.data,
    ratios: validRatios.value,
  })
  painter.draw()
  colorScale.value = painter.getColorScale()
})

onMounted(() => {
  if (pieChartContainer.value && validRatios.value.length > 0) {
    painter = new MetricPiePainter(pieChartContainer.value, {
      ...props.data,
      ratios: validRatios.value,
    }, padding.value)
    painter.draw()
    window.addEventListener('resize', handleResize)
    colorScale.value = painter.getColorScale()
  }
})
</script>

<template>
  <div v-show="validRatios.length > 0" class="chart-container flex flex-row">
    <div ref="pieChartContainer" class="half" />
    <div class="flex flex-col half" :style="{ padding: `${padding}px` }">
      <div v-for="({ value, ratio, durationText }, index) of validRatios" :key="index" class="legend-item">
        <div class="color-box" :style="{ backgroundColor: colorScale ? colorScale(String(value)) : 'white' }" />
        <span class="legend-label">{{ value }}</span>
        <span class="legend-value">- {{ durationText }}{{ ratio ? ` (${(ratio * 100).toFixed(1)}%)` : '' }}</span>
      </div>
    </div>
  </div>
  <NoDataView v-if="validRatios.length === 0" />
</template>

<style scoped>
.flex {
  display: flex;
}

.flex-row {
  flex-direction: row;
  align-items: center;
}

.flex-col {
  flex-direction: column;
}

.half {
  width: 50%;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-items: center;
  margin-bottom: 5px;
}

.color-box {
  width: 10px;
  height: 10px;
  margin-right: 5px;
}

.legend-label {
  font-size: 10px;
  font-weight: bold;
   color: var(--vscode-editor-foreground);
}

.legend-value {
  font-size: 10px;
  color: var(--vscode-editor-foreground);
}

.legend-item:hover {
  cursor: pointer;
  text-decoration: underline;
}
</style>
