<script lang="ts">
  import DateRanger from "./DateRanger.svelte";
  import { client } from "$lib/trpc";
  import { onMount } from "svelte";
  import { getDayPreviousToToday, getEndOfTodayDay, getStartOfTodayDay } from 'codebeat-server'

  const endOfToday = getEndOfTodayDay().getTime();

  const ranges = [
    { days: 0 },
    { days: 7 }, 
    { days: 30 }
  ];

  const multDateRanges = ranges.map(({ days }) => ({
    start: days === 0 
      ? getStartOfTodayDay().getTime()
      : getDayPreviousToToday(days).getTime(),
    end: endOfToday
  })) satisfies {
    start: number,
    end: number
  }[];

  let durationTexts: string[] = [];

  onMount(async () => {
    try {
      const data = await client.duration.getDashboardRangeDurations.query({
        schedule: multDateRanges
      });
      durationTexts = data.map(item => item.text);
    } catch (error) {
      console.error("Error fetching duration:", error);
      durationTexts = ranges.map(() => "");
    }
  });
</script>

{#each ranges as range, i}
  <div class="flex flex-row items-center mb-2">
    <DateRanger class="mr-2" dayBefore={range.days} />
    <p class="text-neutral-400 mt-2">{durationTexts[i]}</p>
  </div>
{/each}
