<script lang="ts">
  import DateRanger from "./DateRanger.svelte";
  import { client } from "$lib/trpc";
  import { onMount } from "svelte";
  import {
    getDayPreviousToToday,
    getEndOfTodayDay,
    getStartOfTodayDay,
  } from "codebeat-server";
  import { useChartState } from "../stores/chart";

  interface DateParams {
    start: number;
    end: number;
  }

  const chartId = "Durations";
  const chartState = useChartState(chartId);
  const endOfToday = getEndOfTodayDay().getTime();

  const ranges = [{ days: 0 }, { days: 7 }, { days: 30 }];

  const getMultDateRanges = () =>
    ranges.map(({ days }) => ({
      start:
        days === 0
          ? getStartOfTodayDay().getTime()
          : getDayPreviousToToday(days).getTime(),
      end: endOfToday,
    })) satisfies DateParams[];

  let durationTexts: string[] = [];

  const queryDurations = async (schedule: DateParams[]) => {
    try {
      chartState.setLoading(true);
      const data = await client.duration.getDashboardRangeDurations.query({
        schedule,
      });
      durationTexts = data.map(({ text }) => text);
    } catch (error) {
      console.error("Error fetching duration:", error);
      durationTexts = ranges.map(() => "");
    } finally {
      chartState.setLoading(false);
      chartState.setAction("none");
    }
  }
  
  $: {
    if ($chartState.action === "update" && !$chartState.loading) {
      console.log("MultDuration: Starting update");
      queryDurations(getMultDateRanges());
    }
  }

  onMount(async () => {
    await queryDurations(getMultDateRanges());
  });
</script>

{#each ranges as range, i}
  <div class="flex flex-row items-center mb-4">
    <DateRanger class="mr-2" dayBefore={range.days} />
    <p class="text-xs text-primary-500">{durationTexts[i]}</p>
  </div>
{/each}
