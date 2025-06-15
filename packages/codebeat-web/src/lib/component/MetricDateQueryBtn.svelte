<script lang="ts">
  import type { MetricChartStore } from "$lib/stores/metric";
  import type { ValidMetrics, MetricChartId } from "$types";
  import type { DateQueryBtn } from "$types";
  import type { MetricDurationData } from "codebeat-server";
  import { useChartState } from "$lib/stores/chart";
  import { cn } from "$utils";
  import { writable, type Writable } from "svelte/store";

  let store: Writable<MetricDurationData<ValidMetrics> | undefined>;
  let chartId: MetricChartId | undefined;

  let chartState: MetricChartStore<ValidMetrics>;

  export let metric: ValidMetrics;

  $: if (metric) {
    chartId = `Metric_${metric}` as const satisfies MetricChartId;
  }

  $: if (chartId) {
    chartState = useChartState(chartId);
  }

  $: if (chartState) {
    store = chartState.getDataStore();
  }

  export let list: DateQueryBtn[] = [
    {
      text: "today",
      startPrevDay: 0,
      endPrevDay: 0,
    },
    {
      text: "7 days",
      startPrevDay: 7,
      endPrevDay: 0,
    },
    {
      text: "30 days",
      startPrevDay: 30,
      endPrevDay: 0,
    },
  ];

  const queryIndex = writable(0);

  $: {
    const queryInfo = list[$queryIndex]
    if (chartState) {
        chartState.setStart(queryInfo.startPrevDay)
        chartState.setEnd(queryInfo.endPrevDay)
        chartState.query()
    }
  }

</script>

<div class="flex flex-row gap-2 w-full">
  {#each list as btn, index}
    <button
      class={cn(
        "min-w-[60px] flex-1 px-2 py-1",
        "text-center text-neutral-300 text-xs",
        "whitespace-nowrap",
        "hover:cursor-pointer hover:bg-neutral-700 hover:text-primary-500",
        "transition-colors duration-200",
        $queryIndex === index && "text-primary-500",
      )}
      title={btn.text}
      type="button"
      onclick={() => queryIndex.set(index)}
    >
      {btn.text}
    </button>
  {/each}
</div>
