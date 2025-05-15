import type { HeartbeatMetrics, MetricDurationData, MetricValueDurationRatio } from 'codebeat-server'
import type { ScaleOrdinal } from 'd3'
import { arc, pie, scaleOrdinal, schemeCategory10 } from 'd3'
import { Painter } from './painter'

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
  private readonly padding: number = 40

  // Width reserved for the legend
  private readonly legendWidth: number = 150

  // Height of each legend item
  private readonly legendItemHeight: number = 25

  constructor(container: HTMLElement, data: MetricDurationData<T>) {
    super(container)
    this.data = data
    this.setWidth(container.offsetWidth)
    this.setHeight(Math.min(container.offsetWidth, 400))
  }

  public setData(data: MetricDurationData<T>): boolean {
    if (this.data === data)
      return false
    this.data = data
    return true
  }

  public canDraw(): boolean {
    return this.container
      && this.data.metricRatios.length > 0
      && this.width > 0
      && this.height > 0
  }

  /**
   * Sets up the color scale for the chart
   */
  private setupScales(): void {
    this.colorScale = scaleOrdinal<string>()
      .domain(this.data.metricRatios.map(d => String(d.value)))
      .range(schemeCategory10)
  }

  /**
   * Draws the pie chart visualization
   */
  private drawPieChart(): void {
    // Calculate chart dimensions
    const radius = Math.min(
      this.width - this.legendWidth - this.padding * 2,
      this.height - this.padding * 2,
    ) / 2
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
      .data(pieLayout(this.data.metricRatios))
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => this.colorScale(String(d.data.value)))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)

    // Add tooltips
    slices.append('title')
      .text(d => `${d.data.value}: ${d.data.durationText} (${(d.data.ratio * 100).toFixed(1)}%)`)
  }

  /**
   * Draws the chart legend
   */
  private drawLegend(): void {
    // Create legend group
    const legendGroup = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.width - this.legendWidth + this.padding}, ${this.padding})`)

    // Create legend items
    const legendItems = legendGroup.selectAll('.legend-item')
      .data(this.data.metricRatios)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(0, ${i * this.legendItemHeight})`)

    // Add color swatches
    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => this.colorScale(String(d.value)))

    // Add labels
    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text(d => `${String(d.value)}: ${(d.ratio * 100).toFixed(1)}%`)
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
  }

  /**
   * Main drawing method called by base class
   */
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
