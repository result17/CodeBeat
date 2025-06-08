<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import Header from "$lib/component/Header.svelte";

  import "../app.css";

  let isMobile = false;

  onMount(() => {
    if (browser) {
      isMobile = window.innerWidth <= 768;
    }
  });

</script>

<div class="flex min-h-screen flex-col" id="page">
  <Header />
  <main class="flex flex-1 w-full bg-neutral-800 p-4">
    <slot />
  </main>
</div>
