<script lang="ts">
  import { createTooltip, melt } from '@melt-ui/svelte'
  import { fade } from 'svelte/transition'
  import { cn } from '$utils'

  const {
    elements: { trigger, content, arrow },
    states: { open },
  } = createTooltip({
    positioning: {
      placement: 'bottom',
    },
    forceVisible: true
  })

  let dayBefore: number = 0;
  let className = ''

  $: dateText = (() => {
    if (dayBefore === 0) return 'Today';
    return `Last ${dayBefore} days`;
  })();

  $: endDate = new Date();
  $: startDate = new Date(new Date(endDate).setDate(endDate.getDate() - dayBefore));
  $: startDateStr = startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  $: endDateStr = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  export { dayBefore, className as class };
</script>

<div class={cn("inline-flex hover:cursor-default", className)} use:melt={$trigger}>
  <h2 class="text-sm font-bold text-neutral-100">{dateText}</h2>
</div>

{#if $open}
  <div
    class="bg-neutral-900 p-1 rounded-lg"
    use:melt={$content}
    transition:fade={{ duration: 100 }}
  >
    <div class="arrow" use:melt={$arrow}></div>
    <p class="text-sm text-neutral-400">{startDateStr} - {endDateStr}</p>
  </div>
{/if}
