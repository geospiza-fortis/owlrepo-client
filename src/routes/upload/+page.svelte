<script>
  import Uploader from "$lib/components/uploader/Uploader.svelte";
  import IndexView from "$lib/components/IndexView.svelte";
  import CollapseInfo from "$lib/components/CollapseInfo.svelte";
  import TopUploaders from "$lib/components/TopUploaders.svelte";
  import ActivityHeatmap from "$lib/components/ActivityHeatmap.svelte";
  import PublicKey from "$lib/docs/PublicKey.svelte";
  import UploadInstructions from "$lib/docs/UploadInstructions.svx";
  import localforage from "localforage";
  import { onMount } from "svelte";

  let heatmap;
  let uploads = [];

  onMount(async () => {
    uploads = (await localforage.getItem("personal-uploads")) || [];
    const resp = await fetch("/api/v2/query/heatmap");
    heatmap = await resp.json();
  });
</script>

<svelte:head>
  <title>OwlRepo | Upload</title>
</svelte:head>

<h1>Upload Owls</h1>

<Uploader />

<UploadInstructions />

<h2>Top Uploaders</h2>

<p>
  These are the top uploaders for the past week. Your upload position is
  highlighted. You have contributed {uploads.length} owl{#if uploads.length != 1}s{/if}
  to date.
</p>

<CollapseInfo
  component={PublicKey}
  componentId="publicKey"
  text="What is a thumbprint?"
/>

<TopUploaders />

<h2>Recent Uploads</h2>
<p>
  This shows all recent uploads to the site. Click
  <a href="/personal">here to see your personal upload history.</a>
</p>

<IndexView limit={8} />

<br />

{#if heatmap}
  <ActivityHeatmap data={heatmap} max_range={14} />
{/if}
