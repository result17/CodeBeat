<script lang="ts">
  import type { Writable } from "svelte/store";
  import DateRanger from "./DateRanger.svelte";
  import { client } from "$lib/trpc";
  import { onMount, getContext } from "svelte";
  import {
    getDayPreviousToToday,
    getEndOfTodayDay,
    getStartOfTodayDay,
  } from "codebeat-server";

  interface DurationContext {
    action: Writable<string>;
    isFetching: Writable<boolean>;
  }

  interface DateParams {
    start: number;
    end: number;
  }

  const contextKey = "Durations_chart";
  const endOfToday = getEndOfTodayDay().getTime();

  const ranges = [{ days: 0 }, { days: 7 }, { days: 30 }];

  const multDateRanges = ranges.map(({ days }) => ({
    start:
      days === 0
        ? getStartOfTodayDay().getTime()
        : getDayPreviousToToday(days).getTime(),
    end: endOfToday,
  })) satisfies DateParams[];

  let durationTexts: string[] = [];

  const queryDurations = async (schedule: DateParams[]) => {
    try {
      const data = await client.duration.getDashboardRangeDurations.query({
        schedule,
      });
      durationTexts = data.map(({ text }) => text);
    } catch (error) {
      console.error("Error fetching duration:", error);
      durationTexts = ranges.map(() => "");
    }
  };

  const { isFetching, action } = getContext<DurationContext>(contextKey);
  action?.subscribe(async (val) => {
    if (val === "update") {
      isFetching.update(() => true);
      await queryDurations(multDateRanges);
      action.update(() => '')
      isFetching.update(() => false);
    }
  });

  onMount(async () => {
    await queryDurations(multDateRanges);
  });
</script>

{#each ranges as range, i}
  <div class="flex flex-row items-center mb-4">
    <DateRanger class="mr-2" dayBefore={range.days} />
    <p class="text-xs text-primary-500">{durationTexts[i]}</p>
  </div>
{/each}
