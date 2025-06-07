<script lang="ts">
  import GridContainer from "$lib/component/GridContainer.svelte";
  import MultDuration from "$lib/component/MultDuration.svelte";
  import DaytimeRangeChart from "$lib/component/DaytimeRangeChart.svelte";
  import MetricRatioChart from "$lib/component/MetricRatioChart.svelte";
  import ChartContainer from "$lib/component/ChartContainer.svelte";

</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
  <ChartContainer id="Durations">
    <MultDuration />
  </ChartContainer>
  <GridContainer title="Timeline">
    <DaytimeRangeChart />
  </GridContainer>
  <GridContainer title="project">
    <MetricRatioChart metric="project" />
  </GridContainer>
  <GridContainer title="Language">
    <MetricRatioChart metric="language" />
  </GridContainer>
</div>
