<script lang="ts">
  import { DayTimeRangePainter } from "codebeat-ext-webview";
  import { onMount } from "svelte";
  import { client } from '../trpc'
  
  let chartContainer: HTMLElement;

  onMount(async () => {
    const data = await client.duration.getTodaySummary.query()
    const projectSet = new Set()

    const timeline:{
      start: number,
      end: number,
      duration: number,
      project: string
    }[] = [] 

    for (const { start, duration, project } of data.timeline) {
      projectSet.add(project)
      timeline.push({
        start,
        end: start + duration,
        duration,
        project
      });
    }

    const painter = new DayTimeRangePainter(chartContainer, timeline, projectSet.size);
    painter.setColor("var(--color-neutral-300)");
    painter.draw()
  })

</script>

<div bind:this={chartContainer}></div>
