<script lang="ts">
  import Logo from "./Logo.svelte";
  import Github from "./Github.svelte";
</script>

<header class="sticky top-0 flex flex-row items-center justify-between h-14 w-full px-8 backdrop-blur-lg">
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
</header>
