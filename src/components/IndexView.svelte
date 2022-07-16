<script>
  import { Stretch } from "svelte-loading-spinners";
  import { onMount } from "svelte";

  let listings = [];
  let is_cached = true;
  let offset = 0;
  let max_offset = -1;
  export let limit = 10;

  // https://svelte.dev/tutorial/onmount
  // https://stackoverflow.com/a/38956175

  // only cache for the current session
  async function update() {
    if (offset < 0) {
      console.log(`trying to access a negative offset: ${offset}`);
      return;
    }
    let cache = await caches.open("index-cache");
    let url = `${
      import.meta.env.VITE_OWLREPO_URL
    }/api/v1/list?offset=${offset}&limit=${limit}`;
    var resp = await cache.match(url);
    if (!resp) {
      is_cached = false;
      listings = [];
      resp = await fetch(url);
      await cache.put(url, resp);
      resp = await cache.match(url);
    }
    listings = await resp.json();
    if (listings.length === 0) {
      // TODO: this makes an assumption that the offset is moved in
      // increments of limit
      max_offset = offset;
      offset -= limit;
      update();
    } else if (listings.length < limit) {
      // again, see the comment above
      max_offset = offset;
      offset -= limit;
      offset += listings.length;
    }

    // TODO: fix this in the backend
    for (let i = 0; i < listings.length; i++) {
      if (!listings[i].metadata) {
        listings[i].metadata = {
          mode: "unknown",
          pages: -1,
          items: -1,
        };
      }
    }
  }

  onMount(async () => {
    // refresh the cache
    await caches.delete("index-cache");
    await update();
  });
</script>

{#if listings.length > 0}
  <table class="table table-sm table-bordered">
    <tr>
      <th scope="col">Submission</th>
      <th scope="col">Search Item</th>
      <th scope="col">Items</th>
      <th scope="col">Pages</th>
    </tr>
    {#each listings as entry}
      <tr>
        <td>{entry.completion_timestamp.split(".")[0]}</td>
        <td>
          <a href="/listing/{entry.id}">{entry.metadata.mode}</a>
        </td>
        <td>{entry.metadata.items}</td>
        <td>{entry.metadata.pages}</td>
      </tr>
    {/each}
  </table>

  {#if offset > 0}
    <button
      class="btn btn-info"
      on:click={async () => {
        offset -= listings.length;
        if (offset < 0) {
          offset = 0;
        }
        await update();
      }}
    >
      Previous
    </button>
  {:else}
    <button class="btn btn-info" disabled>Previous</button>
  {/if}
  {#if max_offset > 0 && offset + limit > max_offset}
    <button class="btn btn-info" disabled>Next</button>
  {:else}
    <button
      class="btn btn-info"
      on:click={async () => {
        offset += limit;
        await update();
      }}
    >
      Next
    </button>
  {/if}
  Page {Math.ceil(offset / limit) + 1}
{:else if !is_cached}
  <div id="spinner">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}

<style>
  #spinner {
    width: 100px;
    margin: 0 auto;
  }
</style>
