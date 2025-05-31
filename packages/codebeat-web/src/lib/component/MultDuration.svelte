<script lang="ts">
  import DateRanger from "./DateRanger.svelte";
  import { client } from "$lib/trpc";
  import { onMount } from "svelte";
  import { getDayPreviousToToday, getEndOfTodayDay, getStartOfTodayDay } from 'codebeat-server'

  const endOfToday = getEndOfTodayDay().getTime();

  const multDateRanges = [
    { start: getStartOfTodayDay().getTime(), end: endOfToday },
    { start: getDayPreviousToToday(7).getTime(), end: endOfToday },
    { start: getDayPreviousToToday(30).getTime(), end: endOfToday },
  ] satisfies {
    start: number,
    end: number
  }[] ;

  let todayDurationText: string = ""
  let sevenDaysDurationText: string = ""
  let thirtyDaysDurationText: string = ""

  onMount(async () => {
    try {
      const data = await client.duration.getDashboardRangeDurations.query({
        schedule: multDateRanges
      });

      todayDurationText = data[0].text;
      sevenDaysDurationText = data[1].text;
      thirtyDaysDurationText = data[2].text;
    } catch (error) {
      console.error("Error fetching duration:", error);
    }
  });
</script>

<div class="mb-2">
  <DateRanger dayBefore={0} />
  <p class="text-neutral-400 space-y-2">{todayDurationText}</p>
</div>
<div class="my-2">
  <DateRanger dayBefore={7} />
  <p class="text-neutral-400">{sevenDaysDurationText}</p>
</div>
<div class="my-2">
  <DateRanger dayBefore={30} />
  <p class="text-neutral-400">{thirtyDaysDurationText}</p>
</div>
