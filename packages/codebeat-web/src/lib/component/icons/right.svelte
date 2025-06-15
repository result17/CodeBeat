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
    <path d="M12.6 12L8 7.4L9.4 6l6 6l-6 6L8 16.6z" />
  </svg>
</div>
