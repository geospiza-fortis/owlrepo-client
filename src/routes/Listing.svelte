<script>
  import { onMount } from "svelte";
  import SummaryView from "../components/SummaryView.svelte";
  import { Stretch } from "svelte-loading-spinners/src";
  import Tabulator from "tabulator-tables";
  export let params;

  let uid = params.listing_id;
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
    table = new Tabulator("#results", {
      data: flattened,
      clipboard: "copy",
      clipboardCopyStyled: false,
      layout: "fitDataFill",
      columns: [
        {
          title: "Search Item",
          field: "item"
        },
        {
          title: "Results",
          field: "results"
        },
        {
          title: "Seller",
          field: "id"
        },
        {
          title: "Store Name",
          field: "store_name"
        },
        {
          title: "Bundle",
          field: "bundle"
        },
        {
          title: "Price",
          field: "price",
          formatter: "money",
          formatterParams: { precision: 0 },
          align: "right"
        },
        {
          title: "Quantity",
          field: "quantity"
        }
      ]
    });
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

<div id="results" />
