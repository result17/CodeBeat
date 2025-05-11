import type { Selection } from 'd3'
import { select } from 'd3'

type ContainerSelect = Selection<HTMLElement, unknown, null, undefined>
type SvgSelect = Selection<SVGSVGElement, unknown, null, undefined>

export abstract class Painter {
  protected svg: SvgSelect
  protected container: ContainerSelect
  protected width: number = 0
  protected height: number = 0

  constructor(container: HTMLElement) {
    this.container = select(container)
    this.svg = this.container.append('svg')
  }

  protected abstract drawContext(): void
  public abstract draw(clearPrev: boolean): boolean
  public abstract canDraw(): boolean
  protected clear(): void {
    if (!this.svg)
      return
    this.svg.selectAll('*').remove()
  }

  public setWidth(width: number) {
    if (this.width === width)
      return
    this.width = width
    this.svg.attr('width', this.width)
  }

  public setHeight(height: number) {
    if (this.height === height)
      return
    this.height = height
    this.svg.attr('height', this.height)
  }

  public resize() {
    this.svg.attr('width', this.width).attr('height', this.height)
  }

  public getWidth() {
    return this.width
  }

  public getHeight() {
    return this.height
  }
}

export abstract class AxisPainter extends Painter {
  protected drawAxis() {
    this.drawXAxis()
    this.drawYAxis()
  }

  protected abstract drawXAxis(): void

  protected abstract drawYAxis(): void
}
