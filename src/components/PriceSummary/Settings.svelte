<script>
  import { Collapse } from "sveltestrap/src";
  import localforage from "localforage";
  import { columns } from "./columns.js";
  import { onMount } from "svelte";

  export let settings;

  // Added to make sure there aren't any weird race conditions...
  let loaded = false;
  let isOpen = false;
  const key = "search-item-index-settings";

  let sortColumn = "search_item_timestamp";
  let sortDir = "desc";
  let paginationSize = 10;

  $: getSettings(key)
    .catch(console.log)
    .then(obj => {
      if (obj) {
        ({ sortColumn, sortDir, paginationSize } = obj);
      }
      loaded = true;
    });
  $: settings = {
    sortColumn: sortColumn,
    sortDir: sortDir,
    paginationSize: paginationSize
  };
  $: process.env.NODE_ENV == "development" &&
    console.log(`search index settings ${JSON.stringify(settings)}`);
  $: loaded &&
    localforage
      .setItem(key, settings)
      .catch(console.log)
      .then();

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
  on:click={() => (isOpen = !isOpen)}>
  Settings
</button>

<Collapse {isOpen} style="text-align: right">
  <label>
    Default Sort:
    <select bind:value={sortColumn}>
      {#each columns as column}
        <option value={column.field}>{column.title}</option>
      {/each}
    </select>
    <select bind:value={sortDir}>
      {#each [{ value: 'desc', title: 'descending' }, { value: 'asc', title: 'ascending' }] as item}
        <option value={item.value}>{item.title}</option>
      {/each}
    </select>
  </label>
  <br />
  <label>
    Items per page:
    <select bind:value={paginationSize}>
      {#each [5, 10, 20, 50, 100] as size}
        <option value={size}>{size}</option>
      {/each}
    </select>
  </label>
</Collapse>
