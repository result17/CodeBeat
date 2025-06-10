<script lang="ts">
  import UpdateIcon from "$lib/component/icons/Update.svelte";
    import { useChartState } from "$lib/stores/chart";
  import { durationsChartState } from "../stores/chartStates/durations";
  import ChartSkeleton from "./ChartSkeleton.svelte";

  export let title: string = "";
  export let id: string = "";
  const chartState = useChartState(id);
  $: isLoading = $chartState.loading;
</script>

<div class="bg-neutral-950 p-4 rounded-lg shadow-md">
  <div class="flex flex-row justify-between border-b-1 border-neutral-500 pb-4">
    <h1 class="text-sm font-bold text-neutral-100">{title}</h1>
    <section>
      <div class="flex flex-row">
        <button
          type="button"
          on:click={() => {
            if (!isLoading) chartState.setAction("update");
          }}
        >
          <UpdateIcon isRotating={isLoading} />
        </button>
        <slot name="toolbar"></slot>
      </div>
    </section>
  </div>
  <section class="pt-4 relative min-h-[180px]">
    <slot></slot>
    {#if isLoading}
      <div
        class="absolute inset-0 w-full h-full bg-neutral-950 flex items-center justify-center overflow-auto transition-opacity duration-300 ease-in-out {isLoading ? 'opacity-100' : 'opacity-0'}"
      >
        <ChartSkeleton />
      </div>
    {/if}
  </section>
</div>
