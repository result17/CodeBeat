<script lang="ts">
  import Skeleton from "./Skeleton.svelte";
</script>

<section class="flex flex-row items-center w-full h-full">
  <div>
    <Skeleton class="w-28 h-28 rounded-full" />
  </div>
  <div class="flex-1 space-y-4 ml-4">
    <Skeleton class="w-4/12 h-4 rounded-xs" />
    <Skeleton class="w-8/12 h-4 rounded-xs" />
    <Skeleton class="w-10/12 h-4 rounded-xs" />
  </div>
</section>
