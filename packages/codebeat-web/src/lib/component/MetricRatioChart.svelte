<script lang="ts" generics="T extends HeartbeatMetrics">
  import { MetricPiePainter } from "codebeat-ext-webview";
  import type { HeartbeatMetrics } from "codebeat-server";
  import { onMount } from "svelte";
  import { client } from "../trpc";
  import { getDayPreviousToToday, getEndOfTodayDay } from "codebeat-server";
  import type { ScaleOrdinal } from "d3";

  let chartContainer: HTMLElement;
  let colorScale: ScaleOrdinal<string, string, never>;
  let metric: T;
  let padding = 20;

  let chartData:
    | Awaited<ReturnType<typeof client.metricRatio.getMetricRatio.query>>
    | undefined;
  $: validRatios = chartData
    ? chartData.ratios.filter(({ ratio }) => ratio > 0)
    : [];

  onMount(async () => {
    const data = await client.metricRatio.getMetricRatio.query({
      metric,
      start: getDayPreviousToToday(7).getTime(),
      end: getEndOfTodayDay().getTime(),
    });
    chartData = data;

    if (chartContainer && metric) {
      const chart = new MetricPiePainter(chartContainer, data, padding);
      chart.setColor("var(--color-neutral-300)");
      colorScale = chart.getColorScale();
      chart.draw();
    }
  });

  // Export the metric for use in other components or scripts
  export { metric };
</script>

<div class="flex flex-row">
  <div class="w-1/2" bind:this={chartContainer}></div>
  <div class="flex flex-col w-1/2" style={`padding: ${padding}px`}>
    {#each validRatios as { value, ratio, durationText }}
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
