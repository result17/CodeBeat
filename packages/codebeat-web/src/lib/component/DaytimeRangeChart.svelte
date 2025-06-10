<script lang="ts">
  import { DayTimeRangePainter } from "codebeat-ext-webview";
  import { onMount } from "svelte";
  import { createTimelineStore } from "../stores/timeline";
  import { useChartState } from "../stores/chart";

  let chartContainer: HTMLElement;
  let painter: DayTimeRangePainter;
  const chartId = "Timeline";
  const chartState = useChartState(chartId);
  const timelineStore = createTimelineStore(chartState)
  const updateChart = async (shouldSetLoading = true) => {
    if (shouldSetLoading) {
      chartState.setLoading(true)
    }

    try {
      const timelineData = await timelineStore.refresh();
      if (painter && timelineData) {
        painter.setData(timelineData.timeline, timelineData.projects.size);
        painter.draw();
      }
    } finally {
      if (shouldSetLoading) {
        chartState.setLoading(false)
      }
    }
  };

  $: if ($chartState.action === "update") {
    updateChart();
    chartState.setAction("none");
  }

  onMount(async () => {
    painter = new DayTimeRangePainter(chartContainer, [], 0);
    painter.setColor("var(--color-neutral-300)");
    await updateChart(false);
  });
</script>

<div>
  <section class="duration-info text-center">
    {#if $chartState.error}
      <span class="error">Error loading data: {$chartState.error.message}</span>
    {:else if $timelineStore.data}
      <span>
        <span class="text-neutral-300 text-sm">Today</span>
        <span class="text-primary-500 text-xs">{$timelineStore.data.totalInfo.text}</span>
      </span>
    {:else if $chartState.loading}
      <span class="text-neutral-400">Loading...</span>
    {:else}
      <span class="text-neutral-400">No data available</span>
    {/if}
  </section>
  <div bind:this={chartContainer} class="chart-container"></div>
</div>

<style>
  .duration-info {
    padding: 8px 0;
    color: var(--color-neutral-400);
  }

  .error {
    color: var(--color-error-500);
  }

  .chart-container {
    width: 100%;
    height: 200px;
  }
</style>
