<script lang="ts">
  import { writable } from "svelte/store";
  import { setContext, onDestroy } from "svelte";
  import GridContainer from "$lib/component/GridContainer.svelte";
  import UpdateIcon from "$lib/component/icons/Update.svelte";

  let toolAction = writable("");

  export let id: string = "";
  let storeId = writable(id);
  let prevCtxKey =  ""

  let isFetching = writable(false)
  let isRotating =false

  const unSubId = storeId.subscribe(val => {
    if (val) {
      const key = `${val}_chart`
      setContext(key, {
        action: toolAction,
        isFetching,
      })
      if (prevCtxKey) {
        setContext(prevCtxKey, undefined)
      }
      prevCtxKey = key
    }
  });

  const unSubIsFetching = isFetching.subscribe(val => isRotating = val)

  onDestroy(() => {
    unSubId()
    unSubIsFetching()  
  });
</script>

<GridContainer title={id}>
  <div class="flex flex-row" slot="right">
    <button type="button" on:click={() => {
      if (!isRotating) toolAction.set("update")
    }}>
      <UpdateIcon isRotating={isRotating} />
    </button>
    <slot name="toolbar"></slot>
  </div>
  <slot></slot>
</GridContainer>
