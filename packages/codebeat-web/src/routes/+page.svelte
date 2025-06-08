<script lang="ts">
  import MultDuration from "$lib/component/MultDuration.svelte";
  import DaytimeRangeChart from "$lib/component/DaytimeRangeChart.svelte";
  import MetricRatioChart from "$lib/component/MetricRatioChart.svelte";
  import ChartContainer from "$lib/component/ChartContainer.svelte";
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
  <ChartContainer id="Durations" title="Durations">
    <MultDuration />
  </ChartContainer>
  <ChartContainer id="Timeline" title="Timeline">
    <DaytimeRangeChart />
  </ChartContainer>
  <ChartContainer id="Metric_project" title="Project">
    <MetricRatioChart metric="project" />
  </ChartContainer>
  <ChartContainer id="Metric_language" title="Language">
    <MetricRatioChart metric="language" />
  </ChartContainer>
</div>
