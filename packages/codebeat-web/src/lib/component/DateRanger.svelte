<script lang="ts">
  import { createTooltip, melt } from '@melt-ui/svelte'
  import { fade } from 'svelte/transition'

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
  export { dayBefore };
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
</script>

<div class="inline-flex hover:cursor-default" use:melt={$trigger}>
  <h2 class="text-lg font-bold text-neutral-100">{dateText}</h2>
</div>

{#if $open}
  <div class="bg-neutral-900 p-1 rounded-lg"
    use:melt={$content}
    transition:fade={{ duration: 100 }}>
    <div class="arrow" use:melt={$arrow}></div>
    <p class="text-sm text-neutral-400">{startDateStr} - {endDateStr}</p>
  </div>  
{/if}
