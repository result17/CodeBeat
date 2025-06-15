<script lang="ts">
  import { DayTimeRangePainter } from "codebeat-ext-webview";
  import { onMount, onDestroy } from "svelte";
  import { useChartState } from "../stores/chart";
  import { cn, shouldUpdateSize } from "$utils";
  import LeftIcon from "./icons/left.svelte";
  import RightIcon from "./icons/right.svelte";
  import { writable } from "svelte/store";
  import { getDayPreviousToToday } from "codebeat-server";
  import ChartContainer from "$lib/component/ChartContainer.svelte";

  let chartContainer: HTMLElement;
  let painter: DayTimeRangePainter;
  let resizeObserver: ResizeObserver;
  const chartId = "Timeline";
  const chartState = useChartState(chartId);

  const store = chartState.getDataStore();
  const dayPrevToday = writable(0);

  function updateData(data: typeof $store) {
    if (!data || !painter) return;
    painter.setData(data.timeline, data.projects.size);
    painter.draw();
  }
  $: {
    try {
      chartState.setDayBeforeToday($dayPrevToday);
      chartState.query();
    } catch (error) {
      console.error(error);
    }
  }

  onMount(() => {
    if (!chartContainer) return;

    // init chart
    painter = new DayTimeRangePainter(chartContainer, [], 0);
    painter.setColor("var(--color-neutral-300)");

    // listen container size changing
    resizeObserver = new ResizeObserver(() => {
      if (shouldUpdateSize(chartContainer, painter) && $store) {
        painter.setWidth(chartContainer.offsetWidth);
        painter.setHeight(chartContainer.offsetHeight);
        painter.draw();
      }
    });
    resizeObserver.observe(chartContainer);

    // init size
    painter.setWidth(chartContainer.offsetWidth);
    painter.setHeight(chartContainer.offsetHeight);
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

<ChartContainer id="Timeline" title="Timeline">
  <div class="flex flex-row gap-2 w-full" slot="toolbar">
    <button type="button" onclick={() => dayPrevToday.update((day) => day + 1)}
      ><LeftIcon /></button
    >

    <button
      disabled={$dayPrevToday === 0}
      type="button"
      onclick={() => dayPrevToday.update((day) => day - 1)}
      ><RightIcon class={cn($dayPrevToday === 0 && "invisible")} /></button
    >
  </div>
  <div class="flex flex-col items-center">
    <span class="inline-flex items-center space-x-2">
      <span class="text-neutral-300 text-xs"
        >{$dayPrevToday === 0
          ? "Today"
          : getDayPreviousToToday($dayPrevToday).toDateString()}</span
      >
      <span class="text-primary-500 text-xs">{$store?.totalInfo.text}</span>
    </span>
    <div bind:this={chartContainer} class="w-full h-full"></div>
  </div>
</ChartContainer>
