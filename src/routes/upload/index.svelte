<script>
  import Uploader from "../../components/Uploader.svelte";
  import IndexView from "../../components/IndexView.svelte";
  import CollapseInfo from "../../components/CollapseInfo.svelte";
  import TopUploaders from "../../components/TopUploaders.svelte";
  import ActivityHeatmap from "../../components/ActivityHeatmap.svelte";
  import PublicKey from "../../docs/PublicKey.svelte";
  import UploadInstructions from "../../docs/UploadInstructions.svx";
  import { onMount } from "svelte";

  let heatmap;

  async function fetchData(url) {
    let resp = await fetch(url);
    return await resp.json();
  }

  onMount(async () => {
    heatmap = await fetchData("/api/v1/query/heatmap");
  });
</script>

<h1>Upload Owls</h1>

<Uploader />

<CollapseInfo
  component={UploadInstructions}
  componentId="uploadInstructions"
  text="How do I upload?" />

<h2>Top Uploaders</h2>

<p>
  These are the top uploaders for the past week. Your upload position is
  highlighted.
</p>

<CollapseInfo
  component={PublicKey}
  componentId="publicKey"
  text="What is a thumbprint?" />

<TopUploaders />

<h2>Recent Uploads</h2>
<p>
  This shows all recent uploads to the site. Click
  <a href="/personal">here to see your personal upload history.</a>
</p>

<IndexView limit={8} />

{#if heatmap}
  <ActivityHeatmap data={heatmap} max_range={14} />
{/if}
