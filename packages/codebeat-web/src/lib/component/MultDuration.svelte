<script lang="ts">
  import type { BaseChartContext } from "$types";
  import DateRanger from "./DateRanger.svelte";
  import { client } from "$lib/trpc";
  import { onMount, getContext } from "svelte";
  import {
    getDayPreviousToToday,
    getEndOfTodayDay,
    getStartOfTodayDay,
  } from "codebeat-server";

  interface DateParams {
    start: number;
    end: number;
  }

  const contextKey = "Durations_chart";
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

  const { isFetching, action } = getContext<BaseChartContext>(contextKey);
  const queryDurations = async (schedule: DateParams[]) => {
    try {
      isFetching.update(() => false);
      const data = await client.duration.getDashboardRangeDurations.query({
        schedule,
      });
      isFetching.update(() => false);
      durationTexts = data.map(({ text }) => text);
    } catch (error) {
      console.error("Error fetching duration:", error);
      durationTexts = ranges.map(() => "");
    }
  };
  
  action?.subscribe(async (val) => {
    if (val === "update") {
      isFetching.update(() => true);
      await queryDurations(getMultDateRanges());
      action.update(() => "");
      isFetching.update(() => false);
    }
  });

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
