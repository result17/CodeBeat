<script lang="ts">  import { DayTimeRangePainter } from "codebeat-ext-webview";
  import { onMount, onDestroy } from "svelte";
  import { useChartState } from "../stores/chart";

  let chartContainer: HTMLElement;
  let painter: DayTimeRangePainter;
  let resizeObserver: ResizeObserver;
  const chartId = "Timeline";
  const chartState = useChartState(chartId);
  
  const store = chartState.getDataStore()

  function updateSize() {
    if (!chartContainer || !painter) return false;

    const width = chartContainer.offsetWidth;
    const height = chartContainer.offsetHeight;

    if (width === 0 || height === 0) return false;

    painter.setWidth(width);
    painter.setHeight(height);
    return true;
  }

  function updateData(data: typeof $store) {
    if (!data || !painter) return;
    console.log('draw svg now')
    painter.setData(data.timeline, data.projects.size);
    painter.draw();
  }

  onMount(() => {
    if (!chartContainer) return;

    // init chart
    painter = new DayTimeRangePainter(chartContainer, [], 0);
    painter.setColor("var(--color-neutral-300)");
    
    // listen container size changing
    resizeObserver = new ResizeObserver(() => {
      if (updateSize() && $store) {
        painter.draw();
      }
    });
    resizeObserver.observe(chartContainer);
    
    // init size
    updateSize();
  });
 
  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  $: if ($store) {
    updateData($store);
  }
</script>

<span>
  <span class="text-neutral-300 text-sm">Today</span>
  <span class="text-primary-500 text-xs"
    >{$store?.totalInfo.text}</span
  >
</span>
<div bind:this={chartContainer} class="w-full h-full"></div>
