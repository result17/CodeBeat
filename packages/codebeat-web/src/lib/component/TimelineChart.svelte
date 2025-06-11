<script lang="ts">
  import { DayTimeRangePainter } from "codebeat-ext-webview";
  import { onMount, onDestroy } from "svelte";
  import { useChartState } from "../stores/chart";

  let chartContainer: HTMLElement;
  let painter: DayTimeRangePainter;
  let resizeObserver: ResizeObserver;
  const chartId = "Timeline";
  const chartState = useChartState(chartId);
  let prevData: typeof $chartState.data = null;

  function updateChart() {
    if (!chartContainer || !painter) return;

    const width = chartContainer.offsetWidth;
    const height = chartContainer.offsetHeight;

    if (width === 0 || height === 0) return;

    painter.setWidth(width);
    painter.setHeight(height);

    if ($chartState.data && $chartState.data !== prevData) {
      prevData = $chartState.data;
      painter.setData(
        $chartState.data.timeline,
        $chartState.data.projects.size,
      );
    }
    painter.draw();
  }

  onMount(() => {
    if (!chartContainer) return;

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === chartContainer) {
          updateChart();
          break;
        }
      }
    });

    resizeObserver.observe(chartContainer);
    painter = new DayTimeRangePainter(chartContainer, [], 0);
    painter.setColor("var(--color-neutral-300)");
    updateChart();
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  $: if ($chartState.data) {
    updateChart();
  }
</script>

<span>
  <span class="text-neutral-300 text-sm">Today</span>
  <span class="text-primary-500 text-xs"
    >{$chartState.data?.totalInfo.text}</span
  >
</span>
<div bind:this={chartContainer} class="w-full h-full"></div>
