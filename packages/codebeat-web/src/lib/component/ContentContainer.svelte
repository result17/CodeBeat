<script lang="ts">
    import {
        onMount,
    } from 'svelte'
    export let id: string

    onMount(() => {
        console.log(`${id} is mount`)
    })
</script>
<div class="w-full h-full bg-neutral-950"><slot></slot></div>