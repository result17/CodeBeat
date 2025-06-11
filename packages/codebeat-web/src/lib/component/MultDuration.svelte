<script lang="ts">
  import DateRanger from "./DateRanger.svelte";
  import { defaultRanges } from "$lib/stores/duration";
  import { useChartState } from "$lib/stores/chart";
  const chartState = useChartState("Durations");
  $: durations = $chartState.data.map(({ text }) => text)
</script>

{#each defaultRanges as range, i}
  <div class="flex flex-row items-center mb-4">
    <DateRanger class="mr-2" dayBefore={range.days} />
    <p class="text-xs text-primary-500">{durations[i]}</p>
  </div>
{/each}
