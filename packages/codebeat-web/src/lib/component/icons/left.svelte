<script lang="ts">
  import { cn } from "$utils";

  let width = 18;
  let height = 18;
  let className = "";
  export { width, height, className as class };
</script>

<div
  class={cn(
    "fill-neutral-300 hover:fill-primary-500 hover:cursor-pointer hover:bg-neutral-700",
    className,
  )}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    {width}
    {height}
    viewBox="0 0 24 24"
    {...$$props}
  >
    <path d="m14 18l-6-6l6-6l1.4 1.4l-4.6 4.6l4.6 4.6z" />
  </svg>
</div>
