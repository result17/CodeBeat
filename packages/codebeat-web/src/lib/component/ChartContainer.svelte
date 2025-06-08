<script lang="ts">
  import { writable } from "svelte/store";
  import { setContext, onDestroy } from "svelte";
  import UpdateIcon from "$lib/component/icons/Update.svelte";

  let toolAction = writable("");

  export let title: string = "";
  export let id: string = "";
  let storeId = writable(id);
  let prevCtxKey = "";

  let isFetching = writable(false);
  let isRotating = false;

  const unSubId = storeId.subscribe((val) => {
    if (val) {
      const key = `${val}_chart`;
      setContext(key, {
        action: toolAction,
        isFetching,
      });
      if (prevCtxKey) {
        setContext(prevCtxKey, undefined);
      }
      prevCtxKey = key;
    }
  });

  const unSubIsFetching = isFetching.subscribe((val) => (isRotating = val));

  onDestroy(() => {
    unSubId();
    unSubIsFetching();
  });
</script>

<div class="bg-neutral-950 p-4 rounded-lg shadow-md">
  <div class="flex flex-row justify-between border-b-1 border-neutral-500 pb-4">
    <h1 class="text-sm font-bold text-neutral-100">{title}</h1>
    <section>
      <div class="flex flex-row">
        <button
          type="button"
          on:click={() => {
            if (!isRotating) toolAction.set("update");
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
