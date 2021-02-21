<script>
  import { onMount } from "svelte";
  import { Stretch } from "svelte-loading-spinners/src";
  import { resultColumns } from "./columns.js";

  import Table from "../../components/Table.svelte";

  import SummaryView from "./SummaryView.svelte";

  import { stores } from "@sapper/app";
  const { page } = stores();
  const { slug } = $page.params;

  let uid = slug;
  let url = `/api/v1/data/${uid}/slim.json`;

  let flattened = null;
  let ready = true;
  let table;
  let cutoff = 3;

  function flatten(data) {
    return data.payload.flatMap(row => {
      return row.body.entries.map((entry, entryIndex) => ({
        ...row.screenshot,
        ...row.search,
        ...row.paginator,
        ...entry,
        entry_index: entryIndex
      }));
    });
  }

  onMount(async () => {
    const resp = await fetch(url);
    if (resp.status == 404) {
      console.log("data does not exist yet");
      ready = false;
      return;
    }
    let data = await resp.json();
    flattened = flatten(data);
  });
</script>

<style>
  #spinner {
    width: 100px;
    margin: 0 auto;
  }
</style>

<h2>Summary</h2>

<p>
  The data is prepared for visualization by removing outliers. Outliers are the
  extreme points that fall outside {cutoff}
  <a href="https://en.wikipedia.org/wiki/Median_absolute_deviation">
    median absolute deviations (MAD).
  </a>
</p>

{#if flattened}
  <SummaryView {flattened} {cutoff} />
  <h2>Results</h2>
  <button on:click={table.copyToClipboard('active', true)}>
    Copy to Clipboard
  </button>
{:else if !ready}
  Data for {uid} is not ready yet. Results may take up to 10 minutes to appear.
{:else}
  <div id="spinner">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}

<Table
  bind:table
  data={flattened}
  options={{ clipboard: 'copy', clipboardCopyStyled: false, columns: resultColumns }} />
