<script>
  import { onMount } from "svelte";
  import { browser } from "$app/env";
  import Listing from "./Listing.svelte";

  $: tauri = browser && window.__TAURI__;

  onMount(async () => {
    // check the window for tauri, otherwise redirect
    if (!tauri) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      window.location.href = "/";
    }
  });

  // https://tauri.app/v1/guides/development/security/#tauri-api
  // TODO: save directory, list files in the last x days, copy files into a new
  // directory, upload files
  // list(timestamp)
  // filter by owl
</script>

<h1>Screenshots</h1>

{#if tauri}
  <Listing />
{:else}
  <p>
    Download the owlrepo localhost client for this functionality, redirecting in
    3 seconds...
  </p>
{/if}
