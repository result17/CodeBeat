<script lang="ts" generics="T extends HeartbeatMetrics">
  import type { ScaleOrdinal } from "d3";
  import type { HeartbeatMetrics, MetricDurationData } from "codebeat-server";
  import { MetricPiePainter } from "codebeat-ext-webview";
  import { onMount } from "svelte";
  import { client } from "../trpc";
  import { getDayPreviousToToday, getEndOfTodayDay } from "codebeat-server";
  import { useChartState } from "$lib/stores/chart";

  let chartContainer: HTMLElement;
  let colorScale: ScaleOrdinal<string, string, never>;
  let metric: T;
  let padding = 20;

  let chartData:
    | Awaited<ReturnType<typeof client.metricRatio.getMetricRatio.query>>
    | undefined;

  $: validRatios = chartData
    ? chartData.ratios.sort((a, b) => b.ratio - a.ratio)
    : [];

  $: chartId = `Metric_${metric}`;

  const chartState = useChartState(chartId);

  let painter: MetricPiePainter<T>;

  const getMetricData = async () => {
    try {
      chartState.setLoading(true);
      const data = await client.metricRatio.getMetricRatio.query({
        metric,
        start: getDayPreviousToToday(7).getTime(),
        end: getEndOfTodayDay().getTime(),
      });
      chartData = data;
      return data as MetricDurationData<T>;
    } catch (error) {
      chartState.setError(error as Error);
    } finally {
      chartState.setLoading(false);
    }
  };

  const initPainter = async () => {
    const data = await getMetricData();
    if (data) {
      painter = new MetricPiePainter(chartContainer, data, padding);
      painter.setColor("var(--color-neutral-300)");
      colorScale = painter.getColorScale();
    }
  };

  const updatePainter = async () => {
    const data = await getMetricData();
    if (data) {
      painter.setData(data);
    }
  };

  onMount(async () => {
    await initPainter();
    if (chartContainer && metric) {
      painter.draw();
    }
  });

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
