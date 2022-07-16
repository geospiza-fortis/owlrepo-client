<script context="module">
  export async function load({ params }) {
    return { props: params };
  }
</script>

<script>
  import { onMount } from "svelte";
  import { Stretch } from "svelte-loading-spinners/src";
  import { resultColumns } from "./columns.js";

  import Table from "../../components/Table.svelte";
  import SummaryView from "./SummaryView.svelte";

  export let task_id;
  let flattened = null;
  let status = null;

  let table;
  let cutoff = 3;

  function flatten(data) {
    return data.payload.flatMap((row) => {
      return row.body.entries.map((entry, entryIndex) => ({
        ...row.screenshot,
        ...row.search,
        ...row.paginator,
        ...entry,
        entry_index: entryIndex,
      }));
    });
  }

  onMount(async () => {
    const url = `/api/v2/data/${task_id}/slim.json`;
    const resp = await fetch(url);

    status = resp.status;
    if (status == 404) {
      return;
    }
    flattened = flatten(await resp.json());
  });
</script>

<svelte:head>
  <title>OwlRepo | Listing</title>
</svelte:head>

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
  <button class="btn btn-info" on:click={table.copyToClipboard("active", true)}>
    Copy to Clipboard
  </button>
{:else if status == 404}
  Data for {task_id} is not ready yet. Results may take up to 10 minutes to appear.
{:else}
  <div style="text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}

<Table
  bind:table
  data={flattened}
  options={{
    clipboard: "copy",
    clipboardCopyStyled: false,
    columns: resultColumns,
  }}
/>
