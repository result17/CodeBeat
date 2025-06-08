<script lang="ts" generics="T extends HeartbeatMetrics">
  import type { ScaleOrdinal } from "d3";
  import type { BaseChartContext } from "$types";
  import type { Unsubscriber } from "svelte/store";
  import type { HeartbeatMetrics, MetricDurationData } from "codebeat-server";
  import { MetricPiePainter } from "codebeat-ext-webview";
  import { getContext, onDestroy, onMount } from "svelte";
  import { client } from "../trpc";
  import { getDayPreviousToToday, getEndOfTodayDay } from "codebeat-server";

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
  let unSub: Unsubscriber;

  $: contextKey = `Metric_${metric}_chart`;
  let isFetching: BaseChartContext['isFetching'];
  
  let painter: MetricPiePainter<T>;

  const getMetricData = async () => {
    isFetching.update(() => false);
    const data = await client.metricRatio.getMetricRatio.query({
      metric,
      start: getDayPreviousToToday(7).getTime(),
      end: getEndOfTodayDay().getTime(),
    });
    isFetching.update(() => false);
    chartData = data;
    return data as MetricDurationData<T>;
  };

  const initPainter = async () => {
    const data = await getMetricData();
    painter = new MetricPiePainter(chartContainer, data, padding);
    painter.setColor("var(--color-neutral-300)");
    colorScale = painter.getColorScale();
  };

  const updatePainter = async () => {
    const data = await getMetricData();
    painter.setData(data);
  };

  onMount(async () => {
    const context = getContext<BaseChartContext>(contextKey);
    isFetching = context.isFetching;
    const { action } = context;
    await initPainter();
    if (chartContainer && metric) {
      painter.draw();
    }
    unSub = action?.subscribe(async (val) => {
      if (val === "update") {
        await getMetricData();
      }
    });
  });

  onDestroy(() => {
    if (unSub && typeof unSub === "function") {
      unSub()
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
