<script lang="ts">
  import type { ChartID } from "$lib/stores/chart";
  import UpdateIcon from "$lib/component/icons/Update.svelte";
  import { useChartState } from "$lib/stores/chart";
  import { cn } from "$utils";
  import ChartSkeleton from "./ChartSkeleton.svelte";
  import { onMount } from "svelte";

  export let title: string = "";
  export let id: ChartID;
  const chartState = useChartState(id);

  $: isLoading = $chartState.loading;
  $: hasContent = $chartState.hasContent;

  $: if (!isLoading && $chartState.action === "update") {
    chartState.query();
  }

  onMount(() => {
    chartState.setAction("update");
  });
</script>

<div class="bg-neutral-950 p-4 rounded-lg shadow-md">
  <div class="flex flex-row justify-between border-b-1 border-neutral-500 pb-4">
    <h1 class="text-sm font-bold text-neutral-100">{title}</h1>
    <section>
      <div class="flex flex-row gap-2">
        <slot name="toolbar"></slot>
        <button
          title="update"
          type="button"
          on:click={() => {
            if (!isLoading) chartState.setAction("update");
          }}
        >
          <UpdateIcon isRotating={isLoading} />
        </button>
      </div>
    </section>
  </div>
  <section class={cn("pt-4 min-h-[180px]", isLoading && "relative")}>
    <div class={cn(!hasContent && "hidden")}><slot></slot></div>
    {#if isLoading}
      <div
        class="absolute inset-0 w-full h-full
        bg-neutral-950 flex items-center justify-center
        overflow-auto transition-opacity duration-300 ease-in-out {isLoading
          ? 'opacity-100'
          : 'opacity-0'}"
      >
        <ChartSkeleton />
      </div>
    {/if}
  </section>
</div>
