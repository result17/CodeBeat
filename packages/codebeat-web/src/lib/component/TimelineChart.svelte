<script lang="ts">
  import { DayTimeRangePainter } from "codebeat-ext-webview";
  import { onMount } from "svelte";
  import { useChartState } from "../stores/chart";

  let chartContainer: HTMLElement;
  let painter: DayTimeRangePainter;
  const chartId = "Timeline";
  const chartState = useChartState(chartId);

  $: if ($chartState.data) {
    painter.setData($chartState.data.timeline, $chartState.data.projects.size);
    painter.draw();
  }

  onMount(() => {
    painter = new DayTimeRangePainter(chartContainer, [], 0);
    painter.setColor("var(--color-neutral-300)");
  });
</script>

<span>
  <span class="text-neutral-300 text-sm">Today</span>
  <span class="text-primary-500 text-xs"
    >{$chartState.data?.totalInfo.text}</span
  >
</span>
<div bind:this={chartContainer} class="w-full"></div>
