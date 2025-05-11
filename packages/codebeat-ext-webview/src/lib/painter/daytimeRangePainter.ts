import type { ScaleBand, ScaleLinear, ScaleOrdinal } from 'd3'
import { formatMilliseconds } from 'codebeat-server'

import { axisLeft, axisTop, scaleBand, scaleLinear, scaleOrdinal, schemeCategory10, select } from 'd3'
import { formatDayTime, formatHour } from '../../util'
import { AxisPainter } from './painter'

// Constants for chart configuration
const DEFAULT_LINE_HEIGHT = 32
const WIDTH_THRESHOLD = 300
const DAY_TIMESTAMP_RANGE = [0, 86_400_000] // 24 hours in milliseconds

interface ChartMargin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ProjectSchedule {
  project: string
  start: number
  end: number
  duration: number
}

/**
 * A specialized chart painter that visualizes project schedules across a 24-hour timeline
 * using D3.js. It displays project durations as horizontal bars with 2-hour time intervals.
 */
export class DayTimeRangePainter extends AxisPainter {
  private data: ProjectSchedule[]
  private lineHeight: number
  private chartMargin: ChartMargin
  private lines: number
  private xScale!: ScaleLinear<number, number> // Using ScaleLinear for better precision
  private yScale!: ScaleBand<string>
  private colorScale!: ScaleOrdinal<string, string, never>
  private widthThreshold: number

  constructor(container: HTMLElement, data: ProjectSchedule[], lines: number, lineHeight: number = DEFAULT_LINE_HEIGHT, widthThreshold: number = WIDTH_THRESHOLD) {
    super(container)
    this.data = data
    this.lineHeight = lineHeight
    this.lines = lines
    this.widthThreshold = widthThreshold
    this.setWidth(container.offsetWidth)
    this.chartMargin = this.adjustMarginOnWidthChange()
    this.setHeight(this.lineHeight * lines + this.chartMargin.top + this.chartMargin.bottom)
  }

  public override setWidth(width: number): void {
    const prevFlag = this.isNarrowScreen()
    super.setWidth(width)
    const curFlag = this.isNarrowScreen()
    if (prevFlag !== curFlag) {
      this.chartMargin = this.adjustMarginOnWidthChange()
    }
  }

  public setData(data: ProjectSchedule[], lines: number) {
    if (this.data === data && this.lines === lines)
      return false
    this.data = data
    this.lines = lines
    this.setHeight(this.lineHeight * lines + this.chartMargin.top + this.chartMargin.bottom)
    this.setYScale()
  }

  private setYScale() {
    this.yScale = scaleBand()
      .domain(this.data.map(d => d.project))
      .range([this.chartMargin.top, this.height - this.chartMargin.bottom])
  }

  private isNarrowScreen(): boolean {
    return this.width < this.widthThreshold
  }

  public adjustMarginOnWidthChange() {
    if (this.isNarrowScreen()) {
      return ({ top: 40, right: 10, bottom: 20, left: 60 })
    }
    else {
      return ({ top: 40, right: 20, bottom: 20, left: 80 })
    }
  }

  public setChartMargin(chartMargin: ChartMargin) {
    this.chartMargin = chartMargin
  }

  public getChartMargin() {
    return this.chartMargin
  }

  public setLineHeight(lineHeight: number) {
    if (this.lineHeight === lineHeight)
      return
    this.lineHeight = lineHeight
    this.setHeight(this.lineHeight * this.lines + this.chartMargin.top + this.chartMargin.bottom)
  }

  public getLineHeight() {
    return this.lineHeight
  }

  public canDraw(): boolean {
    return this.container && this.data.length > 0 && this.width > 0 && this.height > 0
  }

  private getLocalDayStart(timestamp: number): number {
    const date = new Date(timestamp)
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime()
  }

  private getLocalDayMilliseconds(timestamp: number, localDayStart: number): number {
    return timestamp - localDayStart
  }

  protected drawAxis(): void {
    this.drawXAxis()
    this.drawYAxis()
  }

