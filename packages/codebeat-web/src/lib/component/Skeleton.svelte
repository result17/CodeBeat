<script lang="ts">
    import { cn } from '$utils'
    let className: string

    export { className as class}
</script>
<div class={cn('bg-neutral-300 animate-pulse rounded-md', className)}></div>