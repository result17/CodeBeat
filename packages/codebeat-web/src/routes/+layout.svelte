<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  let isMobile = false;

  onMount(() => {
    if (browser) {
      isMobile = window.innerWidth <= 768;
    }
  });
</script>

<svelte:head>
  <title>Codebeat</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<slot />
