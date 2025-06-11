<script lang="ts">
  import type { ScaleOrdinal } from "d3";
  import type { Writable } from "svelte/store";
  import type { MetricChartStore } from "$lib/stores/metric";
  import { MetricPiePainter } from "codebeat-ext-webview";
  import { useChartState } from "$lib/stores/chart";
  import type { MetricDurationData } from "codebeat-server";
  import { shouldUpdateSize } from "$utils";
  import { onDestroy } from "svelte";

  type ValidMetrics = "project" | "language";
  type MetricChartId = `Metric_${ValidMetrics}`;

  let chartContainer: HTMLElement;
  let colorScale: ScaleOrdinal<string, string, never>;
  let chartState: MetricChartStore<ValidMetrics>;
  let painter: MetricPiePainter<ValidMetrics>;
  let store: Writable<MetricDurationData<ValidMetrics> | undefined>;
  let chartId: MetricChartId | undefined;
  let padding: number = 20;
  let resizeObserver: ResizeObserver;

  export let metric: ValidMetrics;

  $: if (metric) {
    chartId = `Metric_${metric}` as const satisfies MetricChartId;
  }

  $: if (chartId) {
    console.log("chartID is", chartId);
    chartState = useChartState(chartId);
  }

  $: if (chartState) {
    console.log(chartState);
    store = chartState.getDataStore();
  }

  function obsChart() {
    resizeObserver = new ResizeObserver(() => {
      if (shouldUpdateSize(chartContainer, painter) && $store) {
        const radius = chartContainer.offsetWidth;
        painter.setWidth(radius);
        painter.setHeight(radius);
        painter.draw();
      }
    });
    resizeObserver.observe(chartContainer);
  }

  function updatePainter(data: MetricDurationData<ValidMetrics>) {
    if (!painter) {
      painter = new MetricPiePainter(chartContainer, data, padding);
      painter.setColor("var(--color-neutral-300)");
      padding = painter.getPadding();
      obsChart();
      const radius = chartContainer.offsetWidth;
      painter.setWidth(radius);
      painter.setHeight(radius);
    } else {
      painter.setData(data);
    }
    colorScale = painter.getColorScale();
    painter.draw();
  }

  $: if ($store) {
    updatePainter($store);
  }

  $: sortedRatios =
    $store?.ratios.sort((a, b) => b.duration - a.duration) || [];

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });
</script>

<div class="flex flex-row">
  <div class="w-1/2" bind:this={chartContainer}></div>
  <div class="flex flex-col justify-center flex-1" style={`padding: ${padding}px`}>
    {#each sortedRatios as { value, ratio, durationText }}
      <div class="flex items-center">
        <div
          class="w-2 h-2 mr-2"
          style={`background-color: ${colorScale?.(String(value)) ?? "var(--color-neutral-300)"}`}
        ></div>
        <span class="text-sm font-bold text-neutral-300">{value}</span>
        <span class="text-sm text-neutral-300"
          >&nbsp;- {durationText}{ratio
            ? ` (${(ratio * 100).toFixed(1)}%)`
            : ""}</span
        >
      </div>
    {/each}
  </div>
</div>
