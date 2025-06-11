<script lang="ts">
  import DateRanger from "./DateRanger.svelte";
  import { defaultRanges } from "$lib/stores/duration";
  import { useChartState } from "$lib/stores/chart";

  const chartState = useChartState("Durations");
  const store = chartState.getDataStore()
  
  $: durations = $store?.map(({ text }) => text) || []
</script>

{#each durations as duration, i}
  <div class="flex flex-row items-center mb-4">
    <DateRanger class="mr-2" dayBefore={defaultRanges[i].days} />
    <p class="text-xs text-primary-500">{duration}</p>
  </div>
{/each}
