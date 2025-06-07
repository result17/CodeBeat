<script lang="ts">
  import { DayTimeRangePainter } from "codebeat-ext-webview";
  import { getContext, onMount } from "svelte";
  import { client } from "../trpc";
  import type { BaseChartContext } from "$types";

  let chartContainer: HTMLElement;
  const contextKey = "Timeline_chart";
  const { isFetching, action } = getContext<BaseChartContext>(contextKey);

  const projectSet = new Set();
  let painter: DayTimeRangePainter;

  const querySummaryAndUpdateChartView = async () => {
    isFetching.update(() => true);
    const data = await client.duration.getTodaySummary.query();
    isFetching.update(() => false);

    const timeline: {
      start: number;
      end: number;
      duration: number;
      project: string;
    }[] = [];

    for (const { start, duration, project } of data.timeline) {
      projectSet.add(project);
      timeline.push({
        start,
        end: start + duration,
        duration,
        project,
      });
    }

    painter.setData(timeline, projectSet.size);
    painter.draw();
  };

  action?.subscribe(async (val) => {
    if (val === "update") {
      isFetching.update(() => true);
      await querySummaryAndUpdateChartView();
      action.update(() => "");
      isFetching.update(() => false);
    }
  });

  onMount(async () => {
    painter = new DayTimeRangePainter(chartContainer, [], 0);
    painter.setColor("var(--color-neutral-300)");
    await querySummaryAndUpdateChartView();
  });
</script>

<div bind:this={chartContainer}></div>
