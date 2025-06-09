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

<div class="block min-h-screen bg-neutral-800 " id="page">
  <Header />
  <main class="flex w-full p-4 overflow-auto">
    <slot />
  </main>
</div>
