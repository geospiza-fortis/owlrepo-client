<script>
  import Fuse from "fuse.js";
  import { onMount } from "svelte";

  // Do I really need to provide the itemData alongside the table?
  export let itemData;
  export let table;
  export let keys;
  export let initialSort = [];
  export let term = null;

  $: fuse = new Fuse(itemData, {
    includeScore: true,
    keys: keys,
  });
  $: results = itemData.length;

  // for our debounce callback
  let timeout = null;

  async function updateTable(value) {
    if (!table) {
      return;
    }
    if (!value.trim()) {
      await table.replaceData(itemData);
      // sort and unset sorting
      await table.setSort(initialSort);
      table.clearSort();
      results = itemData.length;
    } else {
      table.clearSort();
      let data = fuse.search(value);
      await table.replaceData(data.map((d) => d.item));
      results = data.length;
    }
    term = value.trim();
  }

  onMount(async () => {
    updateTable("");
  });

  // https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript
  async function debounce(value) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // Add an event to determine how often the search is being used. The
      // actual term is not useful, but the first item in the table should
      // be enough to be a signal of what should be updated.
      if (value) {
        let term = "__unknown__";
        let row = table.getData("visible")[0];
        if (row) {
          term = row[keys[0]];
        }
        // https://developers.google.com/gtagjs/reference/event#search
        gtag("event", "search", {
          search_term: term,
        });
      }
    }, 1000);
  }
</script>

<input
  type="text"
  placeholder="Search..."
  id="search-box"
  on:input={(e) => updateTable(e.target.value)}
  on:keyup={(e) => debounce(e.target.value)}
/>
{results} results
