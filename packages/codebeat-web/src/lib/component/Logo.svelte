<script lang="ts">
  export let withText: boolean = true;
</script>

<div class="flex items-center position-sticky top-0 left-0">
  <img src="/logo.png" alt="Codebeat Logo" class="w-8 mr-2" />
  {#if withText}
    <span class="text-lg font-bold text-neutral-100">Codebeat</span>
  {/if}
</div>
