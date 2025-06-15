<script lang="ts">
  import ChartContainer from "$lib/component/ChartContainer.svelte";
  import MultDuration from "$lib/component/MultDuration.svelte";
  import TimelineChart from "$lib/component/TimelineChart.svelte";
  import MetricRatioChart from "$lib/component/MetricRatioChart.svelte";
  import MetricDateQueryBtn from "$lib/component/MetricDateQueryBtn.svelte";
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
  <ChartContainer id="Durations" title="Durations">
    <MultDuration />
  </ChartContainer>
  <TimelineChart />
  <ChartContainer id="Metric_project" title="Project">
    <MetricDateQueryBtn metric="project" slot="toolbar" />
    <MetricRatioChart metric="project" />
  </ChartContainer>
  <ChartContainer id="Metric_language" title="Language">
    <MetricDateQueryBtn metric="language" slot="toolbar" />
    <MetricRatioChart metric="language" />
  </ChartContainer>
</div>
