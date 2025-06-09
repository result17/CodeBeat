<script lang="ts">
  import UpdateIcon from "$lib/component/icons/Update.svelte";
  import { useChartState } from "../stores/chart";

  export let title: string = "";
  export let id: string = "";
  const chartState = useChartState(id);
  $: isRotating = $chartState.loading;
</script>

<div class="bg-neutral-950 p-4 rounded-lg shadow-md">
  <div class="flex flex-row justify-between border-b-1 border-neutral-500 pb-4">
    <h1 class="text-sm font-bold text-neutral-100">{title}</h1>
    <section>
      <div class="flex flex-row">
        <button
          type="button"
          on:click={() => {
            if (!isRotating) chartState.setAction("update");
          }}
        >
          <UpdateIcon {isRotating} />
        </button>
        <slot name="toolbar"></slot>
      </div>
    </section>
  </div>
  <section class="pt-4">
    <slot></slot>
  </section>
</div>
