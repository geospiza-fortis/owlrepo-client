<script>
  import { onMount } from "svelte";
  import localforage from "localforage";
  import Table from "$lib/components/Table.svelte";
  import PublicKey from "$lib/docs/PublicKey.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { uploadColumns, curationColumns } from "./columns.js";

  let uploads = [];
  let curations = [];
  let contributor_id;

  const uploadOptions = {
    initialSort: [{ column: "timestamp", dir: "desc" }],
    columns: uploadColumns,
  };

  const curationOptions = {
    initialSort: [{ column: "timestamp", dir: "desc" }],
    columns: curationColumns,
  };

  onMount(async () => {
    uploads = (await localforage.getItem("personal-uploads")) || [];
    curations = (await localforage.getItem("personal-curations")) || [];
    contributor_id = await localforage.getItem("contributor-id");
  });
</script>

<Seo
  title="OwlRepo | Personal"
  description="Your personal upload and curation history on OwlRepo."
  noindex={true}
  includeOg={false}
/>

<h1>Personal Statistics</h1>

<p>
  This page contains your personal history with OwlRepo. The data associated
  with your contributions is stored locally on your device and will change if
  you use a different browser.
</p>

<PublicKey />

<h2>Upload History</h2>

{#if !uploads.length}
  <p>
    You don't seem to have
    <a href="/upload">uploads.</a>
    Any contributed owl uploads will appear here.
  </p>
{/if}
{#if uploads.length}
  <Table data={uploads} options={uploadOptions} />
{/if}

<h2>Curation contributions</h2>

{#if contributor_id}
  <p>
    Your contributor id is
    <code>{contributor_id}</code>
    .
  </p>
{:else}
  <p>
    You have not curated any owl transcriptions. See
    <a href="/curate">the curation</a>
    page for more details.
  </p>
{/if}

{#if curations.length}
  <Table data={curations} options={curationOptions} />
{/if}
