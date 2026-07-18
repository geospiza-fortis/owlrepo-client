<script>
  import { run } from "svelte/legacy";

  import { slide } from "svelte/transition";
  import localforage from "localforage";
  let { settings = $bindable() } = $props();

  // Added to make sure there aren't any weird race conditions...
  let loaded = $state(false);
  let isOpen = $state(false);
  const key = "search-item-index-settings";

  let paginationSize = $state(10);

  async function getSettings(key) {
    let storedItem = await localforage.getItem(key);
    try {
      // stupid backwards compatibility, why was this a string before?
      return JSON.parse(storedItem);
    } catch {
      return storedItem;
    }
  }
  run(() => {
    getSettings(key)
      .catch(console.log)
      .then((obj) => {
        if (obj) {
          ({ paginationSize } = obj);
        }
        loaded = true;
      });
  });
  run(() => {
    settings = {
      paginationSize: paginationSize,
    };
  });
  run(() => {
    import.meta.env.DEV &&
      console.log(`search index settings ${JSON.stringify(settings)}`);
  });
  run(() => {
    loaded && localforage.setItem(key, settings).catch(console.log).then();
  });
</script>

<button
  class="btn btn-primary"
  type="button"
  onclick={() => (isOpen = !isOpen)}
>
  Settings
</button>

{#if isOpen}
  <div style="text-align: right" transition:slide>
    <label>
      Items per page:
      <select bind:value={paginationSize}>
        {#each [5, 10, 20, 50, 100] as size}
          <option value={size}>{size}</option>
        {/each}
      </select>
    </label>
  </div>
{/if}
