<script lang="ts">
  import { cn } from "$utils";
  let isRotating: boolean = false;
  let width = 18;
  let height = 18;
  let className = "";
  export { isRotating, width, height, className as class };
</script>

<div class={cn('p-0.5 fill-neutral-300 hover:fill-primary-500 hover:cursor-pointer hover:bg-neutral-700',
  "transition-colors duration-200",
  className)}>
  <svg class={cn(isRotating && 'rotating')} xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 24 24">
    <path
      d="M12 21q-1.875 0-3.512-.712t-2.85-1.925t-1.925-2.85T3 12t.713-3.512t1.924-2.85t2.85-1.925T12 3q2.05 0 3.888.875T19 6.35V4h2v6h-6V8h2.75q-1.025-1.4-2.525-2.2T12 5Q9.075 5 7.038 7.038T5 12t2.038 4.963T12 19q2.625 0 4.588-1.7T18.9 13h2.05q-.375 3.425-2.937 5.713T12 21m2.8-4.8L11 12.4V7h2v4.6l3.2 3.2z"
    />
  </svg>
</div>

<style scoped>
  .rotating {
    animation: spin 1s linear infinite;
    transform-origin: center;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