  protected drawXAxis(): void {
    // Use scaleLinear for direct millisecond handling (better precision)
    this.xScale = scaleLinear()
      .domain(DAY_TIMESTAMP_RANGE)
      .range([this.chartMargin.left, this.width - this.chartMargin.right])

    // Generate tick values for every 2 hours (7,200,000 ms = 2 hours)
    const TWO_HOURS_IN_MS = 7_200_000
    const tickValues = Array.from(
      { length: 13 }, // 13 ticks from 0:00 to 24:00, every 2 hours
      (_, i) => i * TWO_HOURS_IN_MS,
    )

    const xAxis = axisTop(this.xScale)
      .tickValues(tickValues)
      .tickFormat((ms) => {
        // Convert milliseconds to hours and format
        const hours = Math.floor(Number(ms) / 3_600_000)
        return formatHour(hours)
      })
      .tickSizeOuter(0) // Don't show the first and last tick lines
      .tickSizeInner(6) // Length of tick marks

    this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.chartMargin.top})`)
      .call(xAxis as any)

    // Draw horizontal grid lines for each project row
    for (let i = 0; i < this.lines; i++) {
      this.svg.append('line')
        .attr('class', 'x-axis')
        .attr('x1', this.chartMargin.left)
        .attr('x2', this.width - this.chartMargin.right)
        .attr('y1', (i + 1) * this.lineHeight + this.chartMargin.top)
        .attr('y2', (i + 1) * this.lineHeight + this.chartMargin.top)
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 1)
    }
  }

  protected drawYAxis(): void {
    const projectList = this.data.map(d => d.project)
    this.yScale = scaleBand()
      .domain(projectList)
      .range([this.chartMargin.top, this.height - this.chartMargin.bottom])

    this.colorScale = scaleOrdinal<string>()
      .domain(projectList)
      .range(schemeCategory10)

    const yAxis = axisLeft(this.yScale)
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

        const maxWidth = this.chartMargin.left
        // Each font character is approximately 7 pixels wide
        const ellipsis = text.length > maxWidth / 7 ? '...' : ''
        const displayText = text.slice(0, Math.floor(maxWidth / 7)) + ellipsis

        return displayText
      })

    this.svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${this.chartMargin.left}, 0)`)
      .call(yAxis)
      .selectAll('.tick text')
      .append('title')
      .text(d => d as string)

    // Draw a vertical line at the right edge of the chart
    this.svg.append('line')
      .attr('class', 'y-axis')
      .attr('x1', this.width - this.chartMargin.right)
      .attr('x2', this.width - this.chartMargin.right)
      .attr('y1', this.chartMargin.top)
      .attr('y2', this.lines * this.lineHeight + this.chartMargin.top)
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 1)
  }

  protected drawContext(): void {
    let localDayStart: number = 0
    for (const { start, project, end, duration } of this.data) {
      if (!localDayStart) {
        localDayStart = this.getLocalDayStart(start)
      }
      // Calculate local day milliseconds for start and end times
      const startMillis = this.getLocalDayMilliseconds(start, localDayStart)
      const endMillis = this.getLocalDayMilliseconds(end, localDayStart)

      // Draw project time block
      this.svg.append('rect')
        .attr('class', 'time-block')
        .attr('x', this.xScale(startMillis))
        .attr('y', this.yScale(project)! + this.yScale.bandwidth() * 0.1)
        .attr('width', Math.max(0.1, this.xScale(endMillis) - this.xScale(startMillis)))
        .attr('height', this.yScale.bandwidth() * 0.8)
        .attr('fill', this.colorScale(project))
        .append('title')
        .text(`${formatMilliseconds(duration)} from ${formatDayTime(new Date(start))} to ${formatDayTime(new Date(end))}`)
    }
  }

  public override draw(clearPrev: boolean = true): boolean {
    if (!this.canDraw())
      return false
    try {
      this.resize()
      if (clearPrev) {
        this.clear()
      }
      this.drawAxis()
      this.drawContext()
      return true
    }
    catch (error) {
      console.error(`draw chart error: [${error}]`)
      return false
    }
  }
}
