<script lang="ts">
  import type { BaseChartContext } from "$types";
  import { DayTimeRangePainter } from "codebeat-ext-webview";
  import { getContext, onMount } from "svelte";
  import { timelineStore } from "../stores/timeline";

  let chartContainer: HTMLElement;
  let painter: DayTimeRangePainter;
  const contextKey = "Timeline_chart";
  const { isFetching, action } = getContext<BaseChartContext>(contextKey);

  const updateChart = async (shouldSetLoading = true) => {
    if (shouldSetLoading) {
      isFetching.update(() => true);
    }

    try {
      const timelineData = await timelineStore.refresh();
      if (painter && timelineData) {
        painter.setData(timelineData.timeline, timelineData.projects.size);
        painter.draw();
      }
    } finally {
      if (shouldSetLoading) {
        isFetching.update(() => false);
      }
    }
  };

  action?.subscribe(async (val) => {
    if (val === "update") {
      await updateChart();
      action.update(() => "");
    }
  });

  onMount(async () => {
    painter = new DayTimeRangePainter(chartContainer, [], 0);
    painter.setColor("var(--color-neutral-300)");
    await updateChart(false);
  });
</script>

{#if $timelineStore}
  <div>
    <section class="duration-info text-center">
      {#if $timelineStore.error}
        <span class="error">Error loading data</span>
      {:else if $timelineStore.data}
        <span>
          <span class="text-neutral-300 text-sm">Today</span>
          <span class="text-primary-500 text-xs"
            >{$timelineStore.data.totalInfo.text}</span
          >
        </span>
      {:else}
        <span class="text-neutral-400">No data available</span>
      {/if}
    </section>
    <div bind:this={chartContainer} class="chart-container"></div>
  </div>
{/if}

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
