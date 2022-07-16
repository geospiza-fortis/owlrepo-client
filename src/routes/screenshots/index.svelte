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
</script>

<h1>Screenshots</h1>

{#if tauri}
  <p>Hello</p>
  <Listing />
{:else}
  <p>
    Download the owlrepo localhost client for this functionality, redirecting in
    3 seconds...
  </p>
{/if}
