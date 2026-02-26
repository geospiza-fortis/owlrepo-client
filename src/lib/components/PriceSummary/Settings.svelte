<script>
  import { slide } from "svelte/transition";
  import localforage from "localforage";
  export let settings;

  // Added to make sure there aren't any weird race conditions...
  let loaded = false;
  let isOpen = false;
  const key = "search-item-index-settings";

  let paginationSize = 10;

  $: getSettings(key)
    .catch(console.log)
    .then((obj) => {
      if (obj) {
        ({ paginationSize } = obj);
      }
      loaded = true;
    });
  $: settings = {
    paginationSize: paginationSize,
  };
  $: import.meta.env.DEV &&
    console.log(`search index settings ${JSON.stringify(settings)}`);
  $: loaded && localforage.setItem(key, settings).catch(console.log).then();

  async function getSettings(key) {
    let storedItem = await localforage.getItem(key);
    try {
      // stupid backwards compatibility, why was this a string before?
      return JSON.parse(storedItem);
    } catch {
      return storedItem;
    }
  }
</script>

<button
  class="btn btn-primary"
  type="button"
  on:click={() => (isOpen = !isOpen)}
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
