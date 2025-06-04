<script lang="ts">
  let title: string;
  export { title };
</script>

<div class="bg-neutral-800 p-4 rounded-lg shadow-md">
  <div class="flex flex-row justify-between border-b-1 border-neutral-500 pb-4">
    <h1 class="text-sm font-bold text-neutral-100">{title}</h1>
    <section>
      <slot name="toolbar"></slot>
    </section>
  </div>
  <section class="pt-4">
    <slot />
  </section>
</div>
