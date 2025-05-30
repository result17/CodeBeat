<script lang="ts">
  import GridContainer from "$lib/component/GridContainer.svelte";
  import MultDuration from "$lib/component/MultDuration.svelte";
  import { client } from "$lib/trpc";

  let durationVal: number = 0;

  client.duration.getDuration
    .query()
    .then(({ duration }) => {
      durationVal = duration;
    })
    .catch((error: Error) => {
      console.error("Error fetching duration:", error);
    });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
  <GridContainer>
    <MultDuration />
  </GridContainer>
  <GridContainer>
    <h2 class="text-lg font-bold text-neutral-100">Column 2</h2>
    <p class="text-neutral-400 my-2">{durationVal} second(s)</p>
  </GridContainer>
  <GridContainer>
    <h2 class="text-lg font-bold text-neutral-100">Column 3</h2>
    <p class="text-neutral-400 my-2">Content for column 3</p>
  </GridContainer>
</div>
