<script setup lang="ts">
import type { TimeRange } from 'codebeat-server'
import { formatMilliseconds } from 'codebeat-server'
import * as d3 from 'd3'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatDayTime, formatHour } from '../util'

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
const width = ref(800)

const margin = { top: 40, right: 30, bottom: 40, left: 130 }

const validData = computed(() => props.data.filter(({ duration }) => duration > 0))

const uniqueProgramSize = computed(() => {
  return validData.value.reduce<Set<string>>((set, { project }) => {
    if (!set.has(project)) {
      set.add(project)
    }
    return set
  }, new Set())
})

const height = computed(() => uniqueProgramSize.value.size * Y_LINE_HEIGHT + margin.top + margin.bottom)

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
const colorScale = d3.scaleOrdinal<string>()
  .domain(processedData.value.map(d => d.project))
  .range(d3.schemeCategory10)

// init
function initChart() {
  if (!chartContainer.value)
    return

  // clear old svg
  d3.select(chartContainer.value).selectAll('*').remove()

  // create svg container
  const svg = d3.select(chartContainer.value)
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

  const xScale = d3.scaleTime()
    .domain(dayRange)
    .range([margin.left, width.value - margin.right])

  const yScale = d3.scaleBand()
    .domain(processedData.value.map(d => d.project))
    .range([margin.top, height.value - margin.bottom])

  // set axis
  const xAxis = d3.axisTop(xScale)
    .ticks(d3.timeHour.every(2))
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

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${margin.top})`)
    .call(xAxis)

  const yAxis = d3.axisLeft(yScale)
    .tickSize(0)
    .tickSizeOuter(0)

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis)

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
    .attr('x1', width.value - margin.right)
    .attr('x2', width.value - margin.right)
    .attr('y1', margin.top)
    .attr('y2', (uniqueProgramSize.value.size) * Y_LINE_HEIGHT + margin.top)
    .attr('stroke', '#666')
    .attr('stroke-width', 1)

  for (let i = 0; i < uniqueProgramSize.value.size; i++) {
    svg.append('line')
      .attr('class', 'y-axis')
      .attr('x1', margin.left)
      .attr('x2', width.value - margin.right)
      .attr('y1', (i + 1) * Y_LINE_HEIGHT + margin.top)
      .attr('y2', (i + 1) * Y_LINE_HEIGHT + margin.top)
      .attr('stroke', '#666')
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
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div ref="chartContainer" class="schedule-chart" />
</template>

<style scoped>
.schedule-chart {
  width: 100%;
  max-width: 1000px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.x-axis path,
.y-axis path,
.x-axis line,
.y-axis line {
  fill: none;
  stroke: #666;
  shape-rendering: crispEdges;
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
