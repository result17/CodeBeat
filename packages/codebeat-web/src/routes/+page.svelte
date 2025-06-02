<script lang="ts">
  import GridContainer from "$lib/component/GridContainer.svelte";
  import MultDuration from "$lib/component/MultDuration.svelte";
  import DaytimeRangeChart from "$lib/component/DaytimeRangeChart.svelte";
  import MetricRatioChart from "$lib/component/MetricRatioChart.svelte";
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
  <GridContainer>
    <MultDuration />
  </GridContainer>
  <GridContainer>
    <h2 class="text-lg font-bold text-neutral-100">Today</h2>
    <DaytimeRangeChart />
  </GridContainer>
  <GridContainer>
    <h2 class="text-lg font-bold text-neutral-100">Project</h2>
    <MetricRatioChart metric="project" />
  </GridContainer>
   <GridContainer>
    <h2 class="text-lg font-bold text-neutral-100">Language</h2>
    <MetricRatioChart metric="language" />
  </GridContainer>
</div>
