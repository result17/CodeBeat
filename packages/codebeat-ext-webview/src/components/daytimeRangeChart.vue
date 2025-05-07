<script setup lang="ts">
import type { TimeRange } from 'codebeat-server'
import { formatMilliseconds } from 'codebeat-server'
import { axisLeft, axisTop, scaleBand, scaleOrdinal, scaleTime, schemeCategory10, select, timeHour } from 'd3'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatDayTime, formatHour } from '../util'
import IxProject from './IxProject.vue'

const props = defineProps<Props>()

// time formatter
function TIME_FORMATTER(date: Date) {
  const hours = date.getHours()
  return formatHour(hours)
}
const Y_LINE_HEIGHT = 32

interface ProjectSchedule {
  project: string
  start: Date
  end: Date
  duration: number
}

interface Props {
  data: TimeRange[]
}

const chartContainer = ref<HTMLElement | null>(null)
const width = ref(0)

const margin = computed(() => {
  if (width.value <= 300) {
    return { top: 40, right: 10, bottom: 40, left: 80 }
  }
  return { top: 40, right: 30, bottom: 40, left: 100 }
})

const validData = computed(() => props.data.filter(({ duration }) => duration > 0))

const uniqueProgramSize = computed(() => {
  return validData.value.reduce<Set<string>>((set, { project }) => {
    if (!set.has(project)) {
      set.add(project)
    }
    return set
  }, new Set())
})

const height = computed(() => uniqueProgramSize.value.size * Y_LINE_HEIGHT + margin.value.top + margin.value.bottom)

// trans timestamp to Date
const processedData = computed<ProjectSchedule[]>(() => {
  return validData.value.map(({
    project,
    start,
    duration,
  }) => {
    const startDate = new Date(start)
    const endDate = new Date(start + duration)
    return {
      project,
      start: startDate,
      end: endDate,
      duration,
    }
  })
})
const colorScale = scaleOrdinal<string>()
  .domain(processedData.value.map(d => d.project))
  .range(schemeCategory10)

// init
function initChart() {
  if (!chartContainer.value)
    return

  // clear old svg
  select(chartContainer.value).selectAll('*').remove()

  // create svg container
  const svg = select(chartContainer.value)
    .append('svg')
    .attr('width', width.value)
    .attr('height', height.value)

  const dayRange = (() => {
    if (processedData.value.length === 0) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return [today, tomorrow]
    }
    const firstDate = processedData.value[0].start
    const dayStart = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    return [dayStart, dayEnd]
  })()

  const xScale = scaleTime()
    .domain(dayRange)
    .range([margin.value.left, width.value - margin.value.right])

  const yScale = scaleBand()
    .domain(processedData.value.map(d => d.project))
    .range([margin.value.top, height.value - margin.value.bottom])

  // set axis
  const xAxis = axisTop(xScale)
    .ticks(timeHour.every(2))
    .tickFormat((d: unknown) => {
      if (!(d instanceof Date))
        return ''
      try {
        return TIME_FORMATTER(d)
      }
      catch {
        return ''
      }
    })
    .tickSizeOuter(0)
    .tickSizeInner(6)

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${margin.value.top})`)
    .call(xAxis)

  const yAxis = axisLeft(yScale)
    .tickSize(0)
    .tickSizeOuter(0)
    .tickSizeInner(6)
    .tickFormat((d: string) => {
      const text = select(document.createElement('div'))
        .text(d)
        .style('font-size', '12px')
        .style('font-family', 'sans-serif')
        .node()
        ?.textContent || d

      const maxWidth = margin.value.left
      // each font is about 7 pixels
      const ellipsis = text.length > maxWidth / 7 ? '...' : ''
      const displayText = text.slice(0, Math.floor(maxWidth / 7)) + ellipsis

      return displayText
    })

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.value.left}, 0)`)
    .call(yAxis)
    .selectAll('.tick text')
    .append('title')
    .text(d => d as string)

  for (const { start, project, end, duration } of processedData.value) {
    svg.append('rect')
      .attr('class', 'time-block')
      .attr('x', xScale(start))
      .attr('y', yScale(project)! + yScale.bandwidth() * 0.1)
      .attr('width', xScale(end) - xScale(start))
      .attr('height', yScale.bandwidth() * 0.8)
      .attr('fill', colorScale(project))
      .append('title')
      .text(`${formatMilliseconds(duration)} from ${formatDayTime(start)} to ${formatDayTime(end)}`)
  }
  svg.append('line')
    .attr('class', 'x-axis')
    .attr('x1', width.value - margin.value.right)
    .attr('x2', width.value - margin.value.right)
    .attr('y1', margin.value.top)
    .attr('y2', (uniqueProgramSize.value.size) * Y_LINE_HEIGHT + margin.value.top)
    .attr('stroke', 'currentColor')
    .attr('stroke-width', 1)

  for (let i = 0; i < uniqueProgramSize.value.size; i++) {
    svg.append('line')
      .attr('class', 'y-axis')
      .attr('x1', margin.value.left)
      .attr('x2', width.value - margin.value.right)
      .attr('y1', (i + 1) * Y_LINE_HEIGHT + margin.value.top)
      .attr('y2', (i + 1) * Y_LINE_HEIGHT + margin.value.top)
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 1)
  }
}

function handleResize() {
  if (chartContainer.value) {
    width.value = chartContainer.value.offsetWidth
  }
  initChart()
}

onMounted(() => {
  handleResize()
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div>
    <div class="schedule-title">
      <IxProject /><span>PROJECTS</span>
    </div>
    <div ref="chartContainer" class="schedule-chart" />
  </div>
</template>

<style scoped>
.schedule-title {
  display: flex;
  gap: 0.125rem;
  padding-block: 10px;
}
.schedule-chart {
  width: 100%;
  max-width: 1000px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.time-block {
  stroke: #fff;
  stroke-width: 1;
  transition: opacity 0.2s;
}

.time-block:hover {
  opacity: 0.8;
}
</style>
