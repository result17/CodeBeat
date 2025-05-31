<script lang="ts">
  import Logo from "./Logo.svelte";
  import Github from "./Github.svelte";
</script>

<div class="flex flex-row items-center justify-between h-14 bg-neutral-800 w-full px-8">
  <div class="flex">
    <a href="/">
      <Logo withText />
    </a>
  </div>
  <div class="flex justify-end">
    <a
      href="https://github.com/your-repo"
      class="text-neutral-300"
    >
      <Github />
    </a>
  </div>
</div>
