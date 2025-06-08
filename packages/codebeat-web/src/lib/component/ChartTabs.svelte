<script lang="ts">
  import { cn } from "$utils";
  import { createTabs, melt } from "@melt-ui/svelte";
  import { cubicInOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import ContentContainer from "./ContentContainer.svelte";
  import DaytimeRangeChart from "$lib/component/DaytimeRangeChart.svelte";

  const triggers = [
    { id: "today", title: "Today" },
    { id: "7days", title: "7 days" },
    { id: "30days", title: "30 days" },
  ];

  const {
    elements: { root, list, trigger, content },
    states: { value },
  } = createTabs({
    defaultValue: "today",
  });

  crossfade({
    duration: 250,
    easing: cubicInOut,
  });
</script>

<div use:melt={$root} class={cn("flex flex-col rounded-xl shadow-lg")}>
  <div
    use:melt={$list}
    class="flex flex-row shrink-0 overflow-x-auto bg-neutral-600 w-fit px-2 py-1 rounded-md"
    aria-label="Select datetime to query"
  >
    {#each triggers as triggerItem}
        <button
          class={cn(
            "hover:cursor-pointer px-2 py-1 rounded-md flex-1 whitespace-nowrap",
            $value === triggerItem.id
              ? "text-primary-500 bg-neutral-950"
              : "text-neutral-300",
          )}
          use:melt={$trigger(triggerItem.id)}>{triggerItem.title}</button
        >
    {/each}
  </div>

  <div class="flex-1" use:melt={$content("today")}>
    <DaytimeRangeChart />
  </div>
  <div class="flex-1" use:melt={$content("7days")}>
    <ContentContainer id="7days"><p class="text-neutral-100">7 days</p></ContentContainer>
  </div>
  <div class="flex-1" use:melt={$content("30days")}>
    <ContentContainer id="30days"><p class="text-neutral-100">30 days</p></ContentContainer>
  </div>
</div>

<style>
  .trigger {
    display: flex;
    align-items: center;
    justify-content: center;

    cursor: default;
    user-select: none;

    border-radius: 0;
    font-weight: 500;
    line-height: 1;

    flex: 1;
  }
</style>
