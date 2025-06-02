import type { HeartbeatMetrics, MetricDurationData, MetricValueDurationRatio } from 'codebeat-server'
import type { ScaleOrdinal } from 'd3'
import { arc, pie, scaleOrdinal, schemeCategory10 } from 'd3'
import { Painter } from './painter'

function isBasicType(value: unknown): boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint'
}

/**
 * A specialized painter that visualizes metric time ratios as a pie chart
 * using D3.js. It displays the proportion of time spent on each metric value.
 */
export class MetricPiePainter<T extends HeartbeatMetrics> extends Painter {
  // The metric duration data to visualize
  private data: MetricDurationData<T>

  // Color scale for mapping metric values to colors
  private colorScale!: ScaleOrdinal<string, string, never>

  // Padding around the chart
  private readonly padding: number = 0
  constructor(container: HTMLElement, data: MetricDurationData<T>, padding: number) {
    super(container)
    this.data = data
    this.padding = padding
    this.setWidth(container.offsetWidth)
    this.setHeight(container.offsetWidth)
    this.setupScales()
  }

  public setData(data: MetricDurationData<T>): boolean {
    if (this.data === data)
      return false
    this.data = data
    return true
  }

  public canDraw(): boolean {
    return this.container
      && this.data.ratios.length > 0
      && this.width > 0
      && this.height > 0
  }

  /**
   * Sets up the color scale for the chart
   */
  private setupScales(): void {
    this.colorScale = scaleOrdinal<string>()
      .domain(this.data.ratios.map(d => String(d.value)))
      .range(schemeCategory10)
  }

  public getColorScale(): ScaleOrdinal<string, string, never> {
    return this.colorScale
  }

  public getPadding() {
    return this.padding
  }

  /**
   * Draws the pie chart visualization
   */
  private drawPieChart(): void {
    // Calculate chart dimensions with larger radius
    const radius = (this.width - this.padding * 2) / 2
    const centerX = radius + this.padding
    const centerY = this.height / 2

    // Configure pie layout
    const pieLayout = pie<MetricValueDurationRatio<T>>()
      .value(d => d.duration) // Use duration for slice size
      .sort(null) // Maintain original order

    // Configure arc generator
    const arcGenerator = arc<any>()
      .innerRadius(0) // Solid pie (no donut hole)
      .outerRadius(radius)

    // Create chart group
    const chartGroup = this.svg.append('g')
      .attr('class', 'pie-chart')
      .attr('transform', `translate(${centerX}, ${centerY})`)

    // Create pie slices
    const slices = chartGroup.selectAll('path')
      .data(pieLayout(this.data.ratios))
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => this.colorScale(String(d.data.value)))
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5)

    // Add tooltips
    slices.append('title')
      .text(d => `${d.data.value}: ${d.data.durationText} (${(d.data.ratio * 100).toFixed(1)}%)`)

    // Add text labels on pie slices
    const labelArc = arc<any>()
      .outerRadius(radius * 0.8) // Position labels inside outer edge
      .innerRadius(radius * 0.5) // Position labels away from center

    chartGroup.selectAll('text')
      .data(pieLayout(this.data.ratios))
      .enter()
      .append('text')
      .attr('class', 'legend-label')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '0.3em')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text((d) => {
        if (d.data.ratio < 0.1)
          return ''
        const textContent = isBasicType(d.data.value) ? String(d.data.value) : `${(d.data.ratio * 100).toFixed(2)}`
        const textShowContent = textContent.length > 10 ? `${textContent.slice(0, 10)}...` : textContent
        return textShowContent
      })
  }

  /**
   * Main drawing method called by base class
   */
  protected drawContext(): void {
    this.drawPieChart()
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
