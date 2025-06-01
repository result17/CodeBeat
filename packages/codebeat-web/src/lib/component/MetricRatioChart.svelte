<script lang="ts" generics="T extends HeartbeatMetrics">
  import { MetricPiePainter } from "codebeat-ext-webview";
  import type { HeartbeatMetrics } from "codebeat-server";
  import { onMount } from "svelte";
  import { client } from "../trpc";
  import { getStartOfTodayDay, getEndOfTodayDay } from "codebeat-server";
  import type { ScaleOrdinal } from 'd3'

  let chartContainer: HTMLElement;
  let colorScale: ScaleOrdinal<string, string, never>;
  let metric: T;

  onMount(async () => {
    const data = await client.metricRatio.getMetricRatio.query({
      metric,
      start: getStartOfTodayDay().getTime(),
      end: getEndOfTodayDay().getTime(),
    });

    if (chartContainer && metric) {
      const chart = new MetricPiePainter(chartContainer, data, 20);
      chart.setColor("var(--color-neutral-300)");
      colorScale = chart.getColorScale();
      chart.draw();
    }
  });

  // Export the metric for use in other components or scripts
  export { metric };
</script>

<div bind:this={chartContainer}></div>
