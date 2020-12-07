<script>
  import { onMount } from "svelte";
  import localforage from "localforage";
  import Tabulator from "tabulator-tables";
  import { getOrCreateJWK, getThumbprint } from "../token.js";

  let uploads = [];
  let curations = [];
  let contributor_id;
  let client_thumbprint;
  let client_public_key;

  onMount(async () => {
    uploads = (await localforage.getItem("personal-uploads")) || [];
    curations = (await localforage.getItem("personal-curations")) || [];
    contributor_id = await localforage.getItem("contributor-id");
    client_thumbprint = await getThumbprint();
    client_public_key = await getOrCreateJWK("contributor-keys", true);

    if (uploads.length > 0) {
      new Tabulator("#uploads", {
        data: uploads,
        initialSort: [{ column: "timestamp", dir: "desc" }],
        columns: [
          {
            title: "Date",
            field: "timestamp",
            formatter: "datetime",
            formatterParams: {
              outputFormat: "YYYY-MM-DD HH:MM"
            }
          },
          {
            title: "Task ID",
            field: "task_id",
            formatter: "link",
            formatterParams: {
              urlField: "task_id",
              urlPrefix: "/listing/"
            }
          }
        ]
      });
    }
    if (curations.length > 0) {
      new Tabulator("#curations", {
        data: curations,
        initialSort: [{ column: "timestamp", dir: "desc" }],
        columns: [
          {
            title: "Date",
            field: "timestamp",
            formatter: "datetime",
            formatterParams: {
              outputFormat: "YYYY-MM-DD HH:MM"
            }
          },
          {
            title: "Task ID",
            field: "task_id",
            formatter: "link",
            formatterParams: {
              urlField: "task_id",
              urlPrefix: "/listing/"
            }
          },
          {
            title: "Screenshot ID",
            field: "screenshot_sha1"
          }
        ]
      });
    }
  });
</script>

<h1>Personal Statistics</h1>

<p>
  This page contains your personal history with OwlRepo. The data associated
  with your contributions is stored locally on your device and will change if
  you use a different browser.
</p>

{#if client_public_key}
  <p>
    Your public key thumbprint is
    <code>{client_thumbprint}</code>
    . Your full
    <a href="https://tools.ietf.org/html/rfc7517">JWK public key</a>
    is:
    <code>
      <pre>{JSON.stringify(client_public_key.toJSON(), null, 4)}</pre>
    </code>
    This is a cryptographic key that can be used to prove your identity. Feel
    free to share your public key as you see fit. For the technically savvy, do
    not share your private key (available in IndexedDB) with others.
  </p>
{/if}

<h2>Upload History</h2>

{#if !uploads.length}
  <p>
    You don't seem to have
    <a href="/upload">uploads.</a>
    Any contributed owl uploads will appear here.
  </p>
{/if}

<div id="uploads" />

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

<div id="curations" />
