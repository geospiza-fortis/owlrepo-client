<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import Settings from "./Settings.svelte";
  import Unprocessed from "./Unprocessed.svelte";
  import Batch from "./Batch.svelte";

  $: tauri = browser && window.__TAURI__;

  onMount(async () => {
    // check the window for tauri, otherwise redirect
    if (!tauri) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      window.location.href = "/";
    }
  });

  // https://tauri.app/v1/guides/development/security/#tauri-api
  // TODO: save directory copy files into a new, directory, upload files
</script>

<h1>Screenshots</h1>

{#if tauri}
  <Settings />
  <Unprocessed />
  <Batch />
{:else}
  <p>
    Download the owlrepo localhost client for this functionality, redirecting in
    3 seconds...
  </p>
{/if}
