<script lang="ts">
  import GridContainer from "$lib/component/GridContainer.svelte";
  import DateRanger from "$lib/component/DateRanger.svelte";
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
  <GridContainer>
    <div class="my-2">
      <DateRanger dayBefore={0} />
      <p class="text-neutral-400 space-y-2">1 hr 26 mins</p>
    </div>
    <div class="my-2">
      <DateRanger dayBefore={7} />
      <p class="text-neutral-400">14 hrs 48 mins</p>
    </div>
    <div class="my-2">
      <DateRanger dayBefore={30} />
      <p class="text-neutral-400">86 hrs 8 mins</p>
    </div>
  </GridContainer>
  <GridContainer>
    <h2 class="text-lg font-bold text-neutral-100">Column 2</h2>
    <p class="text-neutral-400 my-2">Content for column 2</p>
  </GridContainer>
  <GridContainer>
    <h2 class="text-lg font-bold text-neutral-100">Column 3</h2>
    <p class="text-neutral-400 my-2">Content for column 3</p>
  </GridContainer>
</div>
