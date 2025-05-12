import type { HeartbeatMetrics, MetricValueDurationRatio } from 'codebeat-server/src/lib/metric/collector'
import type { ScaleOrdinal } from 'd3'
import { arc, pie, scaleOrdinal, schemeCategory10 } from 'd3'
import { Painter } from './painter'

/**
 * A specialized painter that visualizes metric time ratios as a pie chart
 * using D3.js. It displays the proportion of time spent on each metric value.
 */
export class MetricPiePainter<T extends HeartbeatMetrics> extends Painter {
  private data: MetricValueDurationRatio<T>[]
  private colorScale!: ScaleOrdinal<string, string, never>
  private readonly padding: number = 40
  private readonly legendWidth: number = 150
  private readonly legendItemHeight: number = 25

  constructor(container: HTMLElement, data: MetricValueDurationRatio<T>[]) {
    super(container)
    this.data = data
    this.setWidth(container.offsetWidth)
    this.setHeight(Math.min(container.offsetWidth, 400))
  }

  public setData(data: MetricValueDurationRatio<T>[]) {
    if (this.data === data)
      return false
    this.data = data
    return true
  }

  public canDraw(): boolean {
    return this.container && this.data.length > 0 && this.width > 0 && this.height > 0
  }

  private setupScales(): void {
    this.colorScale = scaleOrdinal<string>()
      .domain(this.data.map(d => String(d.value)))
      .range(schemeCategory10)
  }

  private drawPieChart(): void {
    const radius = Math.min(this.width - this.legendWidth - this.padding * 2, this.height - this.padding * 2) / 2
    const centerX = radius + this.padding
    const centerY = this.height / 2

    const pieLayout = pie<MetricValueDurationRatio<T>>()
      .value(d => d.duration)
      .sort(null)

    const arcGenerator = arc<any>()
      .innerRadius(0)
      .outerRadius(radius)

    const chartGroup = this.svg.append('g')
      .attr('class', 'pie-chart')
      .attr('transform', `translate(${centerX}, ${centerY})`)

    const slices = chartGroup.selectAll('path')
      .data(pieLayout(this.data))
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => this.colorScale(String(d.data.value)))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)

    slices.append('title')
      .text(d => `${d.data.value}: ${d.data.durationText} (${(d.data.ratio * 100).toFixed(1)}%)`)
  }

  private drawLegend(): void {
    const legendGroup = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.width - this.legendWidth + this.padding}, ${this.padding})`)

    const legendItems = legendGroup.selectAll('.legend-item')
      .data(this.data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(0, ${i * this.legendItemHeight})`)

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => this.colorScale(String(d.value)))

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text(d => `${String(d.value)}: ${(d.ratio * 100).toFixed(1)}%`)
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
  }

  protected drawContext(): void {
    this.setupScales()
    this.drawPieChart()
    this.drawLegend()
  }

  public override draw(clearPrev: boolean = true): boolean {
    if (!this.canDraw())
      return false
    try {
      this.resize()
      if (clearPrev)
        this.clear()
      this.drawContext()
      return true
    }
    catch (error) {
      console.error(`draw pie chart error: [${error}]`)
      return false
    }
  }
}
