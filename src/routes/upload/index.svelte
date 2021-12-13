<script context="module">
  export async function preload() {
    const fetchData = async (url) => {
      let resp = await this.fetch(url);
      return await resp.json();
    };
    const heatmap = await fetchData("/api/v2/query/heatmap");

    return { heatmap };
  }
</script>

<script>
  import Uploader from "../../components/Uploader.svelte";
  import IndexView from "../../components/IndexView.svelte";
  import CollapseInfo from "../../components/CollapseInfo.svelte";
  import TopUploaders from "../../components/TopUploaders.svelte";
  import ActivityHeatmap from "../../components/ActivityHeatmap.svelte";
  import PublicKey from "../../docs/PublicKey.svelte";
  import UploadInstructions from "../../docs/UploadInstructions.svx";
  import localforage from "localforage";
  import { onMount } from "svelte";

  export let heatmap;
  let uploads = [];

  onMount(async () => {
    uploads = (await localforage.getItem("personal-uploads")) || [];
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
